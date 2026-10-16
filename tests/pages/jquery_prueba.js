// Pruebas de jQuery para tests/test_jquery.dash: cada línea escribe lo que da en dashweb.
function ver(nombre, f) {
    try { console.log(nombre + ': ' + f()); }
    catch (e) { console.log(nombre + ': ERROR ' + e + ' | ' + String(e.stack).replace(/\n\s*/g, ' | ')); }
}
ver('jquery', function () { return jQuery.fn.jquery + ' ' + (typeof $) + ' ' + ($ === jQuery); });
$(function () { console.log('listo: ' + document.readyState + ' ' + $('li').length); });
$(window).on('load', function () { console.log('load'); });
ver('texto', function () { return $('#t').text(); });
ver('h1', function () { $('#t').text('Cambiado'); return document.getElementById('t').textContent; });
ver('li', function () {
    return $('#lista li').length + ' ' + $('#lista li.par').length + ' ' + $('li').first().text() + ' ' +
        $('li').last().text() + ' ' + $('li').eq(1).text();
});
ver('nuevo', function () {
    $('<li class="nuevo">cuatro</li>').appendTo('#lista');
    return $('#lista li').length + ' ' + $('#lista .nuevo').text();
});
ver('clases', function () {
    $('#lista li').addClass('item');
    return $('li.item').length + ' ' + $('li').first().hasClass('item') + ' ' + $('#lista li').eq(1).attr('class');
});
ver('par', function () { $('li.par').removeClass('par'); return $('.par').length; });
ver('toggle', function () { $('#p').toggleClass('a'); var x = $('#p').hasClass('a'); $('#p').toggleClass('a'); return x + ' ' + $('#p').hasClass('a'); });
ver('attr', function () {
    $('#p').attr('data-x', '7').css('color', 'red');
    return $('#p').attr('data-x') + ' ' + $('#p').data('x') + ' ' + document.getElementById('p').style.color + ' ' + $('#p').css('color');
});
ver('html', function () { $('#p').html('<b>negrita</b> y <i>más</i>'); return $('#p').html() + ' ' + $('#p b').length + ' ' + $('#p').children().length; });
var clics = 0;
ver('click', function () {
    $('#boton').on('click', function (e) { clics++; console.log('clic ' + e.type + ' ' + this.id + ' ' + (e.target === this)); });
    $('#boton').trigger('click');
    $('#boton').click();
    document.getElementById('boton').click();
    return clics;
});
ver('delegado', function () {
    var visto = '';
    $(document).on('click', '.item', function () { visto += $(this).text(); });
    $('#lista li').first().trigger('click');
    return visto;
});
ver('off', function () { $('#boton').off('click'); $('#boton').trigger('click'); return clics; });
ver('each', function () { return $.map($('#lista li'), function (e) { return e.textContent; }).join(','); });
ver('find', function () {
    return $('#lista').find('li').length + ' ' + $('li').first().closest('ul').attr('id') + ' ' +
        $('li').first().parent()[0].tagName + ' ' + $('li').first().next().text() + ' ' + $('li').last().prev().text() +
        ' ' + $('li').first().siblings().length;
});
ver('filtros', function () {
    return $('li:first').text() + ' ' + $('li:last').text() + ' ' + $('li:eq(1)').text() + ' ' + $('li:odd').length +
        ' ' + $('li:not(.nuevo)').length + ' ' + $('li:contains(cua)').length + ' ' + $('#lista > li:nth-child(2)').text();
});
ver('hide', function () { $('#p').hide(); return document.getElementById('p').style.display + ' ' + $('#p').is(':hidden') + ' ' + $('#p').is(':visible'); });
ver('show', function () { $('#p').show(); return '[' + document.getElementById('p').style.display + '] ' + $('#p').is(':visible'); });
ver('val', function () { var a = $('#campo').val(); $('#campo').val('nuevo'); return a + ' ' + $('#campo').val() + ' ' + $('#sel').val(); });
ver('prop', function () { return $('#casilla').prop('checked') + ' ' + $('#casilla').is(':checked') + ' ' + $('input:checked').length; });
ver('remove', function () { $('#lista li').eq(0).remove(); return $('#lista li').length; });
ver('wrap', function () { $('#p').wrap('<div class="envoltorio"></div>'); return $('#p').parent().attr('class'); });
ver('before', function () { $('#p').before('<span id="antes">a</span>').after('<span id="despues">d</span>'); return $('#antes').next().attr('id') + ' ' + $('#despues').prev().attr('id'); });
ver('empty', function () { $('#p').empty(); return $('#p').children().length + '[' + $('#p').text() + ']'; });
ver('util', function () {
    return $.extend({a: 1}, {b: 2}).b + ' ' + $.trim('  x  ') + ' ' + Array.isArray([1]) + ' ' + $.isPlainObject({}) +
        ' ' + $.inArray(2, [1, 2]) + ' ' + JSON.stringify($.makeArray($('li').slice(0, 1)).length);
});
ver('deferred', function () {
    var d = $.Deferred();
    d.done(function (v) { console.log('deferred: ' + v); });
    d.resolve('hecho');
    return d.state();
});
ver('serialize', function () { return $('#formulario').serialize(); });
ver('css', function () { $('#p').css({width: '100px', 'margin-left': '5px'}); return $('#p').css('width') + ' ' + document.getElementById('p').getAttribute('style'); });
setTimeout(function () { console.log('temporizador'); }, 300);
console.log('fin del script');
