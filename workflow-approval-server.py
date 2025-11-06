#!/usr/bin/env python3
"""
Workflow Approval API Server
Provides REST API for workflow approval management

Usage:
    python3 workflow-approval-server.py [port]

API Endpoints:
    GET  /workflows                     - List all workflows
    GET  /workflows/{id}                - Get workflow details
    GET  /workflows/{id}/approvals      - Get pending approvals for workflow
    POST /approvals/approve             - Approve a request (body: {file_path: "..."})
    POST /approvals/reject              - Reject a request (body: {file_path: "...", reason: "..."})
    POST /approvals/feedback            - Submit feedback (body: {file_path: "...", feedback: {...}})
    GET  /approvals/pending             - Get all pending approvals
    GET  /events                        - SSE endpoint for real-time updates
"""

import json
import os
import sys
import time
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs
import threading

# Try to import Langfuse for tracking approvals
try:
    from langfuse import Langfuse
    LANGFUSE_AVAILABLE = True
    
    # Initialize Langfuse client if env vars are set
    if all(os.getenv(key) for key in ["LANGFUSE_PUBLIC_KEY", "LANGFUSE_SECRET_KEY"]):
        langfuse_client = Langfuse(
            public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
            secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
            host=os.getenv("LANGFUSE_HOST", "http://localhost:3000"),
        )
    else:
        langfuse_client = None
        LANGFUSE_AVAILABLE = False
except ImportError:
    LANGFUSE_AVAILABLE = False
    langfuse_client = None

# Default configuration
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
WORKFLOW_DIR = Path("./workflow-outputs")
CACHE_TTL = 1.0  # Cache time-to-live in seconds

class CachedResult:
    """Simple cache with TTL"""
    def __init__(self, ttl: float = CACHE_TTL):
        self.ttl = ttl
        self.cache = {}
        self.timestamps = {}
        self.lock = threading.Lock()
    
    def get(self, key: str):
        """Get cached value if not expired"""
        with self.lock:
            if key in self.cache:
                if time.time() - self.timestamps[key] < self.ttl:
                    return self.cache[key]
                else:
                    # Expired - remove from cache
                    del self.cache[key]
                    del self.timestamps[key]
            return None
    
    def set(self, key: str, value):
        """Set cached value"""
        with self.lock:
            self.cache[key] = value
            self.timestamps[key] = time.time()
    
    def invalidate(self, key: str = None):
        """Invalidate cache entry or entire cache"""
        with self.lock:
            if key:
                self.cache.pop(key, None)
                self.timestamps.pop(key, None)
            else:
                self.cache.clear()
                self.timestamps.clear()

# Global cache instance
_cache = CachedResult(ttl=CACHE_TTL)

def track_approval_in_langfuse(execution_id: str, checkpoint: str, status: str, duration_seconds: float, reason: Optional[str] = None):
    """
    Track approval decision in Langfuse
    
    Args:
        execution_id: Workflow execution ID
        checkpoint: Name of checkpoint (e.g., "PRD", "Design")
        status: "approved" or "rejected"
        duration_seconds: Time spent in approval
        reason: Optional rejection reason
    """
    if not LANGFUSE_AVAILABLE or not langfuse_client:
        return
    
    try:
        # Get trace for this execution
        trace = langfuse_client.trace(
            name="workflow-approval",
            session_id=execution_id,
        )
        
        # Create span for approval checkpoint
        span = trace.span(
            name=f"Approval: {checkpoint}",
            metadata={
                "checkpoint": checkpoint,
                "status": status,
                "duration_seconds": duration_seconds,
                "reason": reason,
                "timestamp": datetime.now().isoformat(),
                "tracked_by": "approval-server"
            }
        )
        
        span.end()
        
        # Also add a score for the approval decision
        langfuse_client.score(
            trace_id=execution_id,
            name=f"approval_{checkpoint.lower().replace(' ', '_')}",
            value=1.0 if status == "approved" else 0.0,
            comment=reason if reason else f"{checkpoint} {status}",
            data_type="NUMERIC"
        )
        
        langfuse_client.flush()
        print(f"[LANGFUSE] Tracked approval: {checkpoint} = {status}")
    except Exception as e:
        print(f"[LANGFUSE] Warning: Failed to track approval: {e}")


class WorkflowManager:
    """Manages workflow and approval operations"""

    @staticmethod
    def list_workflows() -> List[Dict]:
        """List all workflows with their status (cached)"""
        # Check cache first
        cached = _cache.get("workflows_list")
        if cached is not None:
            return cached
        
        workflows = []

        if not WORKFLOW_DIR.exists():
            return workflows

        for exec_dir in WORKFLOW_DIR.iterdir():
            if exec_dir.is_dir():
                status_file = exec_dir / "workflow-status.json"
                if status_file.exists():
                    try:
                        with open(status_file, encoding='utf-8') as f:
                            status_data = json.load(f)
                            status = status_data.get("status", "unknown")
                            
                            # If status is "awaiting_approval", check if there are actually pending approvals
                            if status == "awaiting_approval":
                                has_pending = False
                                for approval_file in exec_dir.glob(".approval_*.json"):
                                    response_file = Path(str(approval_file) + ".response")
                                    if not response_file.exists():
                                        # Found an approval without a response
                                        has_pending = True
                                        break
                                
                                # If no actual pending approvals, mark as processing
                                if not has_pending:
                                    status = "processing"
                            
                            workflows.append({
                                "execution_id": exec_dir.name,
                                "status": status,
                                "started_at": status_data.get("started_at"),
                                "current_step": status_data.get("current_step"),
                                "approval_mode": status_data.get("approval_mode"),
                                "directory": str(exec_dir)
                            })
                    except json.JSONDecodeError as e:
                        # Skip malformed JSON files silently
                        pass
                    except Exception as e:
                        # Log other errors but continue
                        pass

        # Sort by started_at, handling None values (put them at the end)
        result = sorted(workflows, key=lambda x: x["started_at"] or "", reverse=True)
        
        # Cache the result
        _cache.set("workflows_list", result)
        return result

    @staticmethod
    def get_workflow(execution_id: str) -> Optional[Dict]:
        """Get detailed workflow information"""
        exec_dir = WORKFLOW_DIR / execution_id

        if not exec_dir.exists():
            return None

        workflow = {"execution_id": execution_id}

        # Load status
        status_file = exec_dir / "workflow-status.json"
        if status_file.exists():
            try:
                with open(status_file, encoding='utf-8') as f:
                    workflow["status"] = json.load(f)
            except (json.JSONDecodeError, Exception):
                workflow["status"] = {"error": "Failed to load status"}

        # Load approvals
        workflow["approvals"] = []
        for approval_file in exec_dir.glob(".approval_*.json"):
            try:
                with open(approval_file, encoding='utf-8') as f:
                    approval_data = json.load(f)
                    approval_data["file_path"] = str(approval_file)
                    workflow["approvals"].append(approval_data)
            except (json.JSONDecodeError, Exception):
                # Skip malformed approval files
                pass

        # List generated files
        workflow["files"] = []
        for md_file in exec_dir.glob("*.md"):
            workflow["files"].append({
                "name": md_file.name,
                "size": md_file.stat().st_size,
                "path": str(md_file)
            })

        return workflow

    @staticmethod
    def get_pending_approvals() -> List[Dict]:
        """Get all pending approval requests (cached)"""
        # Check cache first
        cached = _cache.get("pending_approvals")
        if cached is not None:
            return cached
        
        pending = []

        if not WORKFLOW_DIR.exists():
            return pending

        # Use a more efficient approach on Windows - iterate directories first
        try:
            for exec_dir in WORKFLOW_DIR.iterdir():
                if not exec_dir.is_dir():
                    continue
                # Look for approval files in this specific directory
                for approval_file in exec_dir.glob(".approval_*.json"):
                    try:
                        # Check if a response file exists - if so, skip this approval
                        response_file = Path(str(approval_file) + ".response")
                        if response_file.exists():
                            continue  # Already has a response, not pending
                        
                        with open(approval_file, encoding='utf-8') as f:
                            data = json.load(f)
                            if data.get("status") == "pending":
                                data["file_path"] = str(approval_file)
                                data["execution_id"] = exec_dir.name
                                pending.append(data)
                    except json.JSONDecodeError as e:
                        # Log malformed JSON files for debugging
                        print(f"[WARNING] Malformed approval file: {approval_file} - {e}")
                    except Exception as e:
                        # Log other errors
                        print(f"[WARNING] Error reading approval file {approval_file}: {e}")
        except Exception:
            pass

        # Cache the result
        _cache.set("pending_approvals", pending)
        return pending

    @staticmethod
    def approve_request(approval_file: str) -> bool:
        """Approve a pending request"""
        try:
            approval_path = Path(approval_file)
            print(f"[APPROVE] Processing: {approval_path}")

            # Check if file exists
            if not approval_path.exists():
                print(f"[APPROVE] ERROR: File not found: {approval_path}")
                return False

            # Check if request is pending and extract metadata
            with open(approval_path, encoding='utf-8') as f:
                data = json.load(f)
                status = data.get("status")
                print(f"[APPROVE] Current status: {status}")
                if status != "pending":
                    print(f"[APPROVE] ERROR: Request is not pending (status: {status})")
                    return False
                
                # Extract metadata for Langfuse tracking
                execution_id = data.get("execution_id", "unknown")
                checkpoint = data.get("checkpoint", "Unknown")
                created_at = data.get("timestamp", datetime.now().isoformat())

            # Calculate duration
            try:
                created_time = datetime.fromisoformat(created_at)
                duration_seconds = (datetime.now() - created_time).total_seconds()
            except:
                duration_seconds = 0.0

            # Create response file - append .response to full filename
            response_file = Path(str(approval_path) + ".response")
            print(f"[APPROVE] Creating response file: {response_file}")
            
            with open(response_file, 'w', encoding='utf-8') as f:
                json.dump({
                    "status": "approved",
                    "timestamp": datetime.now().isoformat()
                }, f)

            print(f"[APPROVE] ✓ Successfully created: {response_file}")

            # Track in Langfuse
            track_approval_in_langfuse(
                execution_id=execution_id,
                checkpoint=checkpoint,
                status="approved",
                duration_seconds=duration_seconds
            )

            # Invalidate caches since approval state changed
            _cache.invalidate("pending_approvals")
            _cache.invalidate("workflows_list")

            return True
        except Exception as e:
            print(f"[APPROVE] ERROR: {e}")
            import traceback
            traceback.print_exc()
            return False

    @staticmethod
    def reject_request(approval_file: str, reason: str = "Rejected via API", feedback: Optional[Dict] = None) -> bool:
        """Reject a pending request with optional structured feedback"""
        try:
            approval_path = Path(approval_file)
            print(f"[REJECT] Processing: {approval_path}")

            # Check if file exists
            if not approval_path.exists():
                print(f"[REJECT] ERROR: File not found: {approval_path}")
                return False

            # Check if request is pending and extract metadata
            with open(approval_path, encoding='utf-8') as f:
                data = json.load(f)
                status = data.get("status")
                print(f"[REJECT] Current status: {status}")
                if status != "pending":
                    print(f"[REJECT] ERROR: Request is not pending (status: {status})")
                    return False

                # Extract metadata for Langfuse tracking
                execution_id = data.get("execution_id", "unknown")
                checkpoint = data.get("checkpoint", "Unknown")
                created_at = data.get("timestamp", datetime.now().isoformat())

            # Calculate duration
            try:
                created_time = datetime.fromisoformat(created_at)
                duration_seconds = (datetime.now() - created_time).total_seconds()
            except:
                duration_seconds = 0.0

            # Create response file - append .response to full filename
            response_file = Path(str(approval_path) + ".response")
            print(f"[REJECT] Creating response file: {response_file}")

            response_data = {
                "status": "rejected",
                "reason": reason,
                "timestamp": datetime.now().isoformat()
            }

            # Add structured feedback if provided
            if feedback:
                response_data["feedback"] = feedback
                response_data["specific_issues"] = feedback.get("specific_issues")
                response_data["missing_elements"] = feedback.get("missing_elements")
                response_data["suggested_improvements"] = feedback.get("suggested_improvements")
                response_data["rating"] = feedback.get("rating")
                print(f"[REJECT] Including structured feedback: {list(feedback.keys())}")

            with open(response_file, 'w', encoding='utf-8') as f:
                json.dump(response_data, f, indent=2)

            print(f"[REJECT] ✓ Successfully created: {response_file}")

            # Track in Langfuse with enhanced metadata if feedback provided
            langfuse_metadata = {
                "reason": reason
            }
            if feedback:
                langfuse_metadata["has_feedback"] = True
                langfuse_metadata["rating"] = feedback.get("rating")
                langfuse_metadata["feedback_type"] = "structured"

            track_approval_in_langfuse(
                execution_id=execution_id,
                checkpoint=checkpoint,
                status="rejected",
                duration_seconds=duration_seconds,
                reason=str(langfuse_metadata)
            )

            # Save separate feedback file for easier processing
            if feedback:
                feedback_file = approval_path.parent / f".feedback_{checkpoint.replace(' ', '_')}.json"
                with open(feedback_file, 'w', encoding='utf-8') as f:
                    json.dump({
                        "checkpoint": checkpoint,
                        "execution_id": execution_id,
                        "timestamp": datetime.now().isoformat(),
                        "feedback": feedback
                    }, f, indent=2)
                print(f"[REJECT] Saved feedback to: {feedback_file}")

            # Invalidate caches since approval state changed
            _cache.invalidate("pending_approvals")
            _cache.invalidate("workflows_list")

            return True
        except Exception as e:
            print(f"[REJECT] ERROR: {e}")
            import traceback
            traceback.print_exc()
            return False

class ApprovalAPIHandler(BaseHTTPRequestHandler):
    """HTTP request handler for the approval API"""

    def send_json_response(self, data: any, status: int = 200):
        """Send JSON response"""
        try:
            self.send_response(status)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(data, default=str).encode())
        except (ConnectionAbortedError, BrokenPipeError, ConnectionResetError):
            # Client closed connection - this is normal for polling clients
            pass

    def send_error_response(self, message: str, status: int = 400):
        """Send error response"""
        self.send_json_response({"error": message}, status)

    def send_html_file(self, file_path: Path):
        """Send HTML file"""
        try:
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            with open(file_path, 'rb') as f:
                self.wfile.write(f.read())
        except Exception as e:
            print(f"[ERROR] Failed to serve HTML: {e}")
            self.send_error_response(f"Failed to serve HTML: {str(e)}", 500)

    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        # Root endpoint - Serve HTML UI
        if path == "/" or path == "":
            ui_file = Path(__file__).parent / "workflow-approval-ui.html"
            if ui_file.exists():
                self.send_html_file(ui_file)
            else:
                self.send_error_response("UI file not found", 404)

        # API information endpoint
        elif path == "/api" or path == "/api/":
            self.send_json_response({
                "name": "Workflow Approval API Server",
                "version": "1.0.0",
                "status": "running",
                "endpoints": {
                    "workflows": {
                        "GET /workflows": "List all workflows",
                        "GET /workflows/{id}": "Get workflow details",
                        "GET /workflows/{id}/approvals": "Get workflow approvals"
                    },
                    "approvals": {
                        "GET /approvals/pending": "Get all pending approvals",
                        "POST /approvals/approve": "Approve a request (body: {file_path: '...'})",
                        "POST /approvals/reject": "Reject a request (body: {file_path: '...', reason: '...', feedback: {...}})",
                        "POST /approvals/feedback": "Submit feedback (body: {file_path: '...', feedback: {...}})"
                    },
                    "files": {
                        "GET /files/read?path={path}": "Read file contents"
                    },
                    "realtime": {
                        "GET /events": "Server-Sent Events for real-time updates"
                    },
                    "system": {
                        "GET /health": "Health check"
                    }
                },
                "documentation": "See README.md for detailed API documentation"
            })

        # List all workflows
        elif path == "/workflows":
            workflows = WorkflowManager.list_workflows()
            self.send_json_response(workflows)

        # Get specific workflow
        elif path.startswith("/workflows/") and not path.endswith("/approvals"):
            execution_id = path.split("/")[2]
            workflow = WorkflowManager.get_workflow(execution_id)
            if workflow:
                self.send_json_response(workflow)
            else:
                self.send_error_response("Workflow not found", 404)

        # Get workflow approvals
        elif path.endswith("/approvals") and path.startswith("/workflows/"):
            execution_id = path.split("/")[2]
            workflow = WorkflowManager.get_workflow(execution_id)
            if workflow:
                self.send_json_response(workflow.get("approvals", []))
            else:
                self.send_error_response("Workflow not found", 404)

        # Get all pending approvals
        elif path == "/approvals/pending":
            pending = WorkflowManager.get_pending_approvals()
            self.send_json_response(pending)

        # Server-Sent Events for real-time updates
        elif path == "/events":
            try:
                self.send_response(200)
                self.send_header('Content-Type', 'text/event-stream')
                self.send_header('Cache-Control', 'no-cache')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()

                # Send updates every 2 seconds
                while True:
                    pending = WorkflowManager.get_pending_approvals()
                    event_data = json.dumps({
                        "pending_count": len(pending),
                        "pending": pending[:5]  # Send first 5 pending
                    })
                    self.wfile.write(f"data: {event_data}\n\n".encode())
                    self.wfile.flush()
                    time.sleep(2)
            except (ConnectionAbortedError, BrokenPipeError, ConnectionResetError):
                pass  # Client disconnected - this is normal

        # Read file contents
        elif path == "/files/read":
            # Get file path from query parameter
            query_params = parse_qs(parsed_path.query)
            file_path_param = query_params.get('path', [None])[0]

            if not file_path_param:
                self.send_error_response("Missing 'path' query parameter", 400)
                return

            try:
                # Resolve the file path
                file_path = Path(file_path_param)

                # Security: Only allow reading files within workflow directory or if absolute path exists
                if not file_path.is_absolute():
                    file_path = WORKFLOW_DIR / file_path

                if not file_path.exists():
                    self.send_error_response(f"File not found: {file_path}", 404)
                    return

                if not file_path.is_file():
                    self.send_error_response(f"Not a file: {file_path}", 400)
                    return

                # Read file contents
                with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
                    content = f.read()

                # Return file info and content
                self.send_json_response({
                    "success": True,
                    "file_path": str(file_path),
                    "size": file_path.stat().st_size,
                    "content": content
                })

            except Exception as e:
                print(f"[ERROR] Failed to read file: {e}")
                self.send_error_response(f"Failed to read file: {str(e)}", 500)

        # Health check
        elif path == "/health":
            self.send_json_response({"status": "healthy", "port": PORT})

        else:
            self.send_error_response("Not found", 404)

    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        # Read request body
        content_length = int(self.headers.get('Content-Length', 0))
        body = None
        if content_length > 0:
            try:
                body = self.rfile.read(content_length).decode('utf-8')
                body = json.loads(body)
            except Exception as e:
                self.send_error_response(f"Invalid JSON body: {e}", 400)
                return

        # Approve request
        if path == "/approvals/approve":
            if not body or 'file_path' not in body:
                self.send_error_response("Missing 'file_path' in request body", 400)
                return
                
            file_path = body['file_path']
            print(f"\n[API] Approve request received for: {file_path}")
            
            if WorkflowManager.approve_request(file_path):
                self.send_json_response({"success": True, "message": "Request approved"})
            else:
                self.send_error_response(f"Failed to approve request: {file_path}", 400)

        # Reject request
        elif path == "/approvals/reject":
            if not body or 'file_path' not in body:
                self.send_error_response("Missing 'file_path' in request body", 400)
                return

            file_path = body['file_path']
            reason = body.get('reason', 'Rejected via API')
            feedback = body.get('feedback', None)
            print(f"\n[API] Reject request received for: {file_path}")
            print(f"[API] Reason: {reason}")
            if feedback:
                print(f"[API] With structured feedback: {list(feedback.keys())}")

            if WorkflowManager.reject_request(file_path, reason, feedback):
                self.send_json_response({"success": True, "message": "Request rejected with feedback" if feedback else "Request rejected"})
            else:
                self.send_error_response(f"Failed to reject request: {file_path}", 400)

        # Submit feedback (similar to reject but with richer feedback data)
        elif path == "/approvals/feedback":
            if not body or 'file_path' not in body:
                self.send_error_response("Missing 'file_path' in request body", 400)
                return

            if 'feedback' not in body:
                self.send_error_response("Missing 'feedback' object in request body", 400)
                return

            file_path = body['file_path']
            feedback = body['feedback']
            reason = feedback.get('summary', 'Feedback provided via API')

            print(f"\n[API] Feedback submission received for: {file_path}")
            print(f"[API] Feedback fields: {list(feedback.keys())}")

            # Use reject_request with structured feedback
            if WorkflowManager.reject_request(file_path, reason, feedback):
                self.send_json_response({
                    "success": True,
                    "message": "Feedback submitted successfully",
                    "feedback_saved": True
                })
            else:
                self.send_error_response(f"Failed to submit feedback: {file_path}", 400)

        else:
            self.send_error_response("Not found", 404)

    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def log_message(self, format, *args):
        """Override to customize logging"""
        sys.stderr.write(f"[{datetime.now().strftime('%H:%M:%S')}] {format % args}\n")
    
    def handle(self):
        """Handle requests with proper connection error handling"""
        try:
            super().handle()
        except (ConnectionAbortedError, BrokenPipeError, ConnectionResetError):
            # Client closed connection - ignore silently
            pass

def main():
    """Start the API server"""
    print(f"""
╔════════════════════════════════════════╗
║   Workflow Approval API Server        ║
║   (Multi-threaded with caching)       ║
╠════════════════════════════════════════╣
║   Port: {PORT:<30} ║
║   URL:  http://localhost:{PORT:<14} ║
║   Cache TTL: {CACHE_TTL}s{" " * 22} ║
╚════════════════════════════════════════╝

API Endpoints:
  GET  /workflows                  - List all workflows
  GET  /workflows/{{id}}             - Get workflow details
  GET  /workflows/{{id}}/approvals   - Get workflow approvals
  GET  /approvals/pending          - Get all pending approvals
  POST /approvals/approve          - Approve a request (JSON body)
  POST /approvals/reject           - Reject a request (JSON body)
  POST /approvals/feedback         - Submit feedback (JSON body with feedback object)
  GET  /events                     - Real-time updates (SSE)
  GET  /health                     - Health check

Performance optimizations:
  - Multi-threaded request handling
  - Response caching with {CACHE_TTL}s TTL
  - Optimized file system operations for Windows

Press Ctrl+C to stop the server.
    """)

    # Use ThreadingHTTPServer for multi-threaded request handling
    server = ThreadingHTTPServer(('', PORT), ApprovalAPIHandler)
    server.daemon_threads = True  # Allow server to exit even with active threads

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        server.shutdown()

if __name__ == "__main__":
    main()