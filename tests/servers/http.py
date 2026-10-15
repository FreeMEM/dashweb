#!/usr/bin/env python3
"""Test HTTP server for test_http: one route per case (length, chunked, close, UTF-8,
redirects, loop, 404). Usage: http.py PORT"""
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


socketserver.ThreadingTCPServer.allow_reuse_address = True
socketserver.ThreadingTCPServer(("127.0.0.1", PORT), Handler).serve_forever()
