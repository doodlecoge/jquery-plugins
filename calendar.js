/**
 *
 * Created by hch on 2014/11/15.
 */

;
(function ($) {
    function plugin(name, prototype) {
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
            var ret = undefined;
            this.each(function (i) {

                var r = undefined;
                var ins = $.data(this, name);
                if (isMethodCall) {
                    if (!ins) $.error('not initialized yet');

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
                        if (ins._init) r = ins._init();
                    } else {
                        ins = new constructor(options, this);
                        r = ins;
                        $.data(this, name, ins);
                    }
                }
                if (i == 0) ret = r;
            });
            return ret;
        }
    }

    plugin('dialog', {});

    /*=======================================================================*/
    /* calendar                                                              */
    /*=======================================================================*/
    plugin('calendar', {
        dayMs: 86400000,
        l10n: {
            weekNames: '日,一,二,三,四,五,六'.split(',')
        },
        _create: function () {
            this._createWrapper();
            this.dailyView();
        },
        _createWrapper: function () {
            this.wrapper = $('<div>').addClass('cal').appendTo(this.element);
            this.legend = $('<div>').addClass('legend').appendTo(this.wrapper);
            this._createLegendButtons();
            this.content = $('<div>').addClass('content').appendTo(this.wrapper);
        },
        _createLegendButtons: function () {
            var year = $('<button>').appendTo(this.legend).html('年');
            this._on(year, {
                click: function (e) {
                    this.content.html('');
                    this._yearlyView().appendTo(this.content);
                    this.viewType = 'yearly';
                }
            });
            var month = $('<button>').appendTo(this.legend).html('月');
            this._on(month, {
                click: function (e) {
                    this.content.html('');
                    this._monthlyView().appendTo(this.content);
                    this.viewType = 'monthly';
                }
            });
            var week = $('<button>').appendTo(this.legend).html('周');
            var day = $('<button>').appendTo(this.legend).html('日');
            this._on(day, {
                click: this.dailyView
            });
        },
        dailyView: function (datetime) {
            this.viewType = 'daily';
            this.content.html('');
            this._dailyView(datetime).appendTo(this.content);
            this._showDailyAppointments();
        },
        _dailyView: function (datetime) {
            var div = $('<div>').addClass('dcal');
            var l = $('<div>').addClass('leftcol').appendTo(div);
            var r = $('<div>').addClass('rightcol').appendTo(div);

            for (var i = 0; i < 24; i++) {
                $('<div>').addClass('hour').html(this._pad0(i) + ':00').appendTo(l);
                for (var j = 0; j < 4; j++) {
                    var d = $('<div>').addClass('quarter').appendTo(r);
                    if (j == 3) d.addClass('last');
                }
            }
            return div;
        },
        _showDailyAppointments: function (datetime) {
            datetime = datetime || new Date();

            var arr = [];
            $.each(this._appointments(), function (i, apmt) {
                var s = new Date(apmt.start);
                var e = new Date(apmt.end);
                var days = Math.floor((datetime - 0) / this.dayMs);

                console.log(days);

                if (days !== Math.floor((s - 0) / this.dayMs) ||
                    days !== Math.floor((e - 0) / this.dayMs)) return;
                arr.push(apmt);
            });

            arr.sort(function (x, y) {
                return x.start > y.start;
            });

            console.log(arr);

        },
        monthlyView: function (datetime) {

        },
        _monthlyView: function (datetime) {
            var now = datetime || new Date();
            var date = new Date(now);

            // first day this month
            date.setDate(1);

            // date of first cell
            date = new Date(date - date.getDay() * this.dayMs);
            var tbl = $('<table>').addClass('mcal'), tr, td;
            tr = $('<tr>').appendTo(tbl);
            td = $('<td>').attr('colspan', 7).addClass('title').appendTo(tr);

            var t = now.getFullYear() + '/' + this._pad0(now.getMonth() + 1);
            $('<span>').addClass('btn').addClass('prev').html('<').appendTo(td);
            $('<span>').addClass('txt').html(t).appendTo(td);
            $('<span>').addClass('btn').addClass('next').html('>').appendTo(td);

            tr = $('<tr>').appendTo(tbl);
            for (var i = 0; i < 7; i++) $('<th>').html(this.l10n.weekNames[i]).appendTo(tr);


            for (var i = 0; i < 35; i++) {
                if (i % 7 == 0) tr = $('<tr>').appendTo(tbl);
                var d = new Date(date - 0 + i * this.dayMs);
                td = $('<td>').html(this._pad0(d.getDate())).appendTo(tr);
                if (now.getMonth() != d.getMonth()) td.addClass('not-this-month');
            }

            return tbl;
        },
        _showMonthlyAppointments: function (datetime) {

        },
        _yearlyView: function (year) {
            year = year || new Date().getFullYear();
            var now = new Date();
            now.setFullYear(year);
            now.setMonth(-1);
            var tbl = $('<table>').addClass('ycal'), tr, td;
            tr = $('<tr>').appendTo(tbl);
            $('<td>').addClass('title').attr('colspan', 4).html(year).appendTo(tr);
            for (var i = 0; i < 12; i++) {
                if (i % 4 == 0) tr = $('<tr>').appendTo(tbl);
                td = $('<td>').appendTo(tr);
                now.setMonth(now.getMonth() + 1);
                this._yearMonth(new Date(now)).appendTo(td);
            }
            return tbl;
        },
        _yearMonth: function (datetime) {
            var current = new Date();
            var date = datetime || current;
            var title = this._pad0(date.getMonth() + 1);
            var dd = new Date(date);

            dd.setDate(1);
            dd.setDate(0 - dd.getDay());

            var tbl = $('<table>').addClass('ycal'), tr, td;

            tr = $('<tr>').appendTo(tbl);
            $('<td>').attr('colspan', 7).addClass('title').html(title).appendTo(tr);
            for (var i = 0; i < 7 * 5; i++) {
                if (i % 7 == 0) tr = $('<tr>').appendTo(tbl);
                dd.setDate(dd.getDate() + 1);
                td = $('<td>').html(this._pad0(dd.getDate())).appendTo(tr);
                if (dd.getMonth() != date.getMonth())
                    td.addClass('none');
                if (Math.floor(1 * dd / this.dayMs) ===
                    Math.floor(1 * current / this.dayMs))
                    td.addClass('cur');
            }
            return tbl;
        },
        _pad0: function (num, width) {
            width = width || 2;
            num = num.toString();
            var len = Math.max(0, width - num.length);
            for (var i = 0; i < len; i++) {
                num = '0' + num;
            }
            return num;
        },
        _appointments: function () {
            return this.options.appointments || [];
        }
    });

})(jQuery);
