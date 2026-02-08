"""
Netlify serverless function - wraps FastAPI app with Mangum.
All API, auth, and health routes are proxied here via netlify.toml redirects.
"""
import sys
from pathlib import Path

# Ensure project root is on path (for imports when running on Netlify)
_root = Path(__file__).resolve().parent.parent.parent
if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))

from main import app
from mangum import Mangum

handler = Mangum(app, lifespan="off")
