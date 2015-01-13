/**
 * Created by huaichao on 2015/1/12.
 */
;
(function ($) {
    $.fn.plugin = function (name, prototype) {
        var constructor = function (options, element) {
            this.options = options || {};
            this.element = $(element);
            this.localExtensions = {};
            if (this._create) this._create();
            if (this._init) this._init();
        };
        constructor.prototype = $.extend({
            _on: function (element, handlers) {
                var _this = this;
                $.each(handlers, function (event, handler) {
                    element.bind(event, function () {
                        handler.apply(_this, arguments);
                    });
                });
            },
            globalExtensions: {},
            extendGlobal: function (name, extObj) {
                if (this.globalExtensions[name])
                    $.error('global extension with same name already exists');
                this.globalExtensions[name] = extObj;
            },
            extendLocal: function (name, extObj) {
                if (this.localExtensions[name])
                    $.error('local extension with same name already exists');
                this.localExtensions[name] = extObj;
            }
        }, prototype);


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

                    $.each(ins.localExtensions, function (name, ext) {
                        if (!$.isFunction(ext[options])) return;
                        r = ext[options].apply(ins, args);
                        called = true;
                        return false;
                    });

                    if (called == false) {
                        $.each(ins.globalExtensions, function (name, ext) {
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