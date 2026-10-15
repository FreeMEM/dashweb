#!/usr/bin/env python3
"""Test server for test_red: on each connection sends two lines, 3000 'x', then "\\nfin" and closes.
If the client sends "ECO <text>\\n" first, it answers "<text>\\n" instead."""
import socketserver
import sys
import time


class Handler(socketserver.BaseRequestHandler):
    def handle(self):
        self.request.settimeout(0.5)
        try:
            first = self.request.recv(100)
        except OSError:
            first = b""
        if first.startswith(b"ECO "):
            self.request.sendall(first[4:])
            return
        self.request.sendall(b"uno\r\ndos\n")
        time.sleep(0.2)             # in more than one piece
        self.request.sendall(b"x" * 3000 + b"\nfin")


socketserver.ThreadingTCPServer.allow_reuse_address = True
socketserver.ThreadingTCPServer(("127.0.0.1", int(sys.argv[1])), Handler).serve_forever()
