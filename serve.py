from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

class SPAHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # If file exists, serve it normally
        path = self.translate_path(self.path)
        if os.path.exists(path) and os.path.isfile(path):
            super().do_GET()
        else:
            # For all unknown paths, serve index.html (SPA routing)
            self.path = '/index.html'
            super().do_GET()

    def log_message(self, format, *args):
        pass  # suppress logs

os.chdir(os.path.dirname(os.path.abspath(__file__)))
print("Frontend running at http://localhost:8000")
HTTPServer(('', 8000), SPAHandler).serve_forever()
