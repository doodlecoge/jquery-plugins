/**
 * Created by huaichao on 2015/1/9.
 */
var _console = {
    log: function () {
        var log = $('<li>').appendTo('.console');
        $.each(arguments, function (i, arg) {
            $('<div>').html(JSON.stringify(arg)).appendTo(log);
        });
        var c = $('.console').get(0);
        c.scrollTop = c.scrollHeight;
    }
};


!function (window) {
    if (!window) return;
    var reg = /msie|applewebkit.+safari/;
    var ua = window.navigator.userAgent.toLowerCase();
    if (!reg.test(ua)) return;
    var _sort = Array.prototype.sort;
    Array.prototype.sort = function (fn) {
        if (!fn || typeof fn !== 'function') return _sort.call(this);

        if (this.length < 2) return this;
        var i = 0, j = i + 1, l = this.length, tmp, r = false, t = 0;
        for (; i < l; i++) {
            for (j = i + 1; j < l; j++) {
                t = fn.call(this, this[i], this[j]);
                r = (typeof t === 'number' ? t :
                    !!t ? 1 : 0) > 0
                    ? true : false;
                if (r) {
                    tmp = this[i];
                    this[i] = this[j];
                    this[j] = tmp;
                }
            }
        }
        return this;
    };

}(window);