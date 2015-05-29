/**
 * Created by huaichao on 2015/5/20.
 */


(function ($) {
    $.widget("ui.xhrForm", {
        _create: function () {
            this._on({
                click: function (e) {
                },
                submit: function () {
                    this.options['beforeSubmit'] &&
                    typeof this.options['beforeSubmit'] === 'function' &&
                    this.options['beforeSubmit']();
                    this.submit();
                    return false;
                }
            });
        },
        submit: function () {
            var validate = this.options['validate'];
            if (typeof validate === 'function' && !validate()) {
                return false;
            }

            var data = {};
            this.element.find('input[name]').each(function (i, el) {
                el = $(el);
                data[el.attr('name')] = el.val();
            });

            var xhr = $.ajax({
                url: this.element.attr('action') || location.href,
                method: this.element.attr('method') || 'get',
                data: data,
                dataType: 'json'
            });

            var that = this;

            xhr.done(function (data) {
                that.options['success'] &&
                typeof that.options['success'] === 'function' &&
                that.options['success'](data);
            });

            xhr.fail(function (data) {
                that.options['fail'] &&
                typeof that.options['fail'] === 'function' &&
                that.options['fail'](data);
            });
        }
    });


})(jQuery);