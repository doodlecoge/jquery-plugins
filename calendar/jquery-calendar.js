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
        },
        _init: function () {
            //this.viewType = this.viewType || 'daily';
            this.viewType = this.viewType || 'monthly';
            this.show();
        },
        show: function () {
            switch (this.viewType) {
                case 'daily':
                    this.dailyView();
                    break;
                case 'weekly':
                    this.weeklyView();
                    break;
                case 'monthly':
                    this.monthlyView();
                    break;
            }

            this._updateButtonState();
        },
        _updateButtonState: function () {
            this.legend.find('button').removeClass('blue');
            switch (this.viewType) {
                case 'daily':
                    this.legend.find('button:eq(0)').addClass('blue');
                    break;
                case 'weekly':
                    this.legend.find('button:eq(1)').addClass('blue');
                    break;
                case 'monthly':
                    this.legend.find('button:eq(2)').addClass('blue');
                    break;
            }
        },
        _createWrapper: function () {
            this.wrapper = $('<div>').addClass('cal').appendTo(this.element);
            this.legend = $('<div>').addClass('legend').appendTo(this.wrapper);
            this._createLegendButtons();
            this.content = $('<div>').addClass('content').appendTo(this.wrapper);
        },
        _createLegendButtons: function () {
            var day = $('<button>').appendTo(this.legend).html('每日')
                .addClass('button');
            this._on(day, 'click', function (e) {
                this.content.html('');
                this.viewType = 'daily';
                this.show();
            });

            var week = $('<button>').appendTo(this.legend).html('每周')
                .addClass('button');
            this._on(week, 'click', function (e) {
                this.content.html('');
                this.viewType = 'weekly';
                this.show();
            });

            var month = $('<button>').appendTo(this.legend).html('每月')
                .addClass('button');
            this._on(month, 'click', function (e) {
                this.content.html('');
                this.viewType = 'monthly';
                this.show();
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
                that.content.html('努力加载数据中...');
            }, 100);
            datetime = datetime || this.date || new Date();
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
                $.each(schedules, function (i, schedule) {
                    schedule.start = new Date(schedule.start);
                    schedule.end = new Date(schedule.end);
                });
                that.date = datetime;
                that.viewType = 'daily';
                that.content.html('');
                that._dailyView(datetime).appendTo(that.content);
                that._bindDailyEvent();
                that._showDailySchedules(datetime, schedules);
                that._scrollDailyView();
            }
        },
        _dailyView: function (datetime) {
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
                for (var j = 0; j < 2; j++) {
                    var d = $('<div>').addClass('quarter').appendTo(r);
                    if (j == 1) d.addClass('last');
                }
            }
            return div;
        },
        _scrollDailyView: function () {
            var now = new Date();
            var hours = now.getHours();
            var mins = hours * 60 + now.getMinutes();
            this.element.find('.dcal .time-line')
                .css('top', (mins * 100 / 24 / 60) + '%');
            var el = this.element.find('.dcal .time-scroll');
            if (typeof this._scrollTop !== "number") {
                this._scrollTop = el.get(0).scrollHeight * hours / 24 - 10;
            }
            el.scrollTop(this._scrollTop);
        },
        _bindDailyEvent: function () {
            this._on(this.element.find('.btn.prev'), 'click', function (e) {
                var d = new Date(this.date);
                d.setDate(d.getDate() - 1);
                this.dailyView(d);
            });
            this._on(this.element.find('.btn.next'), 'click', function (e) {
                var d = new Date(this.date);
                d.setDate(d.getDate() + 1);
                this.dailyView(d);
            });
            this._on(this.element.find('.dcal'), 'click', function (e) {
                var el = $(e.target);
                if (el.hasClass('quarter')) {
                    if (this.event && this.event.onAddSchedule) {
                        var mins = el.index() * 30;
                        var hour = Math.floor(mins / 60), min = mins % 60;

                        var d = new Date(this.date);
                        d.setHours(hour);
                        d.setMinutes(min);
                        d = new Date(d - d % 60000);

                        this.event.onAddSchedule(d);
                    }
                } else if (el.hasClass('schedule') || el.hasClass('span-schedule')) {
                    this.event && this.event.onViewSchedule &&
                    this.event.onViewSchedule(el.data('schedule'));
                }
            });
        },
        _showDailySchedules: function (datetime, schedules) {
            var that = this;
            var dailyApmts = [];
            var spanApmts = [];
            $.each(schedules, function (i, apmt) {
                var s = new Date(apmt.start);
                var e = new Date(apmt.end);
                var days = datetime.getFullYear() + datetime.getMonth() + datetime.getDate();
                var day0 = s.getFullYear() + s.getMonth() + s.getDate();
                var day1 = e.getFullYear() + e.getMonth() + e.getDate();
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
                    .data('schedule', apmt)
                    .addClass('span-schedule')
                    .css('margin-left', ml + '%')
                    .css('margin-right', mr + '%')
                    .css('margin-top', '-1px')
                    .appendTo(that.content.find('.span'));
            });
            dailyApmts.sort(function (x, y) {
                var dx = new Date(x.start);
                var dy = new Date(y.start);
                return dx - dy > 0;
            });
            var pos = [0];
            $.each(dailyApmts, function (i, apmt) {
                if (i == 0) return;
                var p = 0;
                for (var j = 0; j < i; j++) {
                    var dx = new Date(dailyApmts[i - j - 1].end);
                    var dy = new Date(apmt.start);
                    if (dx <= dy) continue;
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
                    .data('schedule', apmt)
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
        weeklyView: function (datetime) {
            var that = this;
            var t = setTimeout(function () {
                that.content.html('努力加载数据中...');
            }, 100);
            datetime = datetime || this.date || new Date();
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
                $.each(schedules, function (i, schedule) {
                    schedule.start = new Date(schedule.start);
                    schedule.end = new Date(schedule.end);
                });
                that.date = datetime;
                that.viewType = 'weekly';
                that.content.html('');
                that._weeklyView(datetime).appendTo(that.content);
                that._showWeeklySchedule(datetime, schedules);
                that._bindWeeklyEvents();
            }
        },
        _weeklyView: function (datetime) {
            var div = $('<div>').addClass('wcal');
            var title = $('<div>').addClass('title').appendTo(div);
            $('<span>').addClass('btn prev').html('&lt;').appendTo(title);
            var sw = this.beginOfWeek(datetime, true);
            var ew = this.endOfWeek(datetime, true);

            $('<span>').addClass('txt').html(this._dateString(sw) + ' ~ ' + this._dateString(ew)).appendTo(title);
            $('<span>').addClass('btn next').html('&gt;').appendTo(title);
            var wdays = $('<div>').addClass('wdays').appendTo(div);
            var spans = $('<div>').addClass('spans').appendTo(div);

            var d = new Date(datetime - this.dayMs * datetime.getDay());
            for (var i = 0; i < 7; i++) {
                var txt = this.l10n.weekNames[i] + '(' + this._dateString(d) + ')';
                $('<div>').addClass('wday').appendTo(wdays).html(txt);
                $('<div>').addClass('day').appendTo(spans);
                d.setDate(d.getDate() + 1);
            }

            var g = $('<div>').addClass('grid').appendTo(div);
            var l = $('<div>').addClass('lcol').appendTo(g);
            var r = $('<div>').addClass('rcol').appendTo(g);

            for (var i = 0; i < 7; i++) {
                var d = $('<div>').addClass('wcol').appendTo(r);
                for (var j = 0; j < 24; j++) {
                    $('<div>').addClass('cell').appendTo(d);
                }
            }

            for (var i = 0; i < 24; i++) {
                $('<div>').addClass('cell').html(this._pad0(i) + ":00").appendTo(l);
            }

            return div;
        },
        _showWeeklySchedule: function (datetime, schedules) {
            var that = this;
            var dailyApmts = [];
            var spanApmts = [];
            var sweek = this.beginOfWeek(datetime, true);
            var eweek = this.endOfWeek(datetime, true);

            $.each(schedules, function (i, apmt) {
                var s = apmt.start;
                var e = apmt.end;
                if (e < sweek || s > eweek) return;
                if (e.getDate() != s.getDate()) spanApmts.push(apmt);
                else dailyApmts.push(apmt);
            });

            spanApmts.sort(function (x, y) {
                return x.start - y.start;
            });

            $.each(spanApmts, function (i, apmt) {
                var s = new Date(apmt.start);
                var e = new Date(apmt.end);

                var idx = 0, ml = 0, w;
                if (s > sweek) {
                    idx = s.getDay();
                    var mins = s.getHours() * 60 + s.getMinutes();
                    ml = mins * 100 / 24 / 60;
                }

                var mins = (Math.min(eweek, e) - Math.max(sweek, s)) / 60000;
                w = mins * 100 / 24 / 60;

                var days = that.content.find('.spans .day');
                for (var i = 0; i < 7; i++) {
                    var d = $('<div>').appendTo(days.get(i));
                    if (idx == i)
                        d.addClass('schedule')
                            .html(apmt.subject)
                            .data('schedule', apmt)
                            .css('margin-left', ml + '%')
                            .css('width', w + '%');
                    else
                        d.addClass('pholder');
                }
            });


            // daily
            dailyApmts.sort(function (x, y) {
                return x.start - y.start;
            });

            var weekData = [];
            for (var i = 0; i < 7; i++) weekData.push([]);
            $.each(dailyApmts, function (i, apmt) {
                weekData[apmt.start.getDay()].push(apmt);
            });

            for (var i = 0; i < 7; i++) {
                var arr = weekData[i];
                var pos = [0];
                $.each(arr, function (i, apmt) {
                    if (i == 0) return;
                    var p = 0;
                    for (var j = 0; j < i; j++) {
                        var dx = arr[i - j - 1].end;
                        var dy = apmt.start;
                        if (dx <= dy) continue;
                        p = pos[i - j - 1] + 1;
                        break;
                    }
                    pos.push(p);
                });
                $.each(arr, function (k, apmt) {
                    var s = apmt.start;
                    var e = apmt.end;
                    var total = 24 * 60;
                    var cols = getWidth(pos, k);
                    var smins = s.getHours() * 60 + s.getMinutes();
                    var emins = e.getHours() * 60 + e.getMinutes();
                    var top = 100 * smins / total;
                    var left = 90 / cols * pos[k];
                    var height = 100 * (emins - smins) / total;
                    var width = 90 / cols;
                    $('<div>').addClass('schedule')
                        .data('schedule', apmt)
                        .css('top', top + '%')
                        .css('left', left + '%')
                        .css('height', height + '%')
                        .css('width', width + '%')
                        .html(apmt.subject)
                        .appendTo(that.content.find('.wcol:eq(' + i + ')'));
                });
            }

            function getWidth(pos, i) {
                for (; i < pos.length - 1; i++) {
                    if (pos[i + 1] == 0)break;
                }
                return pos[i] + 1;
            }
        },
        _bindWeeklyEvents: function () {
            this._on(this.content.find('.btn.prev'), 'click', function () {
                var d = new Date(this.date - this.dayMs * 7);
                this.weeklyView(d);
            });

            this._on(this.content.find('.btn.next'), 'click', function () {
                var d = new Date(this.date - 0 + this.dayMs * 7);
                this.weeklyView(d);
            });

            this._on(this.content.find('.wcal'), 'click', function (e) {
                var el = $(e.target);
                if (el.hasClass('cell')) {
                    if (this.event && this.event.onAddSchedule) {
                        var d = this.beginOfWeek(this.date);
                        d.setDate(d.getDate() + el.parent().index());
                        d.setHours(el.index());
                        this.event.onAddSchedule(d);
                    }
                } else if (el.hasClass('schedule')) {
                    this.event && this.event.onViewSchedule &&
                    this.event.onViewSchedule(el.data('schedule'));
                }
            });
        },
        monthlyView: function (datetime) {
            var that = this;
            var t = setTimeout(function () {
                that.content.html('努力加载数据中...');
            }, 100);
            datetime = datetime || this.date || new Date();
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
                $.each(schedules, function (i, schedule) {
                    schedule.start = new Date(schedule.start);
                    schedule.end = new Date(schedule.end);
                });
                that.date = datetime;
                that.viewType = 'monthly';
                that.content.html('');
                that._monthlyView(datetime).appendTo(that.content);
                //that._bindDailyEvent();
                that._bindMonthlyEvent();
                that._showMonthlySchedules(datetime, schedules);
            }
        },
        _monthlyView: function (datetime) {
            var sm = this.beginOfMonth(datetime, true);
            var em = this.endOfMonth(datetime, true);
            var rows = Math.ceil((em.getDate() + sm.getDay()) / 7),
                tbl = $('<table>').addClass('mcal'), tr, td, cols, col;

            cols = $('<colgroup>').appendTo(tbl);
            for (var i = 0; i < 8; i++) {
                col = $('<col>').appendTo(cols);
                if (i !== 0) col.css('width', '13.6%');
            }

            // switch month button
            tr = $('<tr>').appendTo(tbl);
            td = $('<td>').attr('colspan', 8).addClass('title').appendTo(tr);
            $('<span>').addClass('btn prev').html('&lt;').appendTo(td);
            $('<span>').addClass('txt').appendTo(td).html(
                this._pad0(datetime.getFullYear()) + '/' +
                this._pad0(datetime.getMonth() + 1)
            );
            $('<span>').addClass('btn next').html('&gt;').appendTo(td);

            // week days row
            tr = $('<tr>').appendTo(tbl);
            for (var i = 0; i < 8; i++) {
                td = $('<td>').addClass('h').appendTo(tr);
                if (i > 0) td.html(this.l10n.weekNames[i - 1]);
            }

            sm.setDate(sm.getDate() - sm.getDay());

            for (var i = 0; i < rows; i++) {
                tr = $('<tr>').appendTo(tbl);
                td = $('<td>').appendTo(tr).attr('rowspan', 2).addClass('l').html(this._pad0(i));
                for (var j = 0; j < 7; j++) {
                    td = $('<td>').appendTo(tr).html(
                        this._pad0(sm.getMonth() + 1) + '/' +
                        this._pad0(sm.getDate())
                    );
                    if (sm.getMonth() != datetime.getMonth())
                        td.addClass('gray');
                    sm.setDate(sm.getDate() + 1);
                }
                tr = $('<tr>').appendTo(tbl);
                for (var j = 0; j < 7; j++) {
                    $('<td>').addClass('cell').appendTo(tr);
                }
            }
            return tbl;

        },
        _bindMonthlyEvent: function () {
            this._on(this.content.find('.btn.prev'), 'click', function () {
                    this.date.setMonth(this.date.getMonth() - 1);
                    this.monthlyView();
                }
            );
            this._on(this.content.find('.btn.next'), 'click', function () {
                this.date.setMonth(this.date.getMonth() + 1);
                this.monthlyView();
            });
        },
        _showMonthlySchedules: function (datetime, schedules) {
            var that = this;
            var validSchedules = [];
            var sm = this.beginOfMonth(datetime, true);
            var em = this.endOfMonth(datetime, true);
            var sidx, eidx, row, col, cols, el, rowEndIdx;

            sm.setDate(sm.getDate() - sm.getDay());
            em.setDate(em.getDate() + 6 - em.getDay());

            $.each(schedules, function (i, schedule) {
                if (schedule.end < sm || schedule.start > em) return;
                validSchedules.push(schedule)
            });

            validSchedules.sort(function(a, b) {
                return a.start - b.start;
            });

            $.each(validSchedules, function (i, schedule) {
                var s = Math.max(schedule.start, sm);
                var e = Math.min(schedule.end, em);
                sidx = Math.floor((s - sm) / that.dayMs);
                eidx = Math.floor((e - sm) / that.dayMs);

                for (var idx = sidx; idx <= eidx;) {
                    row = Math.floor(idx / 7);
                    col = Math.floor(idx % 7);
                    cols = 7 - col;
                    rowEndIdx = Math.floor(idx / 7) * 7 + 6;
                    if (rowEndIdx > eidx)
                        cols = eidx - idx + 1;
                    idx += cols;

                    var td = $('.mcal')
                        .find('tr:eq(' + (row * 2 + 3) + ')')
                        .find('td:eq(' + col + ')');

                    el = $('<div>').html(
                        that._dateString(schedule.start) + ' ~ ' +
                        that._dateString(schedule.end)
                    ).addClass('schedule').appendTo(td);

                    if (cols > 1) {
                        el.css('width', cols + '00%');
                        //el.css('padding-left', (cols - 1) + 'px');
                    }

                    for (var j = 1; j < cols; j++) {
                        td = td.next();
                        $('<div>').addClass('sholder').appendTo(td);
                    }


                }


            });
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
            return date.getFullYear() + '/' + this._pad0(date.getMonth() + 1) + '/' + this._pad0(date.getDate());
        },
        _appointments: function () {
            return this.options.appointments || [];
        },
        setDataSource: function (ds) {
            this.dataSource = ds;
        },
        _getSchedulesByDate: function (date, callback) {
            var ds = this.dataSource || this.options.dataSource;
            if (ds && ds.getSchedulesByDate) {
                return ds.getSchedulesByDate(date, callback);
            }
            return function () {
                return [];
            };
        },
        beginOfDay: function (date, clone) {
            if (!!clone) date = new Date(date);
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
            return date;
        },
        endOfDay: function (date, clone) {
            if (!!clone) date = new Date(date);
            date.setHours(23);
            date.setMinutes(59);
            date.setSeconds(59);
            date.setMilliseconds(999);
            return date;
        },
        beginOfWeek: function (date, clone) {
            if (!!clone) date = new Date(date);
            date.setDate(date.getDate() - date.getDay());
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
            return date;
        },
        endOfWeek: function (date, clone) {
            if (!!clone) date = new Date(date);
            date.setDate(date.getDate() - 0 + (6 - date.getDay()));
            date.setHours(23);
            date.setMinutes(59);
            date.setSeconds(59);
            date.setMilliseconds(999);
            return date;
        },
        beginOfMonth: function (date, clone) {
            if (!!clone) date = new Date(date);
            date.setDate(1);
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
            return date;
        },
        endOfMonth: function (date, clone) {
            if (!!clone) date = new Date(date);
            date.setMonth(date.getMonth() + 1);
            date.setDate(0);
            date.setHours(23);
            date.setMinutes(59);
            date.setSeconds(59);
            date.setMilliseconds(999);
            return date;
        }
    });


})(jQuery);
