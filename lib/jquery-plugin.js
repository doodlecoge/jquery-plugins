/**
 * Created by huaichao on 2015/1/12.
 */
(function ($) {
    $.cleanData = (function (orig) {
        return function (elems) {
            var events, elem, i;
            for (i = 0; (elem = elems[i]) != null; i++) {
                try {
                    // Only trigger remove when necessary to save time
                    events = $._data(elem, "events");
                    if (events && events.remove) {
                        $(elem).triggerHandler("remove");
                    }
                    // http://bugs.jquery.com/ticket/8235
                } catch (e) {
                    console.log(e);
                }
            }
            orig(elems);
        };
    })($.cleanData);

    function base() {
        this.classMethods = {};


        this.addClassMethod = function (key, fn) {
            if (this.classMethods[key])
                $.error('class method "' + key + '" already exists');
            this.classMethods[key] = fn;
        };

        this.addInstanceMethod = function (key, fn) {
            if (this.instanceMethods[key])
                $.error('instance method with same name already exists');
            this.instanceMethods[key] = fn;
        };

        this._on = function (element, event, handler) {
            var that = this;
            event = event + this.eventNamespace;
            $(element).bind(event, function () {
                handler.apply(that, arguments);
            });
        };

        this._off = function (element, event) {
            element.unbind(event || this.eventNamespace);
        };

        this._delay = function (handler, delay) {
            function handlerProxy() {
                return ( typeof handler === "string" ? instance[handler] : handler )
                    .apply(that, arguments);
            }

            var that = this;
            return setTimeout(handlerProxy, delay || 0);
        };

        this.destroy = function () {
            this._destroy();
        };

        this._createWidget = function (options, element) {
            this.options = options || {};
            this.element = $(element);
            this.instanceMethods = {};
            this._on(this.element, "remove", function (e) {
                if (e.target == element)
                    this.destroy();
            });
            this._create();
            this._init();
        };

        this._destroy = $.noop;
        this._create = $.noop;
        this._init = $.noop;
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
        var uuid = 0;
        var constructor = function (options, element) {
            if (!this._createWidget) {
                return new constructor(options, element);
            }

            this.uuid = ++uuid;
            this.eventNamespace = "." + name;

            if (arguments.length) {
                this._createWidget(options, element);
            }
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
                    var fn = ins.instanceMethods[options] ||
                        ins.classMethods[options] ||
                        ins[options];
                    if (!fn) $.error('no such method: ' + options);
                    else r = ins[options].apply(ins, args);
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