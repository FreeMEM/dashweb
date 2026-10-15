// big-endian / number formatting checks
var out = [];
out.push(0.1 + 0.2, 1 / 3, (1.005).toFixed(2), (123.456).toFixed(1), 1e21, 2 ** 53, -0 === 0, Math.sqrt(2), Math.sin(1), Math.pow(2, 0.5));
out.push(parseFloat("3.14159"), (255).toString(16), Number("0x1F"), JSON.stringify({a: [1, 2.5, "x"], b: null}));
var f = new Float64Array([1.5, -2.25]); var u = new Uint8Array(f.buffer);
out.push(Array.from(u).join(","));
var dv = new DataView(new ArrayBuffer(4)); dv.setUint32(0, 0x11223344); out.push(dv.getUint8(0), dv.getUint32(0, true).toString(16));
out.push(new Date(0).toISOString(), "ñandú".toUpperCase(), /(\d+)-(\d+)/.exec("12-34")[2]);
print(out.join(" | "));
