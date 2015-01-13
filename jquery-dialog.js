/**
 * Created by Administrator on 2015/1/12.
 */

;(function($){
    /*=======================================================================*/
    /* dialog                                                                */
    /*=======================================================================*/
    $.fn.plugin('dialog', {
        _create: function () {
            this._create_overlay();
            this._create_wrapper();
            this._createButtons();
            this._initEventHandler();
        },
        _init: function() {
            this.show();
        },
        _createButtons: function () {
            if (!this.options.buttons) return;

            var buttonSet = $('<div>')
                .addClass('dlg_btn_set')
                .appendTo(this.wrapper);

            var that = this;

            $.each(this.options.buttons, function (name, fn) {
                var button = $('<button>')
                    .html(name)
                    .appendTo(buttonSet);

                that._on(button, {
                    click: function (e) {
                        fn(e, this);
                        this._close();
                    }
                });
            });
        },
        _create_wrapper: function () {
            this.wrapper = $('<div class="dlg">').hide()
                .appendTo(document.body);

            var title = $('<div class="dlg_title">')
                .appendTo(this.wrapper)
                .html(this.options.title || '');


            var close_btn = $('<a>')
                .addClass('dlg_close_btn')
                .attr('href', 'javascript:;')
                .appendTo(title);


            $('<i>')
                .addClass('fa')
                .addClass('fa-times')
                .appendTo(close_btn);


            var content = $('<div>')
                .addClass('dlg_content')
                .appendTo(this.wrapper);

            this.element.appendTo(content);
        },
        _create_overlay: function () {
            var overlay = $('.global_overlay');
            if (overlay.length == 0) {
                overlay = $('<div>')
                    .addClass('global_overlay')
                    .addClass('t30')
                    .appendTo(document.body);
            }
            this.overlay = overlay.hide();
        },
        _initEventHandler: function () {
            var btn = this.wrapper.find('.dlg_close_btn');

            this._on(btn, {
                click: function () {
                    this._close();
                }
            });
        },
        show: function () {
            this.overlay.show();
            this.wrapper.show();
            var w = this.wrapper.width();
            var h = this.wrapper.height();
            this.wrapper.css('left', '50%');
            this.wrapper.css('top', '50%');
            this.wrapper.css('margin-left', (-w / 2) + 'px');
            this.wrapper.css('margin-top', (-h / 2) + 'px');
        },
        _close: function () {
            this.overlay.hide();
            this.wrapper.hide();
        }
    });
})(jQuery);