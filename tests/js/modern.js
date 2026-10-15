class A { #p = 1; get p() { return this.#p; } static s() { return "s"; } }
class B extends A { constructor() { super(); this.q = 2; } }
const b = new B();
const {q, ...rest} = {q: 1, r: 2, s: 3};
const arr = [...[1, 2], ...new Set([3, 3, 4])];
function* gen() { yield 1; yield 2; }
const m = new Map([[1, "a"]]);
let r = [];
r.push(b.p, b.q, A.s(), q, Object.keys(rest).join(""), arr.join(""), [...gen()].join(""), m.get(1), `t${1 + 1}`, b?.x?.y ?? "nn", 2n ** 64n);
(async () => { const v = await Promise.resolve(42); r.push(v); print("modern:", r.join(",")); })();
