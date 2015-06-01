/**
 * Created by Administrator on 2015/2/10.
 */
(function ($) {
    $.widget("ui.spinner", {
        y: null,
        top: null,
        ch: null,
        ts: null,
        val: 2015,
        moving: false,
        _create: function () {
            var spinner = this.spinner = $('<div>').addClass('spinner')
                .appendTo(this.element);

            var touchpad = this.touchpad = $('<div>').addClass('touchpad')
                .appendTo(spinner);

            var cards = this.cards = $('<table>').addClass('cards')
                .appendTo(spinner);
            for (var i = 0; i < 9; i++) {
                var tr = $('<tr>').appendTo(cards);
                $('<td>').addClass('card').appendTo(tr);
            }
            this._updateVal();

            var lines = $('<div>').addClass('lines')
                .appendTo(spinner);
            for (var i = 0; i < 6; i++) {
                $('<div>').addClass('line').appendTo(lines);
            }
        },
        _init: function () {
            var that = this;
            var mc = new Hammer.Manager(this.touchpad.get(0));
            mc.add(
                new Hammer.Pan({
                    direction: Hammer.DIRECTION_VERTICAL,
                    threshold: 0
                })
            );
            mc.on("panstart", function (e) {
                that.top = -that.spinner.height();
                that.ch = that.spinner.height() / 3;
            });
            mc.on("panmove", function (e) {
                that.cards.css('top', (that.top + e.deltaY) + 'px');
            });

            mc.on("panend", function (e) {
                that._stopping(e.deltaY, e.velocity);
            });
        },
        _updateVal: function () {
            var that = this;
            this.cards.css('top', '-33.3333%');
            this.cards.find('.card').each(function (i, card) {
                $(card).html(that.val + i - 4);
            });
        },
        _stopping: function (deltaY, velocity) {
            var dir = deltaY > 0 ? 1 : -1,
                deltaY = Math.abs(deltaY),
                velocity = Math.abs(velocity);

            var n = Math.floor((deltaY + this.ch / 2 - 1) / this.ch);
            n += Math.round(Math.exp(velocity));
            this._rotateTo(this.val + n * dir);
        },
        _rotateTo: function (targetVal) {
            if (targetVal == this.val) return;

            this.val += targetVal > this.val ? 1 : -1;
            this._updateVal();
            var that = this;
            setTimeout(function () {
                that._rotateTo(targetVal);
            }, 200);

            //var easing = n == 0 ? 'swing' : 'linear';
            //
            //var that = this;
            //this.cards.animate({
            //    top: (this.top + x * this.ch * dir) + 'px'
            //}, speed, easing, function () {
            //    that.val += x * dir * -1;
            //    that.cards.css('top', '-100%');
            //    that._updateVal();
            //    if (n > 0) that._rotateTo(n, dir, speed);
            //});
        }
    });
    //$.widget("ui.datetimePicker", {
    //    _create: function () {
    //        var dtp = $(document.body).find('.datetime-picker');
    //        if (dtp.length > 0) return;
    //
    //        var wrapper = $('<div>').addClass('datetime-picker')
    //            .appendTo(document.body);
    //        $('<div>').addClass('title').appendTo(wrapper);
    //
    //        var lines = $('<div>').addClass('lines').appendTo(wrapper);
    //        for (var i = 0; i < 6; i++) {
    //            $('<div>').addClass('line').appendTo(lines);
    //        }
    //
    //
    //        var spinners = $('<div>').addClass('spinners').appendTo(wrapper);
    //
    //        for (var i = 0; i < 3; i++) {
    //            var spinner = $('<div>').addClass('spinner').appendTo(spinners);
    //            for (var j = 0; j < 9; j++) {
    //                $('<div>').addClass('card').html(i + "," + j).appendTo(spinner);
    //            }
    //        }
    //
    //        var btns = $('<div>').addClass('btns').appendTo(wrapper);
    //
    //        this.wrapper = wrapper;
    //    },
    //    _init: function () {
    //        this.moving = false;
    //        this._on(this.wrapper.find('.spinner'), {
    //            mousedown: function(e){
    //                this.moving = true;
    //                this.y = e.pageY;
    //                return false;
    //            },
    //            mousemove: function(e) {
    //                if(!this.moving) return;
    //                var dy = e.pageY - this.y;
    //                $(e.currentTarget).children(':eq(0)').css('margin-top', dy + 'px');
    //            },
    //            mouseup: function() {
    //                this.moving = false;
    //            },
    //            mouseout: function() {
    //                this.moving = false;
    //            }
    //        });
    //    }
    //});
})
(jQuery);