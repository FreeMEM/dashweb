// El entorno de navegador para el JavaScript de las páginas, encima de lo que pone lib/jsdom.dash
// en C (los nodos). tools/preludio.py lo convierte en lib/jsdom_preludio.dash. Lo que hace falta
// para jQuery 3 y las páginas de hoy: eventos (con window), temporizadores, style, classList,
// dataset, getComputedStyle, navigator, location, history, almacenamiento, matchMedia...
(function (g) {
    'use strict';
    var N = Object.getPrototypeOf(document);

    // === Constructores (para instanceof) y constantes ===
    function Nodo() { throw new TypeError('Illegal constructor'); }
    Nodo.prototype = N;
    ['Node', 'Element', 'HTMLElement', 'HTMLDocument', 'Document', 'DocumentFragment', 'Text', 'Comment',
     'CharacterData', 'HTMLInputElement', 'HTMLSelectElement', 'HTMLFormElement', 'HTMLAnchorElement',
     'HTMLImageElement', 'HTMLScriptElement', 'SVGElement'].forEach(function (k) { g[k] = Nodo; });
    var CONST = {ELEMENT_NODE: 1, ATTRIBUTE_NODE: 2, TEXT_NODE: 3, CDATA_SECTION_NODE: 4, COMMENT_NODE: 8,
                 DOCUMENT_NODE: 9, DOCUMENT_TYPE_NODE: 10, DOCUMENT_FRAGMENT_NODE: 11,
                 DOCUMENT_POSITION_DISCONNECTED: 1, DOCUMENT_POSITION_PRECEDING: 2, DOCUMENT_POSITION_FOLLOWING: 4,
                 DOCUMENT_POSITION_CONTAINS: 8, DOCUMENT_POSITION_CONTAINED_BY: 16,
                 DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: 32};
    Object.keys(CONST).forEach(function (k) { Nodo[k] = CONST[k]; N[k] = CONST[k]; });
    N.namespaceURI = 'http://www.w3.org/1999/xhtml';

    // === Eventos ===
    function Ev(tipo, o) {
        o = o || {};
        this.type = String(tipo);
        this.bubbles = !!o.bubbles;
        this.cancelable = !!o.cancelable;
        this.composed = !!o.composed;
        this.defaultPrevented = false;
        this.isTrusted = false;
        this.timeStamp = __dashweb_reloj();
        this.target = this.currentTarget = this.srcElement = null;
        this.eventPhase = 0;
        this.detail = o.detail === undefined ? null : o.detail;
        this._parar = this._pararYa = false;
        ['key', 'code', 'keyCode', 'which', 'button', 'buttons', 'clientX', 'clientY', 'pageX', 'pageY',
         'screenX', 'screenY', 'altKey', 'ctrlKey', 'shiftKey', 'metaKey', 'relatedTarget'].forEach(function (k) {
            if (o[k] !== undefined) this[k] = o[k];
        }, this);
    }
    Ev.prototype.preventDefault = function () { if (this.cancelable !== false) this.defaultPrevented = true; };
    Ev.prototype.stopPropagation = function () { this._parar = true; };
    Ev.prototype.stopImmediatePropagation = function () { this._parar = this._pararYa = true; };
    Ev.prototype.initEvent = function (t, b, c) { this.type = String(t); this.bubbles = !!b; this.cancelable = !!c; };
    Ev.prototype.composedPath = function () { return this._camino ? this._camino.slice() : []; };
    Ev.NONE = 0; Ev.CAPTURING_PHASE = 1; Ev.AT_TARGET = 2; Ev.BUBBLING_PHASE = 3;
    g.Event = Ev;
    function sub(nombre) {
        var F = function (t, o) { Ev.call(this, t, o); };
        F.prototype = Object.create(Ev.prototype);
        F.prototype.constructor = F;
        g[nombre] = F;
    }
    ['CustomEvent', 'UIEvent', 'MouseEvent', 'KeyboardEvent', 'FocusEvent', 'InputEvent', 'PointerEvent',
     'TouchEvent', 'WheelEvent', 'ErrorEvent', 'MessageEvent', 'PopStateEvent', 'HashChangeEvent',
     'ProgressEvent'].forEach(sub);
    g.CustomEvent.prototype.initCustomEvent = function (t, b, c, d) { this.initEvent(t, b, c); this.detail = d; };

    function escuchar(objeto, t, f, o) {
        if (!f || (typeof f != 'function' && typeof f.handleEvent != 'function')) return;
        var e = objeto.__ev || (Object.defineProperty(objeto, '__ev', {value: {}, writable: true}), objeto.__ev);
        var l = e[t] || (e[t] = []);
        var captura = typeof o == 'boolean' ? o : !!(o && o.capture);
        for (var i = 0; i < l.length; i++) if (l[i].f === f && l[i].captura === captura) return;
        l.push({f: f, captura: captura, una: !!(o && typeof o == 'object' && o.once)});
    }
    function olvidar(objeto, t, f, o) {
        var l = objeto.__ev && objeto.__ev[t];
        var captura = typeof o == 'boolean' ? o : !!(o && o.capture);
        if (l) for (var i = 0; i < l.length; i++) if (l[i].f === f && l[i].captura === captura) { l.splice(i, 1); return; }
    }
    function llamar(f, este, ev) {
        try { return typeof f == 'function' ? f.call(este, ev) : f.handleEvent(ev); }
        catch (e) { console.log('JS: ' + e + (e && e.stack ? ' | ' + String(e.stack).replace(/\n\s*/g, ' | ') : '')); }
    }
    // Los oyentes de un objeto (nodo o window) en una fase: 1 captura, 2 en el objetivo, 3 subida
    function avisar(n, ev, fase) {
        ev.currentTarget = n;
        ev.eventPhase = fase;
        if (fase != 1) {
            var h = n['on' + ev.type];
            if (typeof h != 'function' && n.nodeType == 1 && n.hasAttribute('on' + ev.type)) {
                try { h = new Function('event', n.getAttribute('on' + ev.type)); } catch (e) { console.log('JS: ' + e); }
            }
            if (typeof h == 'function' && llamar(h, n, ev) === false) ev.defaultPrevented = true;
        }
        var l = n.__ev && n.__ev[ev.type];
        if (!l) return;
        l.slice().forEach(function (o) {
            if (ev._pararYa) return;
            if (fase == 1 && !o.captura || fase == 3 && o.captura) return;
            if (o.una) olvidar(n, ev.type, o.f, o.captura);
            llamar(o.f, n, ev);
        });
    }
    function despachar(nodo, ev) {
        if (!(ev instanceof Ev)) { var e = new Ev(ev.type, {bubbles: true, cancelable: true}); Object.assign(e, ev); ev = e; }
        ev.target = ev.srcElement = nodo;
        var camino = [];
        for (var n = nodo.parentNode; n; n = n.parentNode) camino.push(n);
        if (nodo === g || camino.length && camino[camino.length - 1].nodeType == 9 || nodo.nodeType == 9) {
            if (nodo !== g) camino.push(g);
        }
        ev._camino = [nodo].concat(camino);
        for (var i = camino.length - 1; i >= 0 && !ev._parar; i--) avisar(camino[i], ev, 1);
        if (!ev._parar) avisar(nodo, ev, 2);
        if (ev.bubbles) for (i = 0; i < camino.length && !ev._parar; i++) avisar(camino[i], ev, 3);
        ev.currentTarget = null;
        ev.eventPhase = 0;
        return !ev.defaultPrevented;
    }
    N.addEventListener = function (t, f, o) { escuchar(this, t, f, o); };
    N.removeEventListener = function (t, f, o) { olvidar(this, t, f, o); };
    N.dispatchEvent = function (ev) { return despachar(this, ev); };
    g.addEventListener = function (t, f, o) { escuchar(g, t, f, o); };
    g.removeEventListener = function (t, f, o) { olvidar(g, t, f, o); };
    g.dispatchEvent = function (ev) { return despachar(g, ev); };
    N.click = function () { return despachar(this, new g.MouseEvent('click', {bubbles: true, cancelable: true, button: 0})); };
    N.focus = function () { pon(document, 'activeElement', this); };
    N.blur = function () { if (document.activeElement === this) pon(document, 'activeElement', document.body); };
    N.submit = function () { g.__dashweb_envio = this; };
    N.reset = function () {};
    g.__dashweb_despachar = function (n, t) {
        return despachar(n, new (t == 'click' ? g.MouseEvent : Ev)(t, {bubbles: true, cancelable: true}));
    };
    document.createEvent = function (t) { return /custom/i.test(t) ? new g.CustomEvent('') : new Ev(''); };

    // === Temporizadores ===
    var cola = [], sig = 1;
    function poner(f, ms, args, rep) {
        if (typeof f == 'string') { var c = f; f = function () { (0, eval)(c); }; }
        if (typeof f != 'function') return 0;
        ms = +ms || 0; if (ms < 0) ms = 0;
        var id = sig++;
        cola.push({id: id, f: f, ms: ms, cuando: __dashweb_reloj() + ms, args: args, rep: rep});
        return id;
    }
    g.setTimeout = function (f, ms) { return poner(f, ms, [].slice.call(arguments, 2), false); };
    g.setInterval = function (f, ms) { return poner(f, ms, [].slice.call(arguments, 2), true); };
    g.clearTimeout = g.clearInterval = function (id) {
        for (var i = 0; i < cola.length; i++) if (cola[i].id === id) { cola.splice(i, 1); return; }
    };
    g.requestAnimationFrame = function (f) { return poner(function () { f(__dashweb_reloj()); }, 16, [], false); };
    g.cancelAnimationFrame = g.clearTimeout;
    g.queueMicrotask = function (f) { Promise.resolve().then(f); };
    g.__dashweb_tick = function () {
        var ahora = __dashweb_reloj();
        cola.filter(function (t) { return t.cuando <= ahora; })
            .sort(function (a, b) { return a.cuando - b.cuando || a.id - b.id; })
            .forEach(function (t) {
                var i = cola.indexOf(t);
                if (i < 0) return;
                if (t.rep) t.cuando = ahora + Math.max(t.ms, 10); else cola.splice(i, 1);
                try { t.f.apply(g, t.args); }
                catch (e) { console.log('JS: ' + e + (e && e.stack ? ' | ' + String(e.stack).replace(/\n\s*/g, ' | ') : '')); }
            });
        if (!cola.length) return -1;
        var p = Infinity;
        cola.forEach(function (t) { if (t.cuando < p) p = t.cuando; });
        return Math.max(0, p - __dashweb_reloj());
    };

    // === Nodos: lo que se escribe en JavaScript sobre lo de C ===
    function def(nombre, get, set) { Object.defineProperty(N, nombre, {get: get, set: set, configurable: true}); }
    N.hasChildNodes = function () { return this.childNodes.length > 0; };
    N.getRootNode = function () { var n = this; while (n.parentNode) n = n.parentNode; return n; };
    def('isConnected', function () { return this.getRootNode() === document; });
    N.closest = function (s) {
        for (var n = this; n && n.nodeType == 1; n = n.parentNode) if (n.matches(s)) return n;
        return null;
    };
    N.getClientRects = function () {
        return this.offsetWidth ? [{top: 0, left: 0, right: this.offsetWidth, bottom: this.offsetHeight,
                                    width: this.offsetWidth, height: this.offsetHeight}] : [];
    };
    N.getBoundingClientRect = function () {
        var w = this.offsetWidth, h = this.offsetHeight;
        return {top: 0, left: 0, right: w, bottom: h, width: w, height: h, x: 0, y: 0};
    };
    ['offsetTop', 'offsetLeft', 'scrollTop', 'scrollLeft', 'clientTop', 'clientLeft'].forEach(function (k) {
        def(k, function () { return 0; }, function () {});
    });
    def('scrollWidth', function () { return this.offsetWidth; });
    def('scrollHeight', function () { return this.offsetHeight; });
    def('offsetParent', function () { return this.offsetWidth ? this.parentNode : null; });
    N.scrollIntoView = N.scrollTo = N.scrollBy = function () {};
    function nodos(lista) {
        return [].map.call(lista, function (a) { return typeof a == 'string' ? document.createTextNode(a) : a; });
    }
    N.append = function () { nodos(arguments).forEach(function (n) { this.appendChild(n); }, this); };
    N.prepend = function () { var f = this.firstChild; nodos(arguments).forEach(function (n) { this.insertBefore(n, f); }, this); };
    N.before = function () { var p = this.parentNode, y = this; if (p) nodos(arguments).forEach(function (n) { p.insertBefore(n, y); }); };
    N.after = function () { var p = this.parentNode, s = this.nextSibling; if (p) nodos(arguments).forEach(function (n) { p.insertBefore(n, s); }); };
    N.replaceWith = function () { var p = this.parentNode; if (p) { this.before.apply(this, arguments); p.removeChild(this); } };
    N.remove = function () { if (this.parentNode) this.parentNode.removeChild(this); };
    N.insertAdjacentHTML = function (donde, html) {
        var t = document.createElement('div'), f = document.createDocumentFragment();
        t.innerHTML = html;
        while (t.firstChild) f.appendChild(t.firstChild);
        this.insertAdjacentElement(donde, f);
    };
    N.insertAdjacentElement = function (donde, e) {
        donde = String(donde).toLowerCase();
        if (donde == 'beforebegin') this.parentNode.insertBefore(e, this);
        else if (donde == 'afterbegin') this.insertBefore(e, this.firstChild);
        else if (donde == 'beforeend') this.appendChild(e);
        else if (donde == 'afterend') this.parentNode.insertBefore(e, this.nextSibling);
        return e;
    };
    N.insertAdjacentText = function (donde, t) { this.insertAdjacentElement(donde, document.createTextNode(t)); };
    N.getAttributeNames = function () { return this.attributes.map(function (a) { return a.name; }); };
    N.toggleAttribute = function (a, si) {
        if (si === undefined) si = !this.hasAttribute(a);
        if (si) this.setAttribute(a, ''); else this.removeAttribute(a);
        return si;
    };
    N.getAttributeNS = function (ns, a) { return this.getAttribute(a); };
    N.setAttributeNS = function (ns, a, v) { this.setAttribute(a, v); };
    N.removeAttributeNS = function (ns, a) { this.removeAttribute(a); };
    N.hasAttributes = function () { return this.attributes.length > 0; };
    def('innerText', function () { return this.textContent; }, function (v) { this.textContent = v; });
    def('childElementCount', function () { return this.children.length; });
    def('firstElementChild', function () { return this.children[0] || null; });
    def('lastElementChild', function () { var c = this.children; return c[c.length - 1] || null; });
    def('title', function () { return this.getAttribute('title') || ''; }, function (v) { this.setAttribute('title', v); });

    // atributos que se leen como propiedades
    ['name', 'href', 'src', 'alt', 'rel', 'target', 'placeholder', 'lang', 'dir', 'action', 'method', 'role',
     'width', 'height', 'htmlFor:for', 'accessKey:accesskey', 'tabIndex:tabindex', 'content', 'charset',
     'media', 'download', 'hreflang', 'label', 'pattern', 'accept', 'autocomplete', 'enctype', 'srcset',
     'sizes', 'loading', 'crossOrigin:crossorigin', 'integrity', 'referrerPolicy:referrerpolicy'].forEach(function (k) {
        var p = k.split(':'), a = p[1] || p[0];
        def(p[0], function () {
            var v = this.getAttribute(a);
            if (p[0] == 'tabIndex') return v === null ? -1 : +v;
            return v === null ? '' : v;
        }, function (v) { this.setAttribute(a, v); });
    });
    def('type', function () {
        var v = this.getAttribute('type');
        return v !== null ? v.toLowerCase() : this.localName == 'input' ? 'text' : this.localName == 'button' ? 'submit' : '';
    }, function (v) { this.setAttribute('type', v); });
    ['disabled', 'selected', 'readOnly:readonly', 'multiple', 'required', 'hidden', 'autofocus', 'async',
     'defer', 'noValidate:novalidate', 'open', 'controls', 'autoplay', 'loop', 'muted'].forEach(function (k) {
        var p = k.split(':'), a = p[1] || p[0];
        def(p[0], function () { return this.hasAttribute(a); },
            function (v) { if (v) this.setAttribute(a, ''); else this.removeAttribute(a); });
    });
    def('defaultChecked', function () { return this.hasAttribute('checked'); });
    def('options', function () { return this.querySelectorAll('option'); });
    def('selectedIndex', function () {
        var o = this.options;
        for (var i = 0; i < o.length; i++) if (o[i].selected) return i;
        return this.localName == 'select' && o.length && !this.multiple ? 0 : -1;
    }, function (k) { var o = this.options; for (var i = 0; i < o.length; i++) o[i].selected = i == k; });
    def('text', function () { return this.textContent; }, function (v) { this.textContent = v; });
    def('form', function () { return this.closest('form'); });
    def('elements', function () { return this.querySelectorAll('input, select, textarea, button'); });

    // classList
    def('classList', function () {
        var el = this;
        function lista() { return (el.getAttribute('class') || '').split(/\s+/).filter(Boolean); }
        function poner(l) { el.setAttribute('class', l.join(' ')); }
        var cl = {
            add: function () { var l = lista(); [].forEach.call(arguments, function (c) { if (l.indexOf(c) < 0) l.push(c); }); poner(l); },
            remove: function () { var q = [].slice.call(arguments); poner(lista().filter(function (c) { return q.indexOf(c) < 0; })); },
            contains: function (c) { return lista().indexOf(c) >= 0; },
            toggle: function (c, si) {
                var hay = this.contains(c);
                if (si === undefined) si = !hay;
                if (si && !hay) this.add(c); else if (!si && hay) this.remove(c);
                return si;
            },
            replace: function (a, b) { var l = lista(), i = l.indexOf(a); if (i < 0) return false; l[i] = b; poner(l); return true; },
            item: function (i) { return lista()[i] || null; },
            forEach: function (f, t) { lista().forEach(f, t); },
            toString: function () { return el.getAttribute('class') || ''; }
        };
        Object.defineProperty(cl, 'length', {get: function () { return lista().length; }});
        Object.defineProperty(cl, 'value', {get: function () { return el.getAttribute('class') || ''; }});
        return cl;
    });

    // dataset: los atributos data-*
    def('dataset', function () {
        var el = this;
        function atr(k) { return 'data-' + String(k).replace(/[A-Z]/g, function (c) { return '-' + c.toLowerCase(); }); }
        return new Proxy({}, {
            get: function (t, k) { if (typeof k != 'string') return undefined; var v = el.getAttribute(atr(k)); return v === null ? undefined : v; },
            set: function (t, k, v) { el.setAttribute(atr(k), v); return true; },
            has: function (t, k) { return el.hasAttribute(atr(k)); },
            deleteProperty: function (t, k) { el.removeAttribute(atr(k)); return true; },
            ownKeys: function () {
                return el.attributes.filter(function (a) { return a.name.indexOf('data-') == 0; }).map(function (a) {
                    return a.name.slice(5).replace(/-([a-z])/g, function (m, c) { return c.toUpperCase(); });
                });
            },
            getOwnPropertyDescriptor: function (t, k) {
                var v = el.getAttribute(atr(k));
                return v === null ? undefined : {value: v, enumerable: true, configurable: true, writable: true};
            }
        });
    });

    // style: el atributo style como objeto (el.style.color = 'red', cssText, setProperty...)
    function guion(p) {
        if (p == 'cssFloat') return 'float';
        return String(p).replace(/^(webkit|moz|ms)([A-Z])/, '-$1$2').replace(/[A-Z]/g, function (c) { return '-' + c.toLowerCase(); });
    }
    function leerEstilo(t) {
        var o = {}, orden = [];
        String(t || '').split(';').forEach(function (d) {
            var i = d.indexOf(':');
            if (i <= 0) return;
            var k = d.slice(0, i).trim().toLowerCase(), v = d.slice(i + 1).trim();
            if (!k) return;
            if (!(k in o)) orden.push(k);
            o[k] = v;
        });
        return {o: o, orden: orden};
    }
    function escribirEstilo(el, e) {
        var t = e.orden.filter(function (k) { return e.o[k] !== undefined && e.o[k] !== ''; })
                       .map(function (k) { return k + ': ' + e.o[k]; }).join('; ');
        if (t) el.setAttribute('style', t); else el.removeAttribute('style');
    }
    def('style', function () {
        var el = this;
        if (el.__estilo) return el.__estilo;
        var api = {
            getPropertyValue: function (k) { var v = leerEstilo(el.getAttribute('style')).o[String(k).toLowerCase()]; return v === undefined ? '' : v.replace(/\s*!important$/, ''); },
            getPropertyPriority: function (k) { return /!important$/.test(leerEstilo(el.getAttribute('style')).o[k] || '') ? 'important' : ''; },
            setProperty: function (k, v, prio) {
                var e = leerEstilo(el.getAttribute('style'));
                k = String(k).toLowerCase();
                v = v === null || v === undefined ? '' : String(v);
                if (!(k in e.o)) e.orden.push(k);
                e.o[k] = v && prio ? v + ' !important' : v;
                escribirEstilo(el, e);
            },
            removeProperty: function (k) { var v = this.getPropertyValue(k); this.setProperty(k, ''); return v; },
            item: function (i) { return leerEstilo(el.getAttribute('style')).orden[i] || ''; }
        };
        el.__estilo = new Proxy(api, {
            get: function (t, k) {
                if (k in t) return t[k];
                if (typeof k != 'string') return undefined;
                if (k == 'cssText') return el.getAttribute('style') || '';
                if (k == 'length') return leerEstilo(el.getAttribute('style')).orden.length;
                return t.getPropertyValue(guion(k));
            },
            set: function (t, k, v) {
                if (k == 'cssText') { if (v) el.setAttribute('style', v); else el.removeAttribute('style'); }
                else t.setProperty(guion(k), v);
                return true;
            },
            has: function (t, k) { return true; }
        });
        return el.__estilo;
    });

    // getComputedStyle: lo del atributo style y, si no, lo calculado por lib/estilo.dash
    g.getComputedStyle = function (el) {
        var api = {
            getPropertyValue: function (k) {
                k = String(k).toLowerCase();
                var v = el && el.nodeType == 1 ? el.style.getPropertyValue(k) : '';
                return v !== '' ? v : el ? __dashweb_calculado(el, k) : '';
            }
        };
        return new Proxy(api, {
            get: function (t, k) {
                if (k in t) return t[k];
                if (typeof k != 'string') return undefined;
                if (k == 'length') return 0;
                return t.getPropertyValue(guion(k));
            }
        });
    };

    // === document === (propiedades propias con defineProperty: una asignación llamaría a los
    // setters de los elementos, como hidden u open, y le pondría atributos al documento)
    function pon(o, k, v) { Object.defineProperty(o, k, {value: v, writable: true, configurable: true, enumerable: true}); }
    pon(document, 'readyState', 'loading');
    pon(document, 'defaultView', g);
    pon(document, 'activeElement', null);
    pon(document, 'hasFocus', function () { return true; });
    pon(document, 'referrer', '');
    ['characterSet', 'charset', 'inputEncoding'].forEach(function (k) { pon(document, k, 'UTF-8'); });
    pon(document, 'compatMode', 'CSS1Compat');
    pon(document, 'contentType', 'text/html');
    pon(document, 'visibilityState', 'visible');
    pon(document, 'hidden', false);
    pon(document, 'doctype', null);
    var galletas = {};
    Object.defineProperty(document, 'cookie', {
        get: function () { return Object.keys(galletas).map(function (k) { return k + '=' + galletas[k]; }).join('; '); },
        set: function (v) {
            var p = String(v).split(';')[0], i = p.indexOf('=');
            if (i > 0) galletas[p.slice(0, i).trim()] = p.slice(i + 1).trim();
        }
    });
    ['forms:form', 'images:img', 'links:a[href]', 'scripts:script', 'anchors:a[name]'].forEach(function (k) {
        var p = k.split(':');
        Object.defineProperty(document, p[0], {get: function () { return document.querySelectorAll(p[1]); }});
    });
    document.getElementsByName = function (n) {
        return [].filter.call(document.querySelectorAll('[name]'), function (e) { return e.getAttribute('name') === String(n); });
    };
    pon(document, 'write', function () {
        var html = [].join.call(arguments, ''), cuerpo = document.body || document.documentElement;
        if (cuerpo) cuerpo.insertAdjacentHTML('beforeend', html);
    });
    pon(document, 'writeln', document.write);
    pon(document, 'open', function () {});
    pon(document, 'close', function () {});
    document.createElementNS = function (ns, n) { return document.createElement(n); };
    document.createAttribute = function (n) { return {name: n, value: ''}; };
    document.createRange = function () {
        return {setStart: function () {}, setEnd: function () {}, selectNodeContents: function () {},
                collapse: function () {}, getBoundingClientRect: N.getBoundingClientRect,
                createContextualFragment: function (h) {
                    var t = document.createElement('div'), f = document.createDocumentFragment();
                    t.innerHTML = h;
                    while (t.firstChild) f.appendChild(t.firstChild);
                    return f;
                }};
    };
    document.getSelection = g.getSelection = function () {
        return {rangeCount: 0, removeAllRanges: function () {}, addRange: function () {}, toString: function () { return ''; }};
    };
    document.elementFromPoint = function () { return document.body; };
    document.implementation = {
        hasFeature: function () { return true; },
        createHTMLDocument: function (t) {
            var d = __dashweb_documento_nuevo(t === undefined ? '' : t);
            Object.getOwnPropertyNames(document).forEach(function (k) {
                if (!(k in Object.getPrototypeOf(d)) || ['body', 'head', 'documentElement'].indexOf(k) >= 0) {
                    try { Object.defineProperty(d, k, Object.getOwnPropertyDescriptor(document, k)); } catch (e) {}
                }
            });
            d.readyState = 'complete';
            return d;
        }
    };

    // === window ===
    g.self = g.top = g.parent = g.frames = g;
    g.frameElement = null;
    g.closed = false;
    g.name = '';
    g.length = 0;
    g.innerWidth = g.outerWidth = 640;
    g.innerHeight = g.outerHeight = 480;
    g.devicePixelRatio = 1;
    g.screen = {width: 640, height: 480, availWidth: 640, availHeight: 480, colorDepth: 16, pixelDepth: 16,
                orientation: {type: 'landscape-primary', angle: 0}};
    g.scrollX = g.scrollY = g.pageXOffset = g.pageYOffset = g.screenX = g.screenY = 0;
    g.scrollTo = g.scrollBy = g.scroll = g.focus = g.blur = g.print = g.stop = function () {};
    g.alert = function (m) { console.log('alert: ' + m); };
    g.confirm = function (m) { console.log('confirm: ' + m); return false; };
    g.prompt = function (m) { console.log('prompt: ' + m); return null; };
    g.open = function () { return null; };
    g.close = function () {};
    g.postMessage = function () {};
    g.navigator = {
        userAgent: 'Mozilla/5.0 (AmigaOS; m68k) dashweb/0.1', appName: 'Netscape', appVersion: '5.0 (AmigaOS)',
        appCodeName: 'Mozilla', product: 'Gecko', productSub: '20030107', vendor: '', vendorSub: '',
        platform: 'AmigaOS', language: 'es-ES', languages: ['es-ES', 'es', 'en'], cookieEnabled: true,
        onLine: true, doNotTrack: '1', hardwareConcurrency: 1, maxTouchPoints: 0, pdfViewerEnabled: false,
        webdriver: false, plugins: [], mimeTypes: [],
        javaEnabled: function () { return false; },
        sendBeacon: function () { return false; },
        userAgentData: undefined
    };
    g.clientInformation = g.navigator;
    function Almacen() {
        var d = {};
        return {
            getItem: function (k) { return Object.prototype.hasOwnProperty.call(d, k) ? d[k] : null; },
            setItem: function (k, v) { d[k] = String(v); },
            removeItem: function (k) { delete d[k]; },
            clear: function () { d = {}; },
            key: function (i) { return Object.keys(d)[i] || null; },
            get length() { return Object.keys(d).length; }
        };
    }
    g.localStorage = Almacen();
    g.sessionStorage = Almacen();
    g.history = {length: 1, state: null, scrollRestoration: 'auto',
                 pushState: function (s) { this.state = s; }, replaceState: function (s) { this.state = s; },
                 back: function () {}, forward: function () {}, go: function () {}};
    g.matchMedia = function (q) {
        return {matches: __dashweb_media(String(q)), media: String(q), onchange: null,
                addListener: function () {}, removeListener: function () {},
                addEventListener: function () {}, removeEventListener: function () {}};
    };
    g.performance = {now: function () { return __dashweb_reloj(); }, timeOrigin: 0,
                     mark: function () {}, measure: function () {},
                     getEntriesByType: function () { return []; }, getEntriesByName: function () { return []; }};
    g.CSS = {supports: function () { return false; },
             escape: function (s) { return String(s).replace(/([^\w\u00a0-\uffff-])/g, '\\$1').replace(/^(\d)/, '\\3$1 '); }};
    function Observador() { this.observe = this.unobserve = this.disconnect = function () {}; this.takeRecords = function () { return []; }; }
    g.MutationObserver = g.WebKitMutationObserver = g.ResizeObserver = g.IntersectionObserver = g.PerformanceObserver = Observador;
    g.Image = function (w, h) { var i = document.createElement('img'); if (w) i.width = w; if (h) i.height = h; return i; };
    g.Option = function (t, v, d, s) {
        var o = document.createElement('option');
        if (t !== undefined) o.textContent = t;
        if (v !== undefined) o.setAttribute('value', v);
        if (s) o.selected = true;
        return o;
    };
    var B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    g.btoa = function (s) {
        s = String(s);
        var r = '';
        for (var i = 0; i < s.length; i += 3) {
            var a = s.charCodeAt(i), b = s.charCodeAt(i + 1), c = s.charCodeAt(i + 2);
            r += B64[a >> 2] + B64[(a & 3) << 4 | (b >> 4 || 0)] +
                 (i + 1 < s.length ? B64[(b & 15) << 2 | (c >> 6 || 0)] : '=') + (i + 2 < s.length ? B64[c & 63] : '=');
        }
        return r;
    };
    g.atob = function (s) {
        s = String(s).replace(/[^A-Za-z0-9+/]/g, '');
        var r = '', bits = 0, n = 0;
        for (var i = 0; i < s.length; i++) {
            bits = bits << 6 | B64.indexOf(s[i]);
            n += 6;
            if (n >= 8) { n -= 8; r += String.fromCharCode(bits >> n & 255); }
        }
        return r;
    };
    console.debug = console.trace = console.log;
    if (!console.group) console.group = console.groupCollapsed = console.groupEnd = console.table = console.dir = console.time = console.timeEnd = function () {};

    // location: la dirección de la página (lib/jsdom.dash la pone con __dashweb_lugar antes de los scripts)
    var lugar = {};
    g.__dashweb_lugar = function (u) {
        var m = /^([a-z][a-z0-9+.-]*:)\/\/([^\/?#:]*)(?::(\d+))?([^?#]*)(\?[^#]*)?(#.*)?$/i.exec(u) || [];
        lugar.protocol = m[1] || 'about:';
        lugar.hostname = m[2] || '';
        lugar.port = m[3] || '';
        lugar.host = lugar.hostname + (lugar.port ? ':' + lugar.port : '');
        lugar.pathname = m[4] || '/';
        lugar.search = m[5] && m[5].length > 1 ? m[5] : '';
        lugar.hash = m[6] && m[6].length > 1 ? m[6] : '';
        lugar.origin = lugar.protocol + '//' + lugar.host;
        lugar.href = u;
        ['URL', 'documentURI', 'baseURI'].forEach(function (k) { pon(document, k, u); });
        pon(document, 'domain', lugar.hostname);
    };
    lugar.toString = function () { return lugar.href; };
    lugar.assign = lugar.replace = function (u) { g.__dashweb_ir = String(u); };
    lugar.reload = function () { g.__dashweb_ir = lugar.href; };
    g.location = lugar;
    pon(document, 'location', lugar);

    // Al acabar los scripts: DOMContentLoaded y load (como un navegador)
    g.__dashweb_cargado = function () {
        pon(document, 'readyState', 'interactive');
        despachar(document, new Ev('readystatechange'));
        despachar(document, new Ev('DOMContentLoaded', {bubbles: true}));
        pon(document, 'activeElement', document.body);
        // load, después de lo que DOMContentLoaded haya dejado para luego (el ready de jQuery)
        g.setTimeout(function () {
            pon(document, 'readyState', 'complete');
            despachar(document, new Ev('readystatechange'));
            despachar(g, new Ev('load'));
        }, 0);
    };
})(globalThis);
