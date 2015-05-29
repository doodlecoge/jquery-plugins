/**
 * Created by Administrator on 2015/2/10.
 */
(function ($) {
    $.widget("ui.datetimePicker", {
        _create: function () {
            var dtp = $(document.body).find('.datetime-picker');
            if (dtp.length > 0) return;

            var wrapper = $('<div>').addClass('datetime-picker')
                .appendTo(document.body);
            $('<div>').addClass('title').appendTo(wrapper);

            var lines = $('<div>').addClass('lines').appendTo(wrapper);
            for (var i = 0; i < 6; i++) {
                $('<div>').addClass('line').appendTo(lines);
            }


            var spinners = $('<div>').addClass('spinners').appendTo(wrapper);

            for (var i = 0; i < 3; i++) {
                var spinner = $('<div>').addClass('spinner').appendTo(spinners);
                for (var j = 0; j < 9; j++) {
                    $('<div>').addClass('card').html(i + "," + j).appendTo(spinner);
                }
            }

            var btns = $('<div>').addClass('btns').appendTo(wrapper);

            this.wrapper = wrapper;
        },
        _init: function () {
            this.moving = false;
            this._on(this.wrapper.find('.spinner'), {
                mousedown: function(e){
                    this.moving = true;
                    this.y = e.pageY;
                    return false;
                },
                mousemove: function(e) {
                    if(!this.moving) return;
                    var dy = e.pageY - this.y;
                    $(e.currentTarget).children(':eq(0)').css('margin-top', dy + 'px');
                },
                mouseup: function() {
                    this.moving = false;
                },
                mouseout: function() {
                    this.moving = false;
                }
            });
        }
    });
})
(jQuery);