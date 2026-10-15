function T(name, f) { var t = ticks(); var x = f(); print("BENCH " + name + " " + (ticks() - t).toFixed(1) + " ms (" + x + ")"); }
T("fib20", function () { function fib(n) { return n < 2 ? n : fib(n - 1) + fib(n - 2); } return fib(20); });
T("intloop100k", function () { var s = 0; for (var i = 0; i < 100000; i++) s = (s + i) | 0; return s; });
T("float20k", function () { var x = 1.0; for (var i = 0; i < 20000; i++) x = x * 1.0001 + 0.5; return x.toFixed(2); });
T("mathsin5k", function () { var s = 0; for (var i = 0; i < 5000; i++) s += Math.sin(i); return s.toFixed(4); });
T("strcat5k", function () { var s = ""; for (var i = 0; i < 5000; i++) s += i; return s.length; });
T("arrjoin", function () { var a = []; for (var i = 0; i < 5000; i++) a.push("item" + i); return a.join(",").split(",").length; });
T("objects5k", function () { var a = []; for (var i = 0; i < 5000; i++) a.push({x: i, y: i * 2}); var s = 0; for (var o of a) s += o.x + o.y; return s; });
T("sort5k", function () { var a = []; var seed = 1; for (var i = 0; i < 5000; i++) { seed = (seed * 1103515245 + 12345) & 0x7fffffff; a.push(seed); } a.sort(function (p, q) { return p - q; }); return a[0]; });
T("json", function () { var o = []; for (var i = 0; i < 200; i++) o.push({id: i, name: "n" + i, tags: ["a", "b"], v: i / 3}); var s = JSON.stringify(o); for (var k = 0; k < 5; k++) o = JSON.parse(s); return s.length; });
T("regexp", function () { var s = "lorem ipsum 123 dolor 456 sit amet 789 ".repeat(200); var n = 0; s.replace(/(\w+) (\d+)/g, function () { n++; return ""; }); return n; });
T("map5k", function () { var m = new Map(); for (var i = 0; i < 5000; i++) m.set("k" + i, i); var s = 0; for (var i = 0; i < 5000; i++) s += m.get("k" + i); return s; });
T("closures", function () { var fs = []; for (let i = 0; i < 2000; i++) fs.push(() => i * 2); return fs.reduce((a, f) => a + f(), 0); });
T("parse30k", function () { var src = ""; for (var i = 0; i < 600; i++) src += "function f" + i + "(a, b) { var c = a + b * " + i + "; if (c > 10) { return [c, 'x" + i + "']; } return {v: c}; }\n"; var g = new Function(src + "return f599(1, 2);"); return src.length + "B " + JSON.stringify(g()); });
