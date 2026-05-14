import os
from diskcache import Cache as diskCache

# Detect Vercel environment
IS_VERCEL = os.environ.get('VERCEL') == '1'

class Cache():

    def __init__(self, dir: str, expires: int = None):
        # Vercel only allows writing to /tmp
        if IS_VERCEL:
            if dir.startswith('./'):
                dir = os.path.join('/tmp', dir[2:])
            elif not dir.startswith('/'):
                dir = os.path.join('/tmp', dir)
        
        # Ensure parent directory exists
        os.makedirs(os.path.dirname(dir), exist_ok=True)

        self.cache = diskCache(dir, sqlite_cache_size=50000, disk_min_file_size=0, eviction_policy='least-recently-stored')
        self.expires = expires

    def set(self, key, value):
        self.cache.set(key, value, expire=self.expires)

    def get(self, key, default=None):
        return self.cache.get(key, default)
    
    def get_len(self):
        return len(self)
    
    def clear(self):
        return self.cache.clear()

    def expire(self):
        return self.cache.expire()
    
    def close(self):
        return self.cache.close()
    
    def __len__(self):
        return len(self.cache)
    
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
