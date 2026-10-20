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
    // Cada interfaz con su nombre y su instanceof: todas comparten el prototipo de los nodos (lo que una web añade a
    // HTMLElement.prototype llega a todos), pero `x instanceof HTMLIFrameElement` mira el tipo y la etiqueta (antes
    // todas eran Nodo y todo elemento era un iframe: React no salía de un bucle; tarea 37a3)
    function esNodo(o) { return o !== null && typeof o == 'object' && N.isPrototypeOf(o); }
    function esSvg(o) { return o.localName == 'svg' || !!(o.parentNode && o.closest('svg')); }
    function interfaz(nombre, prueba) {
        var F = function () { throw new TypeError('Illegal constructor'); };
        F.prototype = N;
        Object.defineProperty(F, 'name', {value: nombre});
        Object.defineProperty(F, Symbol.hasInstance, {value: function (o) { return esNodo(o) && prueba(o); }});
        g[nombre] = F;
    }
    Object.defineProperty(Nodo, Symbol.hasInstance, {value: esNodo});
    g.Node = Nodo;
    var tipo = function (t) { return function (o) { return o.nodeType == t; }; };
    interfaz('Element', tipo(1));
    interfaz('HTMLElement', function (o) { return o.nodeType == 1 && !esSvg(o); });
    interfaz('SVGElement', function (o) { return o.nodeType == 1 && esSvg(o); });
    interfaz('SVGSVGElement', function (o) { return o.nodeType == 1 && o.localName == 'svg'; });
    interfaz('Document', tipo(9));
    interfaz('HTMLDocument', tipo(9));
    interfaz('DocumentFragment', tipo(11));
    interfaz('ShadowRoot', function () { return false; });
    interfaz('Text', tipo(3));
    interfaz('Comment', tipo(8));
    interfaz('CharacterData', function (o) { return o.nodeType == 3 || o.nodeType == 8; });
    var ETIQUETAS = {Anchor: 'a', Area: 'area', Audio: 'audio', BR: 'br', Base: 'base', Body: 'body', Button: 'button',
        Canvas: 'canvas', Data: 'data', DataList: 'datalist', Details: 'details', Dialog: 'dialog', Div: 'div',
        DList: 'dl', Embed: 'embed', FieldSet: 'fieldset', Form: 'form', Head: 'head', HR: 'hr', Html: 'html',
        IFrame: 'iframe', Image: 'img', Input: 'input', Label: 'label', Legend: 'legend', LI: 'li', Link: 'link',
        Map: 'map', Meta: 'meta', Meter: 'meter', OList: 'ol', Object: 'object', OptGroup: 'optgroup',
        Option: 'option', Output: 'output', Paragraph: 'p', Picture: 'picture', Pre: 'pre', Progress: 'progress',
        Script: 'script', Select: 'select', Slot: 'slot', Source: 'source', Span: 'span', Style: 'style',
        TableCaption: 'caption', Table: 'table', TableRow: 'tr', TableSection: 'thead tbody tfoot',
        TableCell: 'td th', TableCol: 'col colgroup', Template: 'template', TextArea: 'textarea', Time: 'time',
        Title: 'title', Track: 'track', UList: 'ul', Video: 'video', Media: 'video audio',
        Heading: 'h1 h2 h3 h4 h5 h6', Quote: 'blockquote q', Mod: 'ins del'};
    Object.keys(ETIQUETAS).forEach(function (k) {
        var es = {};
        ETIQUETAS[k].split(' ').forEach(function (t) { es[t] = true; });
        interfaz('HTML' + k + 'Element', function (o) { return o.nodeType == 1 && es[o.localName] === true && !esSvg(o); });
    });
    interfaz('HTMLUnknownElement', function () { return false; });
    function Ventana() { throw new TypeError('Illegal constructor'); }
    Object.defineProperty(Ventana, 'name', {value: 'Window'});
    Object.defineProperty(Ventana, Symbol.hasInstance, {value: function (o) { return o === g; }});
    g.Window = Ventana;
    function Destino() {}
    Object.defineProperty(Destino, 'name', {value: 'EventTarget'});
    Object.defineProperty(Destino, Symbol.hasInstance, {value: function (o) {
        return o === g || esNodo(o) || (o !== null && typeof o == 'object' && typeof o.addEventListener == 'function');
    }});
    Destino.prototype.addEventListener = function (t, f, o) { escuchar(this, t, f, o); };
    Destino.prototype.removeEventListener = function (t, f, o) { olvidar(this, t, f, o); };
    Destino.prototype.dispatchEvent = function (e) { return despachar(this, e); };
    if (!g.EventTarget) g.EventTarget = Destino;
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
         'screenX', 'screenY', 'altKey', 'ctrlKey', 'shiftKey', 'metaKey', 'relatedTarget', 'promise', 'reason',
         'data', 'message', 'error'].forEach(function (k) {
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
     'ProgressEvent', 'PromiseRejectionEvent'].forEach(sub);
    // (PromiseRejectionEvent: sin él, core-js da por roto el Promise de QuickJS y pone el suyo, escrito en
    // JavaScript: React en pre.opentimetrack.com tardaba 25 s; tarea 37a3)
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
    // Shadow DOM mínimo: la raíz de sombra es un fragmento aparte (no se pinta; Next.js pone ahí su anunciador de
    // rutas, que no se ve)
    N.attachShadow = function (o) {
        var r = document.createDocumentFragment();
        Object.defineProperty(r, 'host', {value: this});
        Object.defineProperty(r, 'mode', {value: o && o.mode || 'open'});
        Object.defineProperty(this, 'shadowRoot', {value: o && o.mode == 'closed' ? null : r, configurable: true});
        return r;
    };
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
        var completa = p[0] == 'href' || p[0] == 'src' || p[0] == 'action';
        def(p[0], function () {
            var v = this.getAttribute(a);
            if (p[0] == 'tabIndex') return v === null ? -1 : +v;
            if (v === null) return p[0] == 'action' && this.localName == 'form' ? String(document.URL || '') : '';
            // href, src y action se leen como dirección completa, como en los navegadores (Next.js hace
            // new URL(document.currentScript.src))
            if (completa) { try { return new URL(v, String(document.baseURI || location.href)).href; } catch (e) { return v; } }
            return v;
        }, function (v) { this.setAttribute(a, v); });
    });
    // las partes de la dirección de un enlace (a.hash, a.pathname...: HTMLHyperlinkElementUtils)
    ['protocol', 'host', 'hostname', 'port', 'pathname', 'search', 'hash', 'origin', 'username', 'password'].forEach(function (k) {
        def(k, function () {
            if (this.localName != 'a' && this.localName != 'area') return undefined;
            var h = this.href;
            if (h === '') return k == 'origin' ? '' : k == 'pathname' ? '' : '';
            try { return new URL(h)[k]; } catch (e) { return ''; }
        }, function (v) {
            if (this.localName != 'a' && this.localName != 'area' || k == 'origin') return;
            try { var u = new URL(this.href); u[k] = v; this.setAttribute('href', u.href); } catch (e) {}
        });
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
        Object.defineProperty(cl, 'value', {get: function () { return el.getAttribute('class') || ''; },
                                            set: function (v) { el.setAttribute('class', String(v)); }});
        // se recorre como una lista (Array.from, for...of, cl[0]): Lenis lo hace, tarea 37a3
        cl[Symbol.iterator] = cl.values = function () { return lista()[Symbol.iterator](); };
        cl.keys = function () { return lista().keys(); };
        cl.entries = function () { return lista().entries(); };
        cl.supports = function () { return true; };
        return new Proxy(cl, {get: function (t, k) {
            return typeof k == 'string' && /^\d+$/.test(k) ? lista()[+k] : t[k];
        }});
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
    // las cookies de verdad (lib/cookies.dash): las mismas que van por HTTP, sin las HttpOnly
    Object.defineProperty(document, 'cookie', {
        get: function () { return __dashweb_galletas(String(location.href)); },
        set: function (v) { __dashweb_galleta(String(location.href), String(v)); }
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
    // TextEncoder y TextDecoder (UTF-8; TextDecoder también UTF-16LE y Latin-1): las webs de hoy los usan al
    // empezar (el webpack de Next.js, p. ej.)
    function utf8(s, destino) {
        // UTF-8 de s en un Uint8Array: en destino (encodeInto: solo los caracteres enteros que caben) o en uno nuevo
        // del tamaño justo. Dos pasadas, sin listas intermedias (los datos de una página pueden medir megas).
        var n = s.length, limite = destino ? destino.length : Infinity, total = 0, i, c, d;
        for (i = 0; i < n; i++) {
            c = s.charCodeAt(i);
            var k = c < 0x80 ? 1 : c < 0x800 ? 2 : 3, u = 1;
            if (c >= 0xD800 && c < 0xDC00 && i + 1 < n && (d = s.charCodeAt(i + 1)) >= 0xDC00 && d < 0xE000) { k = 4; u = 2; }
            if (total + k > limite) break;
            total += k;
            i += u - 1;
        }
        var leidos = i, b = destino || new Uint8Array(total), p = 0;
        for (i = 0; i < leidos; i++) {
            c = s.charCodeAt(i);
            if (c < 0x80) { b[p++] = c; continue; }
            if (c < 0x800) { b[p++] = 0xC0 | c >> 6; b[p++] = 0x80 | c & 63; continue; }
            if (c >= 0xD800 && c < 0xE000) {
                if (c < 0xDC00 && i + 1 < n && (d = s.charCodeAt(i + 1)) >= 0xDC00 && d < 0xE000) {
                    c = 0x10000 + ((c - 0xD800) << 10) + (d - 0xDC00);
                    i++;
                    b[p++] = 0xF0 | c >> 18; b[p++] = 0x80 | c >> 12 & 63; b[p++] = 0x80 | c >> 6 & 63; b[p++] = 0x80 | c & 63;
                    continue;
                }
                c = 0xFFFD;
            }
            b[p++] = 0xE0 | c >> 12; b[p++] = 0x80 | c >> 6 & 63; b[p++] = 0x80 | c & 63;
        }
        return {b: b, leidos: leidos, escritos: total};
    }
    function TextEncoder() {}
    TextEncoder.prototype.encoding = 'utf-8';
    TextEncoder.prototype.encode = function (s) {
        return utf8(s === undefined ? '' : String(s)).b;
    };
    TextEncoder.prototype.encodeInto = function (s, destino) {
        var r = utf8(String(s), destino);
        return {read: r.leidos, written: r.escritos};
    };
    var NOMBRES = {'utf-8': 'utf-8', 'utf8': 'utf-8', 'unicode-1-1-utf-8': 'utf-8', 'utf-16le': 'utf-16le',
                   'utf-16': 'utf-16le', 'latin1': 'windows-1252', 'iso-8859-1': 'windows-1252',
                   'windows-1252': 'windows-1252', 'ascii': 'windows-1252', 'us-ascii': 'windows-1252'};
    function TextDecoder(etiqueta, o) {
        var e = NOMBRES[String(etiqueta === undefined ? 'utf-8' : etiqueta).trim().toLowerCase()];
        if (!e) throw new RangeError("The encoding label provided ('" + etiqueta + "') is invalid.");
        this.encoding = e;
        this.fatal = !!(o && o.fatal);
        this.ignoreBOM = !!(o && o.ignoreBOM);
        this._resto = new Uint8Array(0);
        this._empezado = false;
    }
    TextDecoder.prototype.decode = function (v, o) {
        // sobre los bytes tal cual (sin copiarlos a una lista: los datos de una página pueden medir megas); el
        // texto se junta por trozos
        var seguir = !!(o && o.stream), b = this._resto;
        if (v !== undefined && v !== null) {
            var u = v instanceof ArrayBuffer ? new Uint8Array(v) : new Uint8Array(v.buffer, v.byteOffset, v.byteLength);
            if (b.length) { var m = new Uint8Array(b.length + u.length); m.set(b); m.set(u, b.length); b = m; } else b = u;
        }
        this._resto = new Uint8Array(0);
        var partes = [], cods = [], i = 0, n = b.length, mal = this.fatal;
        function poner(c) {
            cods.push(c);
            if (cods.length >= 4096) { partes.push(String.fromCharCode.apply(null, cods)); cods = []; }
        }
        function malo() {
            if (mal) throw new TypeError('The encoded data was not valid for encoding utf-8');
            poner(0xFFFD);
        }
        if (this.encoding === 'windows-1252') {
            for (; i < n; i++) poner(b[i]);
        } else if (this.encoding === 'utf-16le') {
            if (!this.ignoreBOM && !this._empezado && n >= 2 && b[0] === 0xFF && b[1] === 0xFE) i = 2;
            for (; i + 1 < n; i += 2) poner(b[i] | b[i + 1] << 8);
            if (i < n) { if (seguir) this._resto = b.slice(i); else malo(); }
        } else {
            if (!this.ignoreBOM && !this._empezado && n >= 3 && b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF) i = 3;
            while (i < n) {
                var c = b[i], k = c < 0x80 ? 0 : c >= 0xC2 && c < 0xE0 ? 1 : c >= 0xE0 && c < 0xF0 ? 2 : c >= 0xF0 && c < 0xF5 ? 3 : -1;
                if (k < 0) { malo(); i++; continue; }
                if (k === 0) { poner(c); i++; continue; }
                if (seguir && i + k >= n) {
                    // la secuencia sigue en el trozo siguiente (si lo que hay de ella está bien)
                    var bien = true;
                    for (var q = i + 1; q < n; q++) if ((b[q] & 0xC0) !== 0x80) bien = false;
                    if (bien) { this._resto = b.slice(i); break; }
                }
                // (el segundo byte tiene sus límites: ni secuencias largas de más, ni suplentes, ni > 10FFFF)
                var cp = c & (k === 1 ? 0x1F : k === 2 ? 0x0F : 0x07), j = 1;
                var bajo = c === 0xE0 ? 0xA0 : c === 0xF0 ? 0x90 : 0x80, alto = c === 0xED ? 0x9F : c === 0xF4 ? 0x8F : 0xBF;
                for (; j <= k; j++) {
                    if (i + j >= n || b[i + j] < (j === 1 ? bajo : 0x80) || b[i + j] > (j === 1 ? alto : 0xBF)) break;
                    cp = cp << 6 | b[i + j] & 63;
                }
                if (j <= k) {
                    // un U+FFFD por lo que iba bien; el byte malo se vuelve a mirar
                    malo();
                    i += j;
                    continue;
                }
                if (cp >= 0x10000) { cp -= 0x10000; poner(0xD800 + (cp >> 10)); poner(0xDC00 + (cp & 0x3FF)); }
                else poner(cp);
                i += k + 1;
            }
        }
        this._empezado = seguir;
        partes.push(String.fromCharCode.apply(null, cods));
        return partes.join('');
    };
    // ReadableStream sencilla (una cola y lectores con promesas): Next.js mete en una los datos de la página
    // (self.__next_f) y React los lee con getReader().read()
    function ReadableStream(fuente) {
        var cola = [], cerrado = false, fallo = null, esperando = [], tirando = false;
        fuente = fuente || {};
        var control = {
            enqueue: function (x) {
                if (cerrado) throw new TypeError('Invalid state: the stream is closed');
                if (esperando.length) esperando.shift().ok({value: x, done: false}); else cola.push(x);
            },
            close: function () {
                cerrado = true;
                while (esperando.length && !cola.length) esperando.shift().ok({value: undefined, done: true});
            },
            error: function (e) {
                fallo = e === undefined ? new TypeError('stream error') : e;
                cola = [];
                while (esperando.length) esperando.shift().mal(fallo);
            },
            get desiredSize() { return cerrado ? 0 : 1 - cola.length; }
        };
        function tirar() {
            // pull: cuando alguien espera y no hay nada
            if (!fuente.pull || tirando || cerrado || fallo) return;
            tirando = true;
            Promise.resolve().then(function () { return fuente.pull(control); }).then(function () {
                tirando = false;
                if (esperando.length && !cola.length) tirar();
            }, function (e) { tirando = false; control.error(e); });
        }
        this.locked = false;
        this._leer = function () {
            return new Promise(function (ok, mal) {
                if (cola.length) ok({value: cola.shift(), done: false});
                else if (fallo) mal(fallo);
                else if (cerrado) ok({value: undefined, done: true});
                else { esperando.push({ok: ok, mal: mal}); tirar(); }
            });
        };
        this._cancelar = function (r) {
            cerrado = true;
            cola = [];
            while (esperando.length) esperando.shift().ok({value: undefined, done: true});
            return Promise.resolve(fuente.cancel ? fuente.cancel(r) : undefined).then(function () {});
        };
        if (fuente.start) {
            try { fuente.start(control); } catch (e) { control.error(e); }
        }
    }
    ReadableStream.prototype.getReader = function () {
        if (this.locked) throw new TypeError('ReadableStream is locked');
        var s = this;
        s.locked = true;
        return {
            read: function () { return s._leer(); },
            releaseLock: function () { s.locked = false; },
            cancel: function (r) { return s._cancelar(r); },
            closed: new Promise(function () {})
        };
    };
    ReadableStream.prototype.cancel = function (r) { return this._cancelar(r); };
    ReadableStream.prototype[Symbol.asyncIterator] = function () {
        var s = this;
        return {next: function () { return s._leer(); }, return: function () { return s._cancelar().then(function () { return {done: true}; }); },
                [Symbol.asyncIterator]: function () { return this; }};
    };
    // (antes sin poner: con ella, Next.js en commodoremalacca.club dejaba el Amiga sin memoria, tarea 28j; ahora
    // QuickJS tiene su tope, JS_MEMORIA, y pre.opentimetrack.com la necesita al empezar)
    g.__dashweb_ReadableStream = ReadableStream;
    if (!g.ReadableStream) g.ReadableStream = ReadableStream;
    if (!g.TextEncoder) g.TextEncoder = TextEncoder;
    if (!g.TextDecoder) g.TextDecoder = TextDecoder;
    console.debug = console.trace = console.log;
    if (!console.group) console.group = console.groupCollapsed = console.groupEnd = console.table = console.dir = console.time = console.timeEnd = function () {};

    // URL y URLSearchParams (WHATWG URL, lo que usan las webs; tarea 37a2: el runtime de Turbopack los necesita)
    var URL_ESPECIALES = {'http:': '80', 'https:': '443', 'ftp:': '21', 'ws:': '80', 'wss:': '443', 'file:': ''};
    function urlPct(s, re) {
        return s.replace(re, function (c) {
            var r;
            try { r = encodeURIComponent(c); } catch (e) { return '%EF%BF%BD'; }
            return r == c ? '%' + (c.charCodeAt(0) < 16 ? '0' : '') + c.charCodeAt(0).toString(16).toUpperCase() : r;
        });
    }
    var URL_RUTA = /[\u0000-\u0020"<>`{}\u007f-\uffff]/g, URL_CONSULTA = /[\u0000-\u0020"#<>\u007f-\uffff]/g,
        URL_CONSULTA_ESP = /[\u0000-\u0020"#'<>\u007f-\uffff]/g, URL_ANCLA = /[\u0000-\u0020"<>`\u007f-\uffff]/g,
        URL_USUARIO = /[\u0000-\u0020"#<>?`{}\/:;=@\[\\\]^|\u007f-\uffff]/g;
    function urlRuta(ruta, especial) {
        if (especial) ruta = ruta.replace(/\\/g, '/');
        var trozos = ruta.split('/'), r = [];
        for (var i = 1; i < trozos.length; i++) {
            var t = trozos[i], ultimo = i == trozos.length - 1, tl = t.toLowerCase();
            if (tl == '..' || tl == '.%2e' || tl == '%2e.' || tl == '%2e%2e') {
                if (r.length) r.pop();
                if (ultimo) r.push('');
            } else if (tl == '.' || tl == '%2e') {
                if (ultimo) r.push('');
            } else r.push(t);
        }
        return '/' + urlPct(r.join('/'), URL_RUTA);
    }
    // La parte de servidor ("usuario:clave@nombre:puerto"); null si no vale
    function urlAutoridad(a, u) {
        var arroba = a.lastIndexOf('@');
        u.username = u.password = '';
        if (arroba >= 0) {
            var cred = a.slice(0, arroba), dos = cred.indexOf(':');
            u.username = urlPct(dos >= 0 ? cred.slice(0, dos) : cred, URL_USUARIO);
            u.password = dos >= 0 ? urlPct(cred.slice(dos + 1), URL_USUARIO) : '';
            a = a.slice(arroba + 1);
        }
        var m = /^(\[[0-9a-fA-F:.]*\]|[^:]*)(?::(\d*))?$/.exec(a);
        if (!m) return null;
        var nombre = m[1], especial = u.protocol in URL_ESPECIALES;
        if (especial) {
            try { nombre = decodeURIComponent(nombre); } catch (e) {}
            nombre = nombre.toLowerCase();
            if (/[\u0000\t\n\r #\/:<>?@\[\\\]^|%]/.test(nombre.replace(/^\[.*\]$/, ''))) return null;
            if (nombre == '' && u.protocol != 'file:') return null;
        }
        u.hostname = nombre;
        var puerto = m[2] || '';
        if (puerto != '') {
            puerto = String(parseInt(puerto, 10));
            if (+puerto > 65535) return null;
            if (URL_ESPECIALES[u.protocol] === puerto) puerto = '';
        }
        u.port = puerto;
        return u;
    }
    function urlCopia(b) {
        return {protocol: b.protocol, username: b.username, password: b.password, hostname: b.hostname,
                port: b.port, pathname: b.pathname, search: b.search, hash: b.hash, opaca: b.opaca, conHost: b.conHost};
    }
    // La dirección en partes (con la base si es relativa); null si no es una dirección
    function urlAnalizar(entrada, base) {
        var s = String(entrada).replace(/^[\u0000-\u0020]+|[\u0000-\u0020]+$/g, '').replace(/[\t\n\r]/g, '');
        var u, resto, ancla = '', consulta = null;
        var h = s.indexOf('#');
        if (h >= 0) { ancla = s.slice(h); s = s.slice(0, h); }
        var m = /^([a-zA-Z][a-zA-Z0-9+.\-]*):/.exec(s);
        if (m) {
            var proto = m[1].toLowerCase() + ':', especial = proto in URL_ESPECIALES;
            resto = s.slice(m[0].length);
            u = {protocol: proto, username: '', password: '', hostname: '', port: '', pathname: '', search: '', hash: '',
                 opaca: false, conHost: false};
            if (especial && base && base.protocol == proto && !/^[\/\\]/.test(resto)) {
                // "http:a/b" con base http: relativa a la base
                return urlRelativa(resto + ancla, base);
            }
            var barras = especial ? /^[\/\\]{2}/ : /^\/\//;
            if (barras.test(resto) || (especial && proto != 'file:')) {
                resto = resto.replace(proto == 'file:' ? /^[\/\\]{2}/ : especial ? /^[\/\\]*/ : /^\/\//, '');
                var fin = resto.search(especial ? /[\/\\?]/ : /[\/?]/);
                if (fin < 0) fin = resto.length;
                if (!urlAutoridad(resto.slice(0, fin), u)) return null;
                u.conHost = true;
                resto = resto.slice(fin);
            } else if (especial) {
                resto = resto.replace(/^[\/\\]+/, '/');
            }
            var q = resto.indexOf('?');
            if (q >= 0) { consulta = resto.slice(q + 1); resto = resto.slice(0, q); }
            if (especial || resto.charAt(0) == '/' || u.conHost) u.pathname = (especial || resto != '') ? urlRuta(resto, especial) : '';
            else { u.opaca = true; u.pathname = urlPct(resto, /[\u0000-\u001f\u007f-\uffff]/g); }
            if (consulta !== null) u.search = '?' + urlPct(consulta, especial ? URL_CONSULTA_ESP : URL_CONSULTA);
            u.hash = ancla != '' ? '#' + urlPct(ancla.slice(1), URL_ANCLA) : '';
            return u;
        }
        if (!base) return null;
        return urlRelativa(s + ancla, base);
    }
    function urlRelativa(s, base) {
        var especial = base.protocol in URL_ESPECIALES, ancla = '', consulta = null;
        var h = s.indexOf('#');
        if (h >= 0) { ancla = s.slice(h); s = s.slice(0, h); }
        if (base.opaca && !(s == '' && ancla != '')) return null;
        var u = urlCopia(base);
        var q = s.indexOf('?');
        if (q >= 0) { consulta = s.slice(q + 1); s = s.slice(0, q); }
        var barra = especial ? /^[\/\\]/ : /^\//, dos = especial ? /^[\/\\]{2}/ : /^\/\//;
        if (dos.test(s)) {
            s = s.replace(especial ? /^[\/\\]*/ : /^\/\//, '');
            var fin = s.search(especial ? /[\/\\]/ : /\//);
            if (fin < 0) fin = s.length;
            if (!urlAutoridad(s.slice(0, fin), u)) return null;
            u.conHost = true;
            u.pathname = urlRuta(s.slice(fin), especial);
            u.search = '';
        } else if (barra.test(s)) {
            u.pathname = urlRuta(s, especial);
            u.search = '';
        } else if (s != '') {
            var dir = u.pathname.slice(0, u.pathname.lastIndexOf('/') + 1);
            u.pathname = urlRuta((dir || '/') + s, especial);
            u.search = '';
        } else if (consulta === null && ancla == '') {
            u.hash = '';
            return u;
        }
        if (consulta !== null) u.search = '?' + urlPct(consulta, especial ? URL_CONSULTA_ESP : URL_CONSULTA);
        u.hash = ancla != '' ? '#' + urlPct(ancla.slice(1), URL_ANCLA) : '';
        return u;
    }
    function urlTexto(u) {
        var r = u.protocol;
        if (u.conHost || u.hostname != '' || u.protocol == 'file:') {
            r += '//';
            if (u.username || u.password) r += u.username + (u.password ? ':' + u.password : '') + '@';
            r += u.hostname + (u.port ? ':' + u.port : '');
        }
        return r + u.pathname + u.search + u.hash;
    }
    function URL(url, base) {
        if (!(this instanceof URL)) throw new TypeError("Failed to construct 'URL': use new");
        var b = null;
        if (base !== undefined) {
            b = base instanceof URL ? base._u : urlAnalizar(base, null);
            if (!b) throw new TypeError("Invalid base URL: " + base);
        }
        var u = url instanceof URL ? urlCopia(url._u) : urlAnalizar(url, b);
        if (!u) throw new TypeError("Invalid URL: " + url);
        this._u = u;
        this._params = null;
    }
    URL.canParse = function (url, base) { try { new URL(url, base); return true; } catch (e) { return false; } };
    URL.parse = function (url, base) { try { return new URL(url, base); } catch (e) { return null; } };
    var blobs = 0;
    URL.createObjectURL = function () { return 'blob:' + (g.location ? g.location.origin : 'null') + '/' + (++blobs); };
    URL.revokeObjectURL = function () {};
    function urlProp(nombre, leer, escribir) {
        Object.defineProperty(URL.prototype, nombre, {get: leer, set: escribir || function () {}, configurable: true, enumerable: true});
    }
    urlProp('href', function () { return urlTexto(this._u); }, function (v) {
        var u = urlAnalizar(v, null);
        if (!u) throw new TypeError("Invalid URL: " + v);
        this._u = u;
        if (this._params) this._params._leer(u.search);
    });
    urlProp('protocol', function () { return this._u.protocol; }, function (v) {
        var p = String(v).replace(/:.*$/, '').toLowerCase() + ':';
        if (/^[a-z][a-z0-9+.\-]*:$/.test(p) && ((p in URL_ESPECIALES) == (this._u.protocol in URL_ESPECIALES))) {
            this._u.protocol = p;
            if (URL_ESPECIALES[p] === this._u.port) this._u.port = '';
        }
    });
    urlProp('username', function () { return this._u.username; }, function (v) { this._u.username = urlPct(String(v), URL_USUARIO); });
    urlProp('password', function () { return this._u.password; }, function (v) { this._u.password = urlPct(String(v), URL_USUARIO); });
    urlProp('host', function () { return this._u.hostname + (this._u.port ? ':' + this._u.port : ''); }, function (v) {
        var u = urlCopia(this._u);
        if (!this._u.opaca && urlAutoridad(String(v), u)) { u.username = this._u.username; u.password = this._u.password; this._u = u; }
    });
    urlProp('hostname', function () { return this._u.hostname; }, function (v) {
        var u = urlCopia(this._u), puerto = this._u.port;
        if (!this._u.opaca && urlAutoridad(String(v).replace(/:.*$/, ''), u)) { u.port = puerto; u.username = this._u.username; u.password = this._u.password; this._u = u; }
    });
    urlProp('port', function () { return this._u.port; }, function (v) {
        var p = String(v).replace(/\D.*$/, '');
        if (p == '' || +p <= 65535) this._u.port = (p == '' || URL_ESPECIALES[this._u.protocol] === String(+p)) ? '' : String(+p);
    });
    urlProp('pathname', function () { return this._u.pathname; }, function (v) {
        if (this._u.opaca) return;
        var s = String(v);
        this._u.pathname = urlRuta(s.charAt(0) == '/' || s.charAt(0) == '\\' ? s : '/' + s, this._u.protocol in URL_ESPECIALES);
    });
    urlProp('search', function () { return this._u.search == '?' ? '' : this._u.search; }, function (v) {
        var s = String(v).replace(/^\?/, '');
        this._u.search = s == '' ? '' : '?' + urlPct(s, this._u.protocol in URL_ESPECIALES ? URL_CONSULTA_ESP : URL_CONSULTA);
        if (this._params) this._params._leer(this._u.search);
    });
    urlProp('hash', function () { return this._u.hash == '#' ? '' : this._u.hash; }, function (v) {
        var s = String(v).replace(/^#/, '');
        this._u.hash = s == '' ? '' : '#' + urlPct(s, URL_ANCLA);
    });
    urlProp('origin', function () {
        var p = this._u.protocol;
        if (p == 'blob:') { try { return new URL(this._u.pathname).origin; } catch (e) { return 'null'; } }
        return (p in URL_ESPECIALES) && p != 'file:' ? p + '//' + this.host : 'null';
    });
    urlProp('searchParams', function () {
        if (!this._params) { this._params = new URLSearchParams(this._u.search); this._params._url = this; }
        return this._params;
    });
    URL.prototype.toString = URL.prototype.toJSON = function () { return this.href; };

    function urlFormDes(s) {
        s = s.replace(/\+/g, ' ');
        try { return decodeURIComponent(s); }
        catch (e) { return s.replace(/%([0-9a-fA-F]{2})/g, function (x, h) { return String.fromCharCode(parseInt(h, 16)); }); }
    }
    function urlFormCod(s) {
        return urlPct(String(s), /[^A-Za-z0-9*\-._ ]/g).replace(/ /g, '+');
    }
    function URLSearchParams(init) {
        this._lista = [];
        this._url = null;
        if (init === undefined || init === null) return;
        if (typeof init == 'object' && typeof init[Symbol.iterator] == 'function') {
            for (var par of init) {
                var p = Array.from(par);
                if (p.length != 2) throw new TypeError('URLSearchParams: each pair needs 2 items');
                this._lista.push([String(p[0]), String(p[1])]);
            }
        } else if (typeof init == 'object') {
            for (var k of Object.keys(init)) this._lista.push([k, String(init[k])]);
        } else this._leer(String(init));
    }
    var USP = URLSearchParams.prototype;
    USP._leer = function (s) {
        this._lista = [];
        s = String(s).replace(/^\?/, '');
        if (s == '') return;
        s.split('&').forEach(function (t) {
            if (t == '') return;
            var i = t.indexOf('=');
            this._lista.push(i >= 0 ? [urlFormDes(t.slice(0, i)), urlFormDes(t.slice(i + 1))] : [urlFormDes(t), '']);
        }, this);
    };
    USP._cambio = function () {
        if (this._url) { var t = this.toString(); this._url._u.search = t == '' ? '' : '?' + t; }
    };
    USP.append = function (k, v) { this._lista.push([String(k), String(v)]); this._cambio(); };
    USP['delete'] = function (k, v) {
        k = String(k);
        this._lista = this._lista.filter(function (p) { return !(p[0] == k && (v === undefined || p[1] == String(v))); });
        this._cambio();
    };
    USP.get = function (k) { k = String(k); for (var p of this._lista) if (p[0] == k) return p[1]; return null; };
    USP.getAll = function (k) { k = String(k); return this._lista.filter(function (p) { return p[0] == k; }).map(function (p) { return p[1]; }); };
    USP.has = function (k, v) { k = String(k); return this._lista.some(function (p) { return p[0] == k && (v === undefined || p[1] == String(v)); }); };
    USP.set = function (k, v) {
        k = String(k); v = String(v);
        var hecho = false, r = [];
        for (var p of this._lista) {
            if (p[0] != k) r.push(p);
            else if (!hecho) { r.push([k, v]); hecho = true; }
        }
        if (!hecho) r.push([k, v]);
        this._lista = r;
        this._cambio();
    };
    USP.sort = function () {
        this._lista = this._lista.map(function (p, i) { return [p, i]; })
            .sort(function (a, b) { return a[0][0] < b[0][0] ? -1 : a[0][0] > b[0][0] ? 1 : a[1] - b[1]; })
            .map(function (x) { return x[0]; });
        this._cambio();
    };
    USP.toString = function () { return this._lista.map(function (p) { return urlFormCod(p[0]) + '=' + urlFormCod(p[1]); }).join('&'); };
    // sobre la lista viva (si f borra, lo borrado ya no sale: core-js lo comprueba)
    USP.forEach = function (f, esto) { for (var i = 0; i < this._lista.length; i++) f.call(esto, this._lista[i][1], this._lista[i][0], this); };
    USP.entries = USP[Symbol.iterator] = function () { return this._lista.map(function (p) { return [p[0], p[1]]; })[Symbol.iterator](); };
    USP.keys = function () { return this._lista.map(function (p) { return p[0]; })[Symbol.iterator](); };
    USP.values = function () { return this._lista.map(function (p) { return p[1]; })[Symbol.iterator](); };
    Object.defineProperty(USP, 'size', {get: function () { return this._lista.length; }, configurable: true});
    USP[Symbol.toStringTag] = 'URLSearchParams';
    g.URL = g.webkitURL = URL;
    g.URLSearchParams = URLSearchParams;

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
