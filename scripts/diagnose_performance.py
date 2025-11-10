#!/usr/bin/env python3
"""
Performance Diagnostic Tool for WSL/Windows Workflow Issues

Tests various performance aspects to identify bottlenecks:
- File I/O operations
- Subprocess creation
- Git operations
- asyncio event loop behavior
- WSL-specific issues
"""

import asyncio
import subprocess
import time
import sys
import os
from pathlib import Path
import json

# Colors for output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.END}\n")

def print_result(test_name, duration, status="OK", details=""):
    color = Colors.GREEN if status == "OK" else Colors.RED if status == "SLOW" else Colors.YELLOW
    print(f"{test_name:.<50} {color}{duration:>8.3f}s{Colors.END} [{status}]")
    if details:
        print(f"  {Colors.CYAN}{details}{Colors.END}")

async def test_file_io():
    """Test file I/O performance"""
    print_header("File I/O Performance Tests")

    test_dir = Path("workflow-outputs/perf-test")
    test_dir.mkdir(parents=True, exist_ok=True)

    # Test 1: Sequential writes
    start = time.time()
    for i in range(10):
        file = test_dir / f"test_{i}.txt"
        file.write_text("x" * 1000)
    write_time = time.time() - start
    print_result("10 sequential file writes (1KB each)", write_time,
                 "OK" if write_time < 0.5 else "SLOW")

    # Test 2: Sequential reads
    start = time.time()
    for i in range(10):
        file = test_dir / f"test_{i}.txt"
        _ = file.read_text()
    read_time = time.time() - start
    print_result("10 sequential file reads", read_time,
                 "OK" if read_time < 0.1 else "SLOW")

    # Test 3: JSON operations
    start = time.time()
    for i in range(5):
        file = test_dir / f"test_{i}.json"
        data = {"index": i, "data": ["item" * 10] * 10}
        file.write_text(json.dumps(data))
    json_write = time.time() - start
    print_result("5 JSON writes", json_write,
                 "OK" if json_write < 0.5 else "SLOW")

    # Cleanup
    for file in test_dir.glob("*"):
        file.unlink()
    test_dir.rmdir()

    return {"write": write_time, "read": read_time, "json": json_write}

async def test_subprocess():
    """Test subprocess creation performance"""
    print_header("Subprocess Performance Tests")

    # Test 1: Simple echo commands
    start = time.time()
    for i in range(5):
        proc = await asyncio.create_subprocess_exec(
            "echo", "test",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        await proc.communicate()
    echo_time = time.time() - start
    print_result("5 echo subprocess calls", echo_time,
                 "OK" if echo_time < 0.5 else "SLOW",
                 f"Average: {echo_time/5:.3f}s per call")

    # Test 2: Python subprocess
    start = time.time()
    for i in range(3):
        proc = await asyncio.create_subprocess_exec(
            sys.executable, "-c", "print('test')",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        await proc.communicate()
    python_time = time.time() - start
    print_result("3 Python subprocess calls", python_time,
                 "OK" if python_time < 1.0 else "SLOW",
                 f"Average: {python_time/3:.3f}s per call")

    return {"echo": echo_time, "python": python_time}

async def test_git_operations():
    """Test git operation performance"""
    print_header("Git Operations Performance")

    test_dir = Path("workflow-outputs/perf-test-git")
    test_dir.mkdir(parents=True, exist_ok=True)

    # Initialize git repo
    subprocess.run(["git", "init"], cwd=test_dir, capture_output=True)

    # Test 1: git status
    start = time.time()
    for i in range(5):
        proc = await asyncio.create_subprocess_exec(
            "git", "status", "--porcelain",
            cwd=test_dir,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        await proc.communicate()
    status_time = time.time() - start
    print_result("5 git status calls", status_time,
                 "OK" if status_time < 0.5 else "SLOW",
                 f"Average: {status_time/5:.3f}s per call")

    # Test 2: Create file and git add
    test_file = test_dir / "test.txt"
    test_file.write_text("test content")

    start = time.time()
    proc = await asyncio.create_subprocess_exec(
        "git", "add", "test.txt",
        cwd=test_dir,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )
    await proc.communicate()
    add_time = time.time() - start
    print_result("git add single file", add_time,
                 "OK" if add_time < 0.2 else "SLOW")

    # Cleanup
    subprocess.run(["rm", "-rf", str(test_dir)], capture_output=True)

    return {"status": status_time, "add": add_time}

async def test_asyncio_overhead():
    """Test asyncio event loop overhead"""
    print_header("Asyncio Event Loop Performance")

    # Test 1: asyncio.sleep accuracy
    sleep_times = []
    for duration in [0.001, 0.01, 0.1]:
        start = time.time()
        await asyncio.sleep(duration)
        actual = time.time() - start
        sleep_times.append((duration, actual))
        overhead = (actual - duration) * 1000
        status = "OK" if overhead < 5 else "SLOW"
        print_result(f"asyncio.sleep({duration}s)", actual, status,
                     f"Overhead: {overhead:.2f}ms")

    # Test 2: Event loop task scheduling
    async def dummy_task():
        await asyncio.sleep(0.001)
        return True

    start = time.time()
    tasks = [dummy_task() for _ in range(10)]
    await asyncio.gather(*tasks)
    gather_time = time.time() - start
    print_result("10 concurrent asyncio tasks", gather_time,
                 "OK" if gather_time < 0.5 else "SLOW")

    # Test 3: Empty event loop iterations
    start = time.time()
    for i in range(100):
        await asyncio.sleep(0)  # Yield to event loop
    yield_time = time.time() - start
    print_result("100 event loop yields", yield_time,
                 "OK" if yield_time < 0.1 else "SLOW",
                 f"Average: {yield_time/100*1000:.2f}ms per yield")

    return {"sleep": sleep_times, "gather": gather_time, "yield": yield_time}

def test_system_info():
    """Gather system information"""
    print_header("System Information")

    # WSL version
    wsl_version = "Unknown"
    try:
        result = subprocess.run(["wsl.exe", "-l", "-v"], capture_output=True, text=True)
        if result.returncode == 0:
            # Parse WSL version from output
            lines = result.stdout.split('\n')
            for line in lines:
                if 'Ubuntu' in line or 'Debian' in line:
                    if 'VERSION 2' in line or '2' in line:
                        wsl_version = "WSL2"
                    elif 'VERSION 1' in line or '1' in line:
                        wsl_version = "WSL1"
    except:
        pass

    print(f"WSL Version: {Colors.CYAN}{wsl_version}{Colors.END}")

    # Filesystem type
    cwd = Path.cwd()
    is_windows_mount = str(cwd).startswith('/mnt/')
    fs_type = "Windows FS (via /mnt/)" if is_windows_mount else "Native Linux FS"
    color = Colors.RED if is_windows_mount else Colors.GREEN
    print(f"Filesystem: {color}{fs_type}{Colors.END}")
    print(f"Current Path: {Colors.CYAN}{cwd}{Colors.END}")

    # Python version
    print(f"Python: {Colors.CYAN}{sys.version.split()[0]}{Colors.END}")

    # Check if Windows Defender is active (indirect check)
    defender_active = "Unknown"
    try:
        # Check if MpCmdRun.exe exists (Defender command-line tool)
        result = subprocess.run(
            ["powershell.exe", "-Command", "Get-MpComputerStatus | Select-Object -ExpandProperty RealTimeProtectionEnabled"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            defender_active = "Yes" if "True" in result.stdout else "No"
    except:
        pass

    color = Colors.YELLOW if defender_active == "Yes" else Colors.GREEN
    print(f"Windows Defender Real-Time Protection: {color}{defender_active}{Colors.END}")

    return {
        "wsl_version": wsl_version,
        "filesystem": fs_type,
        "windows_mount": is_windows_mount,
        "defender_active": defender_active
    }

async def test_workflow_simulation():
    """Simulate actual workflow operations"""
    print_header("Workflow Simulation Test")

    print(f"{Colors.YELLOW}Simulating 5-step workflow with mock operations...{Colors.END}\n")

    test_dir = Path("workflow-outputs/perf-workflow-sim")
    test_dir.mkdir(parents=True, exist_ok=True)

    # Initialize git
    subprocess.run(["git", "init"], cwd=test_dir, capture_output=True)

    step_times = []
    total_start = time.time()

    for step_num in range(1, 6):
        step_start = time.time()

        # Simulate step operations
        # 1. Mock LLM call (0.05s sleep)
        await asyncio.sleep(0.05)

        # 2. Write output file
        output_file = test_dir / f"step_{step_num}.md"
        output_file.write_text(f"# Step {step_num}\n\nMock content\n" * 20)

        # 3. Git operations (if not last step)
        if step_num < 6:
            proc = await asyncio.create_subprocess_exec(
                "git", "status", "--porcelain",
                cwd=test_dir,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            await proc.communicate()

            proc = await asyncio.create_subprocess_exec(
                "git", "diff", "HEAD",
                cwd=test_dir,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            await proc.communicate()

        # 4. Save state JSON
        state_file = test_dir / "state.json"
        state_file.write_text(json.dumps({
            "step": step_num,
            "status": "completed",
            "timestamp": time.time()
        }))

        step_time = time.time() - step_start
        step_times.append(step_time)

        status = "OK" if step_time < 1.0 else "SLOW"
        print_result(f"Step {step_num}", step_time, status)

    total_time = time.time() - total_start

    print(f"\n{Colors.BOLD}Total Time: {total_time:.3f}s{Colors.END}")
    avg_time = sum(step_times) / len(step_times)
    print(f"{Colors.BOLD}Average per step: {avg_time:.3f}s{Colors.END}")

    # Cleanup
    subprocess.run(["rm", "-rf", str(test_dir)], capture_output=True)

    return {"total": total_time, "average": avg_time, "steps": step_times}

def analyze_results(results):
    """Analyze results and provide recommendations"""
    print_header("Analysis & Recommendations")

    issues = []
    recommendations = []

    # Check file I/O
    if results["file_io"]["write"] > 0.5:
        issues.append("Slow file write performance")
        recommendations.append("Consider moving to native Linux filesystem (~/ instead of /mnt/c/)")

    # Check subprocess
    if results["subprocess"]["python"] > 1.0:
        issues.append("Slow Python subprocess creation")
        recommendations.append("Add Python to Windows Defender exclusions")

    # Check git
    if results["git"]["status"] > 0.5:
        issues.append("Slow git operations")
        recommendations.append("Add git.exe to Windows Defender exclusions")

    # Check asyncio
    if results["asyncio"]["yield"] > 0.1:
        issues.append("High asyncio event loop overhead")
        recommendations.append("This suggests external process interference (likely Windows Defender)")

    # Check workflow simulation
    if results["workflow_sim"]["average"] > 2.0:
        issues.append("Slow workflow simulation (should be <1s per step)")
        recommendations.append("Critical: Review all recommendations below")

    # WSL-specific checks
    if results["system"]["windows_mount"]:
        issues.append("Running on Windows filesystem via /mnt/")
        recommendations.append("HIGHEST IMPACT: Move repository to native Linux filesystem for 5-10x speedup")

    if results["system"]["wsl_version"] == "WSL1":
        issues.append("Using WSL1 (slower than WSL2)")
        recommendations.append("Upgrade to WSL2: wsl --set-version Ubuntu 2")

    if results["system"]["defender_active"] == "Yes":
        issues.append("Windows Defender real-time protection is active")
        recommendations.append("Add exclusions: workflow-outputs/, Python, git")

    # Print issues
    if issues:
        print(f"{Colors.RED}{Colors.BOLD}Issues Detected:{Colors.END}")
        for issue in issues:
            print(f"  {Colors.RED}⚠{Colors.END} {issue}")
    else:
        print(f"{Colors.GREEN}{Colors.BOLD}✓ No major issues detected{Colors.END}")

    # Print recommendations
    if recommendations:
        print(f"\n{Colors.YELLOW}{Colors.BOLD}Recommendations:{Colors.END}")
        for i, rec in enumerate(recommendations, 1):
            print(f"  {Colors.YELLOW}{i}.{Colors.END} {rec}")

    # Performance score
    print(f"\n{Colors.BOLD}Performance Score:{Colors.END}")
    score = 100
    score -= min(len(issues) * 15, 70)
    if results["workflow_sim"]["average"] > 5.0:
        score -= 20
    elif results["workflow_sim"]["average"] > 2.0:
        score -= 10

    color = Colors.GREEN if score >= 70 else Colors.YELLOW if score >= 40 else Colors.RED
    print(f"{color}{Colors.BOLD}{score}/100{Colors.END}")

async def main():
    print(f"{Colors.BOLD}{Colors.CYAN}")
    print("╔════════════════════════════════════════════════════════════════════════╗")
    print("║              Workflow Performance Diagnostic Tool                     ║")
    print("║                                                                        ║")
    print("║  This tool diagnoses performance issues in WSL/Windows environments   ║")
    print("╚════════════════════════════════════════════════════════════════════════╝")
    print(f"{Colors.END}\n")

    results = {}

    try:
        # System info first
        results["system"] = test_system_info()

        # Run tests
        results["file_io"] = await test_file_io()
        results["subprocess"] = await test_subprocess()
        results["git"] = await test_git_operations()
        results["asyncio"] = await test_asyncio_overhead()
        results["workflow_sim"] = await test_workflow_simulation()

        # Analyze
        analyze_results(results)

        # Save detailed results
        results_file = Path("performance-diagnostic-results.json")
        # Convert Path objects to strings for JSON serialization
        json_results = {
            k: {
                kk: str(vv) if isinstance(vv, Path) else vv
                for kk, vv in v.items()
            } if isinstance(v, dict) else v
            for k, v in results.items()
        }
        results_file.write_text(json.dumps(json_results, indent=2))
        print(f"\n{Colors.CYAN}Detailed results saved to: {results_file}{Colors.END}")

    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Diagnostic interrupted by user{Colors.END}")
    except Exception as e:
        print(f"\n{Colors.RED}Error during diagnostic: {e}{Colors.END}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
