/**
 * Created by Administrator on 2015/2/10.
 */
(function ($) {
    $.widget("ui.menu", {
        delay: 300,
        cls: {
            menu: "ui_menu",
            active: "item_active",
            focus: "item_focus"
        },
        _create: function () {
            this.element.addClass('ui_menu')
                .find('ul').addClass('ui_menu').hide();

            this._on({
                "mouseenter li": function (e) {
                    e.stopPropagation();
                    var elem = $(e.currentTarget);
                    this.focus(elem);
                },
                "mouseleave li": function (e) {
                    e.stopPropagation();
                    var elem = $(e.currentTarget);
                    this._blur(elem);
                },
                "click li": function (e) {

                }
            });

            this._on(this.document, {
                click: function (e) {
                    if ($(e.target).closest(this.element.find('.' + this.cls.menu)).length)
                        return;
                    this._close(this.element);
                }
            });
            this.refresh();
        },
        focus: function (elem) {
            elem.addClass(this.cls.focus)
                .removeClass(this.cls.active);
            elem.siblings().removeClass(this.cls.active);
            elem.parent().closest('li')
                .addClass(this.cls.active)
                .removeClass(this.cls.focus);
            clearTimeout(this.timer);
            this.timer = this._delay(function () {
                this._close(elem);
                this._open(elem);
            }, this.delay);
        },
        _blur: function (elem) {
            if (!elem) return;
            clearTimeout(this.timer);
            elem.removeClass(this.cls.focus);
            this._close(elem);
        },
        refresh: function () {
            this.element.find('ul')
                .hide()
                .addClass(this.cls.menu)
                .each(function () {
                    $('<span>&gt;</span>').prependTo($(this).parent());
                });
        },
        _close: function (menu) {
            if (!menu) return;
            if (menu !== this.element) menu = menu.parent();
            menu.find('.' + this.cls.menu)
                .hide().end()
                .find('.' + this.cls.active)
                .not('.' + this.cls.focus)
                .removeClass(this.cls.active);
        },
        _open: function (item) {
            item.children('.ui_menu')
                .show()
                .position({
                    of: item,
                    my: "left-1 top",
                    at: "right top"
                });
        },

        _init: function () {
            //this.element.show();
        }
    });
})(jQuery);