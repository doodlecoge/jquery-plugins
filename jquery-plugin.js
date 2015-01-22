/**
 * Created by huaichao on 2015/1/12.
 */
;
(function ($) {
    function base() {
        this.classMethods = {};

        this.addClassMethod = null;
        this.addInstanceMethod = null;
        this._on = null;

        this.addClassMethod = function (key, fn) {
            if (this.classMethods[key])
                $.error('global interface "' + key + '" already exists');
            this.classMethods[key] = fn;
        }
        this.addInstanceMethod = function (key, fn) {
            if (this.instanceMethods[key])
                $.error('local extension with same name already exists');
            this.instanceMethods[key] = fn;
        }
        this._on = function (element, event, handler) {
            var that = this;
            element.bind(event, function () {
                handler.apply(that, arguments);
            });
        }
    }

    base.prototype = {
        keyCode: {
            BACKSPACE: 8,
            COMMA: 188,
            DELETE: 46,
            DOWN: 40,
            END: 35,
            ENTER: 13,
            ESCAPE: 27,
            HOME: 36,
            LEFT: 37,
            PAGE_DOWN: 34,
            PAGE_UP: 33,
            PERIOD: 190,
            RIGHT: 39,
            SPACE: 32,
            TAB: 9,
            UP: 38
        }
    };

    $.fn.plugin = function (name, prototype) {
        var constructor = function (options, element) {
            this.options = options || {};
            this.element = $(element);
            this.instanceMethods = {};
            if (this._create) this._create();
            if (this._init) this._init();
        };

        constructor.prototype = $.extend(new base(), prototype);

        $.fn[name] = $.fn[name] || function (options) {
            var isMethodCall = typeof options === 'string';
            var args = Array.prototype.slice.call(arguments, 1);
            var ret = this;
            this.each(function (i) {
                var r = undefined;
                var ins = $.data(this, name);
                if (isMethodCall) {
                    if (!ins) $.error('not initialized yet');
                    if (options === 'instance') {
                        ret = ins;
                        return false;
                    }
                    var called = false;
                    $.each(ins.instanceMethods, function (name, ext) {
                        if (!$.isFunction(ext[options])) return;
                        r = ext[options].apply(ins, args);
                        called = true;
                        return false;
                    });

                    if (called == false) {
                        $.each(ins.classMethods, function (name, ext) {
                            if (!$.isFunction(ext[options])) return;
                            r = ext[options].apply(ins, args);
                            called = true;
                            return false;
                        });
                    }

                    if (called == false) {
                        if (!$.isFunction(ins[options]) || options.charAt(0) === '_')
                            $.error('no such method: ' + options);
                        r = ins[options].apply(ins, args);
                    }
                } else {
                    if (ins) {
                        if (ins._init) ins._init();
                    } else {
                        ins = new constructor(options, this);
                        $.data(this, name, ins);
                    }
                }
                if (i == 0) ret = r;
            });
            return ret;
        }
    }
})(jQuery);