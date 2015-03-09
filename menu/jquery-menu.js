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
            var menu = elem.children('.' + this.cls.menu);
            menu.show()
                .position({
                    of: elem,
                    my: "left-1 top",
                    at: "right top"
                })
                .find('a')
                .removeClass(this.cls.focus)
                .removeClass(this.cls.active);
        },
        close: function (elem) {
            elem = elem || this.element;
            elem.closest('.' + this.cls.menu).hide();
        },
        _init: function () {
        },
        positionTo: function (position, of) {
            if (!of) {
                of = position;
                position = {
                    of: of,
                    my: "left top",
                    at: "left bottom"
                }
            }
            this.of = of;
            this.element.show()
                .position(position);
        }
    });
})(jQuery);