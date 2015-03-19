/**
 * Created by Administrator on 2015/2/10.
 */
(function ($) {
    $.widget("ui.menu", {
        zindex: 0,
        delay: 300,
        cls: {
            menu: "ui_menu",
            active: "item_active",
            focus: "item_focus"
        },
        _create: function () {
            this.element.addClass('ui_menu').hide()
                .find('ul').addClass('ui_menu').hide();

            this._on({
                "mouseenter a": function (e) {
                    e.stopPropagation();
                    var elem = $(e.currentTarget);
                    this.focus(elem);
                },
                "click a": function (e) {
                    e.stopPropagation();
                    this._trigger("select", e);
                    this.close();
                }
            });

            this._on(this.document, {
                click: function (e) {
                    if ($(e.target).closest(this.element.find('.' + this.cls.menu)).length)
                        return;
                    if (this.of && e.target == this.of.get(0)) return;
                    this.close();
                }
            });

            this.refresh();
        },
        refresh: function () {
            this.element.find('ul')
                .hide()
                .addClass(this.cls.menu)
                .each(function () {
                    $('<span>&gt;</span>').prependTo($(this).siblings('a'));
                });
        },
        focus: function (elem) {
            // close sub menus at any depth
            elem.parent().parent()
                .find('.' + this.cls.menu).hide();

            elem.parent().siblings().children('a')
                .removeClass(this.cls.focus)
                .removeClass(this.cls.active);

            // focus current item
            elem.addClass(this.cls.focus);

            // open direct sub menu if any
            this.openMenu(elem.parent());

            // set parent item style
            elem.parent().parent().siblings('a')
                .removeClass(this.cls.focus)
                .addClass(this.cls.active);
        },
        openMenu: function (elem) {
            var pzidx = elem.parent().css('z-index');
            if (typeof pzidx != 'number') pzidx = 0;
            var menu = elem.children('.' + this.cls.menu);
            menu.show()
                .css('z-index', pzidx + 1)
                .position({
                    of: elem,
                    my: "left-1 top",
                    at: "right top"
                })
                .children()
                .children('a')
                .removeClass(this.cls.focus)
                .removeClass(this.cls.active);
        },
        open: function () {
            this.element.show()
                .children().children('a')
                .removeClass(this.cls.focus)
                .removeClass(this.cls.active);

            this.element.find('.' + this.cls.menu).hide();

            if (this.position)
                this.element.position(this.position);
        },
        close: function (elem) {
            elem = elem || this.element;
            elem.closest('.' + this.cls.menu).hide();
        },
        _init: function () {
        },
        bindTo: function (elem, event, position) {
            // remove old binding
            if (this.position && this.position.of)
                this._off(this.position.of);

            this.position = position || {
                my: "left top",
                at: "left bottom",
                of: elem
            };
            var events = {};
            events[event] = function (e) {
                e.stopPropagation();
                this.open();
            };
            this._on(elem, events);
        }
    });
})(jQuery);