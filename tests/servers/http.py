#!/usr/bin/env python3
"""Test HTTP server for test_http: one route per case (length, chunked, close, UTF-8,
redirects, loop, 404). Usage: http.py PORT [tls]  (tls: HTTPS with a certificate for
127.0.0.1 signed by the test CA of Dash's tools/emu_sys_amissl.sh)"""
import socketserver
import sys

PORT = int(sys.argv[1])
CAFE = "café".encode("utf-8")
BINARIO = bytes(i * 7 % 256 for i in range(20000))     # every byte value, 0 included


def reply(status, headers, body=b"", raw=None):
    head = f"HTTP/1.1 {status}\r\n" + "".join(f"{k}: {v}\r\n" for k, v in headers) + "\r\n"
    return head.encode("latin-1") + (raw if raw is not None else body)


ROUTES = {
    "/hola": reply("200 OK", [("Content-Type", "text/plain"), ("Content-Length", "4")], b"hola"),
    "/chunked": reply("200 OK", [("Content-Type", "text/html; charset=UTF-8"), ("Transfer-Encoding", "chunked")],
                      raw=b"3\r\nuno\r\n3\r\ndos\r\nA\r\ntres-cuatr\r\n0\r\nX-Fin: si\r\n\r\n"),
    "/utf8": reply("200 OK", [("Content-Type", 'text/html; charset="utf-8"'), ("Content-Length", str(len(CAFE)))], CAFE),
    "/redir": reply("302 Found", [("Location", "/hola"), ("Content-Length", "0")]),
    "/redir2": reply("301 Moved", [("Location", f"http://127.0.0.1:{PORT}/redir"), ("Content-Length", "0")]),
    "/bucle": reply("302 Found", [("Location", "/bucle"), ("Content-Length", "0")]),
    "/estilo.css": reply("200 OK", [("Content-Type", "text/css"), ("Content-Length", "37")],
                         b'@import "imp.css"; p { color: teal }\n'),
    "/imp.css": reply("200 OK", [("Content-Type", "text/css"), ("Content-Length", "20")], b"em { color: olive }\n"),
    "/binario": reply("200 OK", [("Content-Type", "application/octet-stream"),
                                 ("Content-Length", str(len(BINARIO)))], BINARIO),
    "/binario_chunked": reply("200 OK", [("Content-Type", "application/octet-stream"),
                                         ("Transfer-Encoding", "chunked")],
                              raw=b"".join(b"%X\r\n" % len(BINARIO[i:i + 3000]) + BINARIO[i:i + 3000] + b"\r\n"
                                           for i in range(0, len(BINARIO), 3000)) + b"0\r\n\r\n"),
    "/no": reply("404 Not Found", [("Content-Type", "text/plain"), ("Content-Length", "2"),
                                   ("Set-Cookie", "a=1"), ("Set-Cookie", "b=2")], b"no"),
}


class Handler(socketserver.StreamRequestHandler):
    def handle(self):
        line = self.rfile.readline().decode("latin-1")
        length = 0
        while True:
            header = self.rfile.readline()
            if header in (b"\r\n", b"\n", b""):
                break
            if header.lower().startswith(b"content-length:"):
                length = int(header.split(b":", 1)[1])
        body = self.rfile.read(length) if length else b""
        path = line.split(" ")[1] if " " in line else "/"
        if path == "/cerrar":       # no length: the body ends when the connection closes
            self.wfile.write(b"HTTP/1.0 200 OK\r\nContent-Type: text/plain\r\n\r\n" + b"z" * 5000)
            return
        if path == "/lento":        # half the body, a pause, the other half: progress can be seen
            import time
            self.wfile.write(b"HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 2000\r\n\r\n" + b"a" * 1000)
            self.wfile.flush()
            time.sleep(1.5)
            self.wfile.write(b"b" * 1000)
            return
        if path.startswith("/pages/"):     # files of tests/pages
            import os
            f = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "pages", os.path.basename(path))
            if os.path.isfile(f):
                data = open(f, "rb").read()
                kinds = {".css": "text/css", ".png": "image/png", ".gif": "image/gif", ".iff": "image/x-ilbm"}
                kind = kinds.get(os.path.splitext(f)[1], "text/html; charset=utf-8")
                self.wfile.write(reply("200 OK", [("Content-Type", kind), ("Content-Length", str(len(data)))], data))
                return
        if path.split("?")[0] == "/eco":   # what the client sent, to check the request (and a POST's body)
            data = line.encode("latin-1") + body
            self.wfile.write(reply("200 OK", [("Content-Length", str(len(data)))], data))
            return
        if path == "/tras_post" and line.startswith("POST"):   # 303 to a GET, as after a form
            self.wfile.write(reply("303 See Other", [("Location", "/eco?visto=1"), ("Content-Length", "0")]))
            return
        self.wfile.write(ROUTES.get(path, ROUTES["/no"]))


def tls_context():
    import os
    import ssl
    import subprocess
    import tempfile
    from pathlib import Path
    ca = Path(os.path.expanduser("~/.cache/dash-amissl/testca"))
    tmp = Path(tempfile.mkdtemp(prefix="dashweb_tls_"))
    subprocess.run(["openssl", "req", "-newkey", "rsa:2048", "-nodes", "-subj", "/CN=localhost",
                    "-keyout", tmp / "srv.key", "-out", tmp / "srv.csr"], check=True, capture_output=True)
    (tmp / "ext.cnf").write_text("subjectAltName=DNS:localhost,IP:127.0.0.1\n")
    subprocess.run(["openssl", "x509", "-req", "-in", tmp / "srv.csr", "-CA", ca / "ca.pem", "-CAkey", ca / "ca.key",
                    "-CAcreateserial", "-CAserial", tmp / "ca.srl", "-days", "2", "-extfile", tmp / "ext.cnf",
                    "-out", tmp / "srv.pem"], check=True, capture_output=True)
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain(tmp / "srv.pem", tmp / "srv.key")
    return context


class TLSServer(socketserver.ThreadingTCPServer):
    def get_request(self):
        sock, addr = super().get_request()
        return CONTEXT.wrap_socket(sock, server_side=True), addr

    def handle_error(self, request, client_address):
        pass


socketserver.ThreadingTCPServer.allow_reuse_address = True
if len(sys.argv) > 2 and sys.argv[2] == "tls":
    CONTEXT = tls_context()
    TLSServer(("127.0.0.1", PORT), Handler).serve_forever()
else:
    socketserver.ThreadingTCPServer(("127.0.0.1", PORT), Handler).serve_forever()
