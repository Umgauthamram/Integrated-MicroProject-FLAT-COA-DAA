"""
api/status.py - Vercel Serverless Function healthcheck & service metadata
"""

from http.server import BaseHTTPRequestHandler
import json
import sys

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        data = {
            'status': 'online',
            'platform': 'Vercel Serverless Python Runtime',
            'python_version': sys.version.split()[0],
            'service': 'Python DAA Dijkstra Optimization API',
            'algorithm': 'Dijkstra with Custom Binary Min-Heap Priority Queue',
            'complexity': 'O((V + E) log V)'
        }
        body = json.dumps(data, indent=2).encode('utf-8')

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)
