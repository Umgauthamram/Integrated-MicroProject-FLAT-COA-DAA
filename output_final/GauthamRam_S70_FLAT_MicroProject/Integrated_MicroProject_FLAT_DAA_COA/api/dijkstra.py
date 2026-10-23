"""
api/dijkstra.py - Vercel Serverless Function running Python DAA Dijkstra Engine
Automatically detected and deployed by Vercel for the /api/dijkstra endpoint.
"""

from http.server import BaseHTTPRequestHandler
import json
import urllib.parse
import sys
import os

# Include src/modules in Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src', 'modules')))
from daa_dijkstra import DaaDijkstraPython

solver = DaaDijkstraPython()

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)

        source = params.get('source', ['IF_UNIT'])[0]
        target = params.get('target', ['WB_BUS'])[0]

        result = solver.find_shortest_path(source, target)
        result['backend'] = 'Vercel Serverless Python 3 Engine'

        body = json.dumps(result, indent=2).encode('utf-8')

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        content_len = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_len).decode('utf-8') if content_len > 0 else '{}'

        try:
            payload = json.loads(post_data)
        except Exception:
            payload = {}

        source = payload.get('source', 'IF_UNIT')
        target = payload.get('target', 'WB_BUS')

        result = solver.find_shortest_path(source, target)
        result['backend'] = 'Vercel Serverless Python 3 Engine'

        body = json.dumps(result, indent=2).encode('utf-8')

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)
