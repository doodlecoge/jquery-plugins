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
                            this.addItem();
                            this.input.val('');
                            break;
                        case $.ui.keyCode.UP:
                            e.preventDefault();
                            if (this.menu)
                                this.menu.prev();
                            break;
                        case $.ui.keyCode.DOWN:
                            e.preventDefault();
                            if (this.menu)
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
        addItem: function (str) {
            str = str || this.input.val();
            str = $.trim(str);
            if (str == '') return;
            var item = $('<span>').addClass('item')
                .html(str).insertBefore(this.input);
            $('<a>').addClass('x')
                .attr('href', 'javascript:;')
                .html('x').appendTo(item);
        },
        _updateInputWidth: function () {
            this.w.html(this.input.val().replace(/ /gm, '&nbsp;'));
            this.input.width(this.w.width() + 10);
        },
        // data is an array of strings, or
        // an array of objects each has a text attribute.
        autocomplete: function (data) {
            if (!$.isArray(data) || data.length == 0) {
                this.menu = null;
                return;
            }
            this.source = data;
            var menu = $('<ul>').appendTo(this.element);
            var that = this;
            menu.on('menufocus', function (e, elem) {
                that.input.val($(elem).html());
                that._updateInputWidth();
            });
            this.menu = menu.menu().menu('instance');
            this.menu.bindTo(this.input);
        },
        _delaySearch: function () {
            clearTimeout(this.searching);
            var s = $.trim(this.input.val());
            if (s == '') {
                this.menu.close();
                return;
            }
            this.searching = this._delay(function () {
                var reg = new RegExp(s);
                this.menu.element.empty();
                var menu = this.menu;
                var source = $.map(this.source, function (item) {
                    if (reg.test(item)) return item;
                });

                menu.current = null;

                if (source.length == 0) {
                    menu.close();
                    return;
                }

                $.each(source, function (i, item) {
                    $('<li><a>' + item + '</a></li>')
                        .appendTo(menu.element);
                });
                this.menu.open();
            }, this.delay);
        }
    });
})
(jQuery);