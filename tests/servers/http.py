#!/usr/bin/env python3
"""Test HTTP server for test_http: one route per case (length, chunked, close, UTF-8,
redirects, loop, 404). Usage: http.py PORT [tls]  (tls: HTTPS with a certificate for
127.0.0.1 signed by the test CA of Dash's tools/emu_sys_amissl.sh)"""
import socketserver
import sys

PORT = int(sys.argv[1])
CAFE = "café".encode("utf-8")


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
    "/no": reply("404 Not Found", [("Content-Type", "text/plain"), ("Content-Length", "2"),
                                   ("Set-Cookie", "a=1"), ("Set-Cookie", "b=2")], b"no"),
}


class Handler(socketserver.StreamRequestHandler):
    def handle(self):
        line = self.rfile.readline().decode("latin-1")
        while self.rfile.readline() not in (b"\r\n", b"\n", b""):
            pass
        path = line.split(" ")[1] if " " in line else "/"
        if path == "/cerrar":       # no length: the body ends when the connection closes
            self.wfile.write(b"HTTP/1.0 200 OK\r\nContent-Type: text/plain\r\n\r\n" + b"z" * 5000)
            return
        if path.split("?")[0] == "/eco":   # what the client sent, to check the request
            self.wfile.write(reply("200 OK", [("Content-Length", str(len(line)))], line.encode("latin-1")))
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
