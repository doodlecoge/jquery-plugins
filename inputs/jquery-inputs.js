/**
 * Created by Administrator on 2015/2/10.
 */
(function ($) {
    $.widget("ui.inputs", {
        delay: 500,
        _create: function () {
            this.wrapper = $('<div>').addClass('inputs')
                .hide().appendTo(this.element);

            this.input = $('<input>').attr('type', 'text')
                .appendTo(this.wrapper);

            this.w = $('<span>').addClass('w').appendTo(this.wrapper);

            this._initEvents();
        },
        _init: function () {
            this.wrapper.show();
        },
        _initEvents: function () {
            this._on({
                click: function (e) {
                    var el = $(e.target);
                    if (el.hasClass('x')) {
                        el.parent().remove();
                    }
                    this.input.focus();
                }
            });

            this._on(this.input, {
                keyup: function (e) {
                    switch (e.keyCode) {
                        case $.ui.keyCode.ENTER:
                            if (this.menu) {
                                if (!this.menu.current) return;
                                var a = this.menu.current.children('a');
                                this.addItem(a.data('#') || a.html());
                            } else {
                                this.addItem();
                            }
                            this.input.val('');
                            this._updateInputWidth();
                            break;
                        case $.ui.keyCode.UP:
                            e.preventDefault();
                            if (this.menu && this.menu.element.is(':visible'))
                                this.menu.prev();
                            break;
                        case $.ui.keyCode.DOWN:
                            e.preventDefault();
                            if (this.menu && this.menu.element.is(':visible'))
                                this.menu.next();
                            break;
                        default:
                            this._updateInputWidth();
                            this._delaySearch();
                            break;
                    }
                }
            });
        },
        addItem: function (item) {
            var txt = item || this.input.val();
            if (typeof txt == 'object' && txt.text)
                txt = txt.text;
            txt = $.trim(txt);
            if (txt == '') return;
            var span = $('<span>').addClass('item')
                .data('#', item || txt)
                .html(txt).insertBefore(this.input);
            $('<a>').addClass('x').attr('href', 'javascript:;')
                .html('x').appendTo(span);
            if (this.menu) this.menu.close();
        },
        _updateInputWidth: function () {
            this.w.html(this.input.val().replace(/ /gm, '&nbsp;'));
            this.input.width(this.w.width() + 10);
        },
        // data is an array of strings, or
        // an array of objects each has a text attribute, or
        // a function that returns previous data.
        autocomplete: function (data) {
            this.source = data;
            if (this.menu) return;

            var menu = $('<ul>').appendTo(this.element);
            var that = this;
            menu.on('menufocus', function (e, elem) {
                that.input.val($(elem).html());
                that._updateInputWidth();
            });
            menu.on('menuselect', function (e, elem) {
                that.addItem($(elem).data('#') || $(elem).html());
                that.input.val('');
            });
            this.menu = menu.menu().menu('instance');
            this.menu.bindTo(this.input);
        },
        _delaySearch: function () {
            clearTimeout(this.searching);
            var s = $.trim(this.input.val());
            if (s == '') {
                this.menu.close();
                this.menu.current = null;
                return;
            }
            this.searching = this._delay(function () {
                var called = false;
                var source = this._getData(s, function (source) {
                    if (called) return;
                    called = true;
                    this._renderMenuItems(source);
                });
                if (source && !called) this._renderMenuItems(source);
            }, this.delay);
        },
        _getData: function (filter, callback) {
            if ($.isArray(this.source)) {
                var reg = new RegExp(filter);
                var txt;
                var source = $.map(this.source, function (item) {
                    if (typeof item == 'string')
                        txt = item;
                    else if (typeof item == 'object' && item.text)
                        txt = item.text;
                    else return;
                    if (reg.test(txt)) return item;
                });
                return source;
            } else if (typeof this.source == 'function') {
                var that = this;
                this.source(filter, function (source) {
                    callback.call(that, source);
                });
            }
        },
        _renderMenuItems: function (source) {
            var menu = this.menu;
            menu.current = null;
            if (source.length == 0) {
                menu.close();
                return;
            }
            this.menu.element.empty();
            var li, txt;
            $.each(source, function (i, item) {
                txt = item;
                if (typeof txt == 'object' && txt.text)
                    txt = txt.text;
                li = $('<li>').appendTo(menu.element);
                $('<a>').html(txt).appendTo(li).data('#', item);
            });
            this.menu.open();
        },
        getValues: function () {
            return this.wrapper.children('.item').map(function () {
                var el = $(this);
                return el.data('#') || this.childNodes[0].nodeValue;
            });
        }
    });
})
(jQuery);