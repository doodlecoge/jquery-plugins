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

            var cards = this.cards = $('<div>').addClass('cards')
                .appendTo(spinner);
            for (var i = 0; i < 9; i++) {
                $('<div>').addClass('card').appendTo(cards);
            }
            this._updateVal();

            var lines = $('<div>').addClass('lines')
                .appendTo(spinner);
            for (var i = 0; i < 6; i++) {
                $('<div>').addClass('line').appendTo(lines);
            }

            this.top = -this.spinner.height();
            this.ch = this.spinner.height() / 3;
        },
        _init: function () {
            this._on(this.touchpad, {
                'mousedown': function (e) {
                    this.moving = true;
                    this.y = e.pageY;
                    this.ts = new Date();
                    return false;
                },
                'mousemove': function (e) {
                    if (!this.moving)return;
                    var dy = e.pageY - this.y;
                    this.cards.css('top', (this.top + dy) + 'px');
                },
                'mouseup': this._stopping,
                'mouseout': this._stopping
            })
        },
        _updateVal: function () {
            var that = this;
            this.cards.find('.card').each(function (i, card) {
                $(card).html(that.val + i - 4);
            });
        },
        _stopping: function (e) {
            if (!this.moving) return;
            this.moving = false;

            var dy = e.pageY - this.y;
            var dt = new Date() - this.ts;
            var n = Math.floor((Math.abs(dy) + this.ch / 2 - 1) / this.ch);
            var lvl = Math.max(0, 4 - dt / 50);
            lvl = Math.round(lvl * Math.sqrt(lvl)) * n;
            n += lvl;
            var speed = 300 / Math.max(1, Math.sqrt(lvl))


            this._move(n, dy > 0 ? 1 : -1, speed);
        },
        _move: function (n, dir, speed) {
            var x = n > 3 ? 3 : n;
            n = n - x;
            speed = speed || 200;

            var easing = n == 0 ? 'swing' : 'linear';

            var that = this;
            this.cards.animate({
                top: (this.top + x * this.ch * dir) + 'px'
            }, speed, easing, function () {
                that.val += x * dir * -1;
                that.cards.css('top', that.top + 'px');
                that._updateVal();
                if (n > 0) that._move(n, dir, speed);
            });
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