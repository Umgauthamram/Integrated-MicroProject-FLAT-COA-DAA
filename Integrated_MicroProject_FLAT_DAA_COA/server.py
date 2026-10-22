"""
server.py - Integrated Python HTTP Server & DAA Dijkstra API Bridge
Connects the Python DAA engine with the JavaScript Frontend (FLAT DFA Lexer & COA Pipeline).

Endpoints:
- GET  /                     -> Serves index.html
- GET  /api/status           -> Healthcheck & Python DAA service info
- GET  /api/dijkstra         -> Compute shortest path via query params (?source=...&target=...)
- POST /api/dijkstra         -> Compute shortest path via JSON body { "source": "...", "target": "..." }
- POST /api/route            -> Compute instruction route { "opcode": "ADD" }
"""

import os
import sys
import json
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler

# Import Python DAA Module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'src', 'modules')))
from daa_dijkstra import DaaDijkstraPython

HOST = '127.0.0.1'
PORT = 8000
solver = DaaDijkstraPython()

class IntegratedRequestHandler(SimpleHTTPRequestHandler):
    """Custom HTTP handler serving static frontend files and Python DAA REST APIs."""

    def end_headers(self):
        # Enable CORS for local cross-origin development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        if path == '/api/status':
            self.send_json_response({
                'status': 'online',
                'service': 'Python DAA Dijkstra Optimization Service',
                'version': '1.0.0',
                'python_version': sys.version.split()[0],
                'algorithm': 'Dijkstra with Custom Min-Heap Priority Queue',
                'complexity': 'O((V + E) log V)'
            })
            return

        elif path == '/api/dijkstra':
            query_params = urllib.parse.parse_qs(parsed_url.query)
            source = query_params.get('source', ['IF_UNIT'])[0]
            target = query_params.get('target', ['WB_BUS'])[0]
            result = solver.find_shortest_path(source, target)
            self.send_json_response(result)
            return

        elif path == '/api/nodes':
            self.send_json_response({
                'nodes': solver.nodes,
                'edges': solver.edges
            })
            return

        # Default: Serve static files from current directory
        return super().do_GET()

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        content_length = int(self.headers.get('Content-Length', 0))
        post_body = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else '{}'
        
        try:
            payload = json.loads(post_body) if post_body else {}
        except json.JSONDecodeError:
            payload = {}

        if path == '/api/dijkstra':
            source = payload.get('source', 'IF_UNIT')
            target = payload.get('target', 'WB_BUS')
            result = solver.find_shortest_path(source, target)
            self.send_json_response(result)
            return

        elif path == '/api/route':
            opcode = payload.get('opcode', 'ADD').upper()
            result = solver.get_instruction_route(opcode)
            self.send_json_response(result)
            return

        else:
            self.send_response(404)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Endpoint not found'}).encode('utf-8'))

    def send_json_response(self, data, status_code=200):
        response_bytes = json.dumps(data, indent=2).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(response_bytes)))
        self.end_headers()
        self.wfile.write(response_bytes)


def run_server(port=PORT):
    # Ensure current directory is the project root
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server_address = (HOST, port)
    httpd = HTTPServer(server_address, IntegratedRequestHandler)
    print(f"================================================================")
    print(f" Integrated FLAT + COA + DAA Simulator Server running at:")
    print(f"   Local:   http://{HOST}:{port}/")
    print(f"   API:     http://{HOST}:{port}/api/status")
    print(f"   DAA:     http://{HOST}:{port}/api/dijkstra?source=IF_UNIT&target=WB_BUS")
    print(f"================================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer shutting down gracefully.")
        httpd.server_close()


if __name__ == '__main__':
    port = PORT
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    run_server(port)
