/**
 * Created by Administrator on 2015/2/10.
 */
(function ($) {
    $.widget("ui.inputs", {
        _create: function () {
            this.wrapper = $('<div>').addClass('inputs')
                .hide().appendTo(this.element);

            this.input = $('<input>').attr('type', 'text')
                .appendTo(this.wrapper);

            this.W = $('<span>').addClass('W').appendTo(this.wrapper);

            this._initEvents();
        },
        _init: function () {
            this.wrapper.show();
        },
        _initEvents: function () {
            this._on({
                click: function () {
                    this.input.focus();
                }
            });

            this._on(this.input, {
                input: function (e) {
                    this.updateInputWidth();
                },
                'keypress': function (e) {
                    switch (e.keyCode) {
                        case $.ui.keyCode.ENTER:
                            this.addItem();
                            break;
                    }
                }
            });
        },
        addItem: function (str) {
            str = str || this.input.val();
            console.log(str);
            str = $.trim(str);
            if (str == '') return;
            $('<span>').addClass('item')
                .html(str).insertBefore(this.input);
        },
        updateInputWidth: function (e) {
            this.W.html(this.input.val().replace(/ /gm, '&nbsp;'));
            this.input.width(this.W.width());
        }
    });
})(jQuery);