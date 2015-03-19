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
                "mouseleave a": function (e) {
                    e.stopPropagation();
                    clearTimeout(this.timer);
                },
                "click a": function (e) {
                    e.stopPropagation();
                    this._trigger("select", e, $(e.target));
                    this.close();
                },
                "keyup": function (e) {
                    this.keypress(e);
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
        focus: function (elem, delay) {
            this.current = elem.parent();

            delay = typeof delay == 'boolean' ? delay : true;

            // close sub menus at any depth
            elem.parent().parent()
                .find('.' + this.cls.menu).hide();

            elem.parent().siblings().children('a')
                .removeClass(this.cls.focus)
                .removeClass(this.cls.active);

            // focus current item
            elem.addClass(this.cls.focus);

            // open direct sub menu if any
            if (delay)
                this.timer = this._delay(function () {
                    this.openMenu(elem.parent());
                }, this.delay);
            else {
                this.openMenu(elem.parent());
            }

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
            this.element.show().focus()
                .children().children('a')
                .removeClass(this.cls.focus)
                .removeClass(this.cls.active);

            this.element.find('.' + this.cls.menu).hide();

            if (this.position)
                this.element.position(this.position);
        },
        close: function (elem) {
            this.current = null;
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
        },
        keypress: function (e) {
            switch (e.keyCode) {
                case $.ui.keyCode.DOWN:
                    this.next();
                    break;
                case $.ui.keyCode.UP:
                    this.prev();
                    break;
                case $.ui.keyCode.RIGHT:
                    console.log('================')
                    this.nextMenu();
                    break;
                case $.ui.keyCode.LEFT:
                    this.prevMenu();
                    break
                case $.ui.keyCode.ENTER:
                    this._trigger("select", e, this.current.children('a'));
                    this.close();
                    break;
            }
        },
        next: function () {
            var li = this.current || this.element.children(':last');
            if (li.length == 0) return;
            if (li.nextAll().length == 0) li = li.parent().children(':first');
            else li = li.next();
            this.focus(li.children('a'), false);
        },
        prev: function () {
            var li = this.current || this.element.children(':first');
            if (li.length == 0)return;
            if (li.index() == 0) li = li.parent().children(':last');
            else li = li.prev();
            this.focus(li.children('a'), false);
        },
        nextMenu: function () {
            if (!this.current) return;
            var menu = this.current.children('ul');
            if (menu.length == 0) return;

            if (menu.is(':hidden'))
                this.openMenu(this.current);
            else
                this.focus(menu.children(':first').children('a'), false);
        },
        prevMenu: function () {
            if (!this.current) return;
            var li = this.current.parent().parent();
            this.focus(li.children('a'), false);
        }
    });
})(jQuery);