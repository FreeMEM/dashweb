var t = ticks();
var data = []; for (var i = 0; i < 1000; i++) data.push({id: i, g: i % 7, name: "n" + (1000 - i)});
var r1 = _.sortBy(data, "name").length, r2 = Object.keys(_.groupBy(data, "g")).length, r3 = _.chunk(data, 10).length;
var r4 = _.uniq(_.map(data, function (d) { return d.g; })).length, r5 = _.template("hola <%= n %>")({n: "amiga"});
print("lodash ops " + (ticks() - t).toFixed(1) + " ms", r1, r2, r3, r4, r5);
t = ticks();
var h = preact.h, vnode = h("ul", null, data.slice(0, 200).map(function (d) { return h("li", {key: d.id}, d.name); }));
print("preact 200 vnodes " + (ticks() - t).toFixed(1) + " ms", vnode.props.children.length);
