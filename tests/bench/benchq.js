function T(name, f) { var t = ticks(); var x = f(); print("BENCH " + name + " " + (ticks() - t).toFixed(1) + " ms (" + x + ")"); }
T("fib20", function () { function fib(n) { return n < 2 ? n : fib(n - 1) + fib(n - 2); } return fib(20); });
T("intloop100k", function () { var s = 0; for (var i = 0; i < 100000; i++) s = (s + i) | 0; return s; });
T("objects5k", function () { var a = []; for (var i = 0; i < 5000; i++) a.push({x: i, y: i * 2}); var s = 0; for (var o of a) s += o.x + o.y; return s; });
T("sort5k", function () { var a = []; var seed = 1; for (var i = 0; i < 5000; i++) { seed = (seed * 1103515245 + 12345) & 0x7fffffff; a.push(seed); } a.sort(function (p, q) { return p - q; }); return a[0]; });
T("json", function () { var o = []; for (var i = 0; i < 200; i++) o.push({id: i, name: "n" + i, tags: ["a", "b"], v: i / 3}); var s = JSON.stringify(o); for (var k = 0; k < 5; k++) o = JSON.parse(s); return s.length; });
T("parse30k", function () { var src = ""; for (var i = 0; i < 600; i++) src += "function f" + i + "(a, b) { var c = a + b * " + i + "; if (c > 10) { return [c, 'x" + i + "']; } return {v: c}; }\n"; var g = new Function(src + "return f599(1, 2);"); return src.length + "B " + JSON.stringify(g()); });
