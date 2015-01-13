/**
 *
 * Created by hch on 2014/11/15.
 */
(function ($) {
    /*=======================================================================*/
    /* calendar                                                              */
    /*=======================================================================*/
    $.fn.plugin('calendar', {
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
                click: function (e) {
                    this.dailyView();
                }
            });
        },
        onAddSchedule: function (fn) {
            this.event = this.event || {};
            this.event.onAddSchedule = fn;
        },
        onViewSchedule: function (fn) {
            this.event = this.event || {};
            this.event.onViewSchedule = fn;
        },
        dailyView: function (datetime) {
            var that = this;
            var t = setTimeout(function () {
                that.content.html('努力加载“' + that._dateString(datetime) + '”的数据中...');
            }, 100);
            datetime = datetime || new Date();
            var called = false;
            var schedules = this._getSchedulesByDate(datetime, function (err, schedules) {
                if (called) return;
                called = true;
                foo(err, schedules);
            });
            if (!called && schedules) {
                foo(null, schedules);
            }
            function foo(err, schedules) {
                clearTimeout(t);
                that.date = datetime;
                that.viewType = 'daily';
                that.content.html('');
                that._dailyView(datetime).appendTo(that.content);
                that._scrollDailyView();
                that._bindDailyEvent();
                that._showDailyAppointments(datetime, schedules);
            }
        },
        _dailyView: function (datetime) {
            datetime = datetime || new Date();
            var div = $('<div>').addClass('dcal');
            var title = $('<div>').addClass('title').appendTo(div);
            $('<span>').appendTo(title).addClass('btn prev').html('&lt;');
            $('<span>').appendTo(title).addClass('txt').html(this._dateString(datetime));
            $('<span>').appendTo(title).addClass('btn next').html('&gt;');
            var t = $('<div>').addClass('top').appendTo(div);
            $('<div>').addClass('span').appendTo(t);
            var scroll = $('<div>').addClass('time-scroll').appendTo(div);
            var l = $('<div>').addClass('leftcol').appendTo(scroll);
            $('<div>').addClass('time-line').appendTo(l);
            var r = $('<div>').addClass('rightcol').appendTo(scroll);
            for (var i = 0; i < 24; i++) {
                $('<div>').addClass('hour').html(this._pad0(i) + ':00').appendTo(l);
                for (var j = 0; j < 4; j++) {
                    var d = $('<div>').addClass('quarter').appendTo(r);
                    if (j == 3) d.addClass('last');
                }
            }
            return div;
        },
        _scrollDailyView: function () {
            var now = new Date();
            var hours = now.getHours();
            var mins = hours * 60 + now.getMinutes();
            var el = this.element.find('.dcal .time-scroll');
            el.scrollTop(el.get(0).scrollHeight * hours / 24 - 10);
            this.element.find('.dcal .time-line').css('top', (mins * 100 / 24 / 60) + '%');
        },
        _bindDailyEvent: function () {
            this._on(this.element.find('.btn.prev'), {
                click: function (e) {
                    var d = new Date(this.date);
                    d.setDate(d.getDate() - 1);
                    this.dailyView(d);
                }
            });
            this._on(this.element.find('.btn.next'), {
                click: function (e) {
                    var d = new Date(this.date);
                    d.setDate(d.getDate() + 1);
                    this.dailyView(d);
                }
            });
            this._on(this.element.find('.dcal'), {
                click: function (e) {
                    var el = $(e.target);
                    if (el.hasClass('quarter')) {
                        this.event && this.event.onAddSchedule &&
                        this.event.onAddSchedule(el.index());
                    } else if (el.hasClass('schedule') || el.hasClass('span-schedule')) {
                        this.event && this.event.onViewSchedule &&
                        this.event.onViewSchedule(el.index());
                    }
                }
            });
            this._on(this.element.find('.dcal .time-scroll'), {
                scroll: function (e) {
                    var scroll = $(e.target);
                    var st = scroll.get(0).scrollTop;
                    if (st > 0) {
                        this.element.find('.dcal .top').addClass('bshadow');
                    } else {
                        this.element.find('.dcal .top').removeClass('bshadow');
                    }
                }
            });
        },
        _showDailyAppointments: function (datetime, schedules) {
            datetime = datetime || new Date();
            var that = this;
            var dailyApmts = [];
            var spanApmts = [];
            $.each(schedules, function (i, apmt) {
                var s = new Date(apmt.start);
                var e = new Date(apmt.end);
                var days = Math.floor((datetime - 0) / that.dayMs);
                var day0 = Math.floor((s - 0) / that.dayMs);
                var day1 = Math.floor((e - 0) / that.dayMs);
                if (days < day0 || days > day1) return;
                if (days != day0 || days != day1) spanApmts.push(apmt);
                else dailyApmts.push(apmt);
            });
            $.each(spanApmts, function (i, apmt) {
                var s = new Date(apmt.start);
                var e = new Date(apmt.end);
                var d = new Date(datetime);
                d.setHours(0);
                d.setMinutes(0);
                d.setSeconds(0);
                var ml = 0, mr = 0;
                if (s > d) {
                    var mins = (s - d) / 60000;
                    ml = 100 * mins / 24 / 60;
                }
                d.setDate(d.getDate() + 1);
                if (e < d) {
                    var mins = (d - e) / 60000;
                    mr = 100 * mins / 24 / 60;
                }
                $('<div>').html(apmt.subject)
                    .addClass('span-schedule')
                    .css('margin-left', ml + '%')
                    .css('margin-right', mr + '%')
                    .css('margin-top', '-1px')
                    .appendTo(that.content.find('.span'));
            });
            dailyApmts.sort(function (x, y) {
                return x.start > y.start;
            });
            var pos = [0];
            $.each(dailyApmts, function (i, apmt) {
                if (i == 0) return;
                var p = 0;
                for (var j = 0; j < i; j++) {
                    var t = dailyApmts[i - j - 1];
                    if (t.end <= apmt.start) continue;
                    p = pos[i - j - 1] + 1;
                    break;
                }
                pos.push(p);
            });
            $.each(dailyApmts, function (i, apmt) {
                var s = new Date(apmt.start);
                var e = new Date(apmt.end);
                var total = 24 * 60;
                var cols = getWidth(pos, i);
                var smins = s.getHours() * 60 + s.getMinutes();
                var emins = e.getHours() * 60 + e.getMinutes();
                var top = 100 * smins / total;
                var left = 90 / cols * pos[i];
                var height = 100 * (emins - smins) / total;
                var width = 90 / cols;
                $('<div>').addClass('schedule')
                    .css('top', top + '%')
                    .css('left', left + '%')
                    .css('height', height + '%')
                    .css('width', width + '%')
                    //.css('margin-left', (-pos[i]) + 'px')
                    .html(apmt.subject)
                    .appendTo(that.content.find('.rightcol'));
            });
            function getWidth(pos, i) {
                for (; i < pos.length - 1; i++) {
                    if (pos[i + 1] == 0)break;
                }
                return pos[i] + 1;
            }
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
        _dateString: function (date) {
            return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日';
        },
        _appointments: function () {
            return this.options.appointments || [];
        },
        setDataSource: function (ds) {
            this.dataSource = ds;
        },
        _getSchedulesByDate: function (date, callback) {
            var ds = this.dataSource || this.options.dataSource;
            if (ds.getSchedulesByDate) {
                return ds.getSchedulesByDate(date, callback);
            }
        }
    });


})(jQuery);
