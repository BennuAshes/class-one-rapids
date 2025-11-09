"""
Step-level caching service for workflow optimization.

Caches step outputs based on input hash to enable instant retries
and faster development iterations.
"""

import hashlib
import json
import asyncio
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple
from dataclasses import dataclass

from ..utils.file_ops import async_file_exists, async_read_file, async_write_file, async_mkdir


@dataclass
class CacheEntry:
    """Represents a cached step output."""
    step_name: str
    input_hash: str
    output_file: Path
    cached_at: datetime
    hit_count: int = 0
    metadata: Dict[str, Any] = None

    def is_expired(self, max_age_hours: int = 24) -> bool:
        """Check if cache entry is expired."""
        age = datetime.now() - self.cached_at
        return age > timedelta(hours=max_age_hours)


class StepCacheService:
    """
    Manages caching of workflow step outputs.

    Features:
    - Content-based hashing for cache keys
    - Configurable expiration
    - Hit rate tracking
    - Async I/O for performance
    """

    def __init__(self, cache_dir: Path = None, enabled: bool = True, max_age_hours: int = 24):
        """
        Initialize cache service.

        Args:
            cache_dir: Directory for cache storage (default: .workflow-cache)
            enabled: Whether caching is enabled
            max_age_hours: Max age for cache entries before expiration
        """
        self.cache_dir = cache_dir or Path(".workflow-cache")
        self.enabled = enabled
        self.max_age_hours = max_age_hours
        self.stats = {
            "hits": 0,
            "misses": 0,
            "writes": 0
        }

    async def initialize(self):
        """Create cache directory if needed."""
        if self.enabled:
            await async_mkdir(self.cache_dir)

            # Create stats file if it doesn't exist
            stats_file = self.cache_dir / "cache_stats.json"
            if not await async_file_exists(stats_file):
                await self._save_stats()

    def _generate_cache_key(self, step_name: str, input_data: str, config: Dict[str, Any] = None) -> str:
        """
        Generate deterministic cache key based on inputs.

        Args:
            step_name: Name of the workflow step
            input_data: Input content (feature description, PRD, etc.)
            config: Optional configuration affecting output

        Returns:
            Hex string cache key
        """
        hasher = hashlib.sha256()

        # Hash step name
        hasher.update(step_name.encode('utf-8'))

        # Hash input content
        hasher.update(input_data.encode('utf-8'))

        # Hash relevant config (approval mode shouldn't affect cache)
        if config:
            # Only hash config that affects output generation
            relevant_config = {
                k: v for k, v in config.items()
                if k not in ['approval_mode', 'telemetry_enabled', 'webhook_url']
            }
            hasher.update(json.dumps(relevant_config, sort_keys=True).encode('utf-8'))

        return hasher.hexdigest()[:16]  # Use first 16 chars for readability

    async def get(
        self,
        step_name: str,
        input_data: str,
        config: Dict[str, Any] = None
    ) -> Optional[Tuple[str, Dict[str, Any]]]:
        """
        Retrieve cached output for a step.

        Args:
            step_name: Name of the workflow step
            input_data: Input content
            config: Optional configuration

        Returns:
            Tuple of (cached_content, metadata) if hit, None if miss
        """
        if not self.enabled:
            return None

        cache_key = self._generate_cache_key(step_name, input_data, config)
        cache_path = self.cache_dir / step_name.replace(" ", "_") / cache_key

        # Check if cache exists
        output_file = cache_path / "output.md"
        metadata_file = cache_path / "metadata.json"

        if not await async_file_exists(output_file):
            self.stats["misses"] += 1
            await self._save_stats()
            return None

        # Load metadata and check expiration
        if await async_file_exists(metadata_file):
            metadata_content = await async_read_file(metadata_file)
            metadata = json.loads(metadata_content)

            # Check expiration
            cached_at = datetime.fromisoformat(metadata.get("cached_at", "2000-01-01"))
            if (datetime.now() - cached_at) > timedelta(hours=self.max_age_hours):
                self.stats["misses"] += 1
                await self._save_stats()
                print(f"📊 Cache expired for {step_name} (age: {datetime.now() - cached_at})")
                return None

            # Update hit count
            metadata["hit_count"] = metadata.get("hit_count", 0) + 1
            metadata["last_hit"] = datetime.now().isoformat()
            await async_write_file(metadata_file, json.dumps(metadata, indent=2))
        else:
            metadata = {}

        # Load cached content
        content = await async_read_file(output_file)

        self.stats["hits"] += 1
        await self._save_stats()

        hit_count = metadata.get("hit_count", 1)
        print(f"✨ Cache hit for {step_name} (hits: {hit_count}, key: {cache_key})")

        return content, metadata

    async def set(
        self,
        step_name: str,
        input_data: str,
        output_content: str,
        config: Dict[str, Any] = None,
        metadata: Dict[str, Any] = None
    ):
        """
        Cache step output.

        Args:
            step_name: Name of the workflow step
            input_data: Input content
            output_content: Output to cache
            config: Optional configuration
            metadata: Additional metadata to store
        """
        if not self.enabled:
            return

        cache_key = self._generate_cache_key(step_name, input_data, config)
        cache_path = self.cache_dir / step_name.replace(" ", "_") / cache_key

        # Create cache directory
        await async_mkdir(cache_path)

        # Save output
        output_file = cache_path / "output.md"
        await async_write_file(output_file, output_content)

        # Save metadata
        cache_metadata = {
            "step_name": step_name,
            "cache_key": cache_key,
            "cached_at": datetime.now().isoformat(),
            "input_length": len(input_data),
            "output_length": len(output_content),
            "hit_count": 0,
            **(metadata or {})
        }

        metadata_file = cache_path / "metadata.json"
        await async_write_file(metadata_file, json.dumps(cache_metadata, indent=2))

        # Save input for debugging (optional)
        if len(input_data) < 10000:  # Only for reasonable sizes
            input_file = cache_path / "input.md"
            await async_write_file(input_file, input_data)

        self.stats["writes"] += 1
        await self._save_stats()

        print(f"💾 Cached output for {step_name} (key: {cache_key})")

    async def clear(self, step_name: Optional[str] = None):
        """
        Clear cache entries.

        Args:
            step_name: Clear only for specific step, or all if None
        """
        import shutil

        if step_name:
            step_dir = self.cache_dir / step_name.replace(" ", "_")
            if step_dir.exists():
                shutil.rmtree(step_dir)
                print(f"🧹 Cleared cache for {step_name}")
        else:
            if self.cache_dir.exists():
                shutil.rmtree(self.cache_dir)
                await async_mkdir(self.cache_dir)
                print("🧹 Cleared all cache")

        # Reset stats
        self.stats = {"hits": 0, "misses": 0, "writes": 0}
        await self._save_stats()

    async def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        stats_file = self.cache_dir / "cache_stats.json"

        if await async_file_exists(stats_file):
            content = await async_read_file(stats_file)
            self.stats = json.loads(content)

        # Calculate hit rate
        total = self.stats["hits"] + self.stats["misses"]
        hit_rate = (self.stats["hits"] / total * 100) if total > 0 else 0

        return {
            **self.stats,
            "hit_rate": f"{hit_rate:.1f}%",
            "total_requests": total
        }

    async def _save_stats(self):
        """Save statistics to disk."""
        stats_file = self.cache_dir / "cache_stats.json"
        await async_write_file(stats_file, json.dumps(self.stats, indent=2))

    def get_cache_info(self) -> str:
        """Get human-readable cache information."""
        total = self.stats["hits"] + self.stats["misses"]
        hit_rate = (self.stats["hits"] / total * 100) if total > 0 else 0

        return (
            f"Cache Stats: {self.stats['hits']} hits, {self.stats['misses']} misses "
            f"({hit_rate:.1f}% hit rate), {self.stats['writes']} writes"
        )


# Global cache instance (singleton pattern)
_cache_instance: Optional[StepCacheService] = None


async def get_cache_service(
    cache_dir: Path = None,
    enabled: bool = True,
    max_age_hours: int = 24
) -> StepCacheService:
    """
    Get or create the global cache service instance.

    Args:
        cache_dir: Cache directory path
        enabled: Whether caching is enabled
        max_age_hours: Max cache age

    Returns:
        StepCacheService instance
    """
    global _cache_instance

    if _cache_instance is None:
        _cache_instance = StepCacheService(cache_dir, enabled, max_age_hours)
        await _cache_instance.initialize()

    return _cache_instance