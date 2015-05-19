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
                that._updateButtonState();
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
            var sd = this.beginOfDay(datetime, true);
            var ed = this.endOfDay(datetime, true);
            $.each(schedules, function (i, apmt) {
                var s = apmt.start;
                var e = apmt.end;
                if(s > ed || e < sd) return;
                if(s < sd || e > ed) spanApmts.push(apmt);
                else dailyApmts.push(apmt);
            });
            $.each(spanApmts, function (i, apmt) {
                var ml = 0, mr = 0;
                if (apmt.start > sd) {
                    var mins = (apmt.start - sd) / 60000;
                    ml = 100 * mins / 24 / 60;
                }
                if (apmt.end < ed) {
                    var mins = (ed - apmt.end) / 60000;
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
                that._updateButtonState();
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
                var tt = $('<div>').addClass('wday').appendTo(wdays);
                $('<a>').attr('href', 'javascript:;').html(txt).appendTo(tt);
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
                        var d = this.beginOfWeek(this.date, true);
                        d.setDate(d.getDate() + el.parent().index());
                        d.setHours(el.index());
                        this.event.onAddSchedule(d);
                    }
                } else if (el.hasClass('schedule')) {
                    this.event && this.event.onViewSchedule &&
                    this.event.onViewSchedule(el.data('schedule'));
                } else if (e.target.nodeName == 'A') {
                    var m = el.html().match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
                    this.dailyView(
                        new Date(
                            parseInt(m[1]),
                            parseInt(m[2]) - 1,
                            parseInt(m[3])
                        )
                    );
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
                that._updateButtonState();
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
                    td = $('<td>').appendTo(tr);
                    $('<a>').attr('href', 'javascript:;').appendTo(td).html(
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
            this._on(this.content.find('.mcal'), 'click', function (e) {
                var el = $(e.target);
                if (el.hasClass('cell')) {
                    if (this.event && this.event.onAddSchedule) {
                        var d = this.beginOfMonth(this.date, true);
                        var row = Math.floor((el.parent().index() - 3) / 2);
                        var col = el.index();
                        d.setDate(d.getDate() + row * 7 + col - d.getDay());
                        d.setHours(8);
                        this.event.onAddSchedule(d);
                    }
                } else if (el.hasClass('schedule')) {
                    this.event && this.event.onViewSchedule &&
                    this.event.onViewSchedule(el.data('schedule'));
                } else if (e.target.nodeName == 'A') {
                    var match0 = this.content.find('span.txt').html()
                        .match(/(\d{4})\/(\d{2})/);
                    var match1 = el.html().match(/(\d{1,2})\/(\d{1,2})/);
                    var dt = new Date(this.date);

                    var y = parseInt(match0[1]);
                    var m0 = parseInt(match0[2]);
                    var m1 = parseInt(match1[1]);
                    var d = parseInt(match1[2]);

                    dt.setFullYear(y);
                    dt.setMonth(m1 - 1);
                    dt.setDate(d);

                    if (m0 - m1 == -11) {
                        dt.setFullYear(y - 1);
                    }

                    this.dailyView(dt);
                }
            });
        },
        _showMonthlySchedules: function (datetime, schedules) {
            var that = this;
            var validSchedules = {};
            var sm = this.beginOfMonth(datetime, true);
            var em = this.endOfMonth(datetime, true);
            var days = em.getDate() + sm.getDay() + 6 - em.getDay();
            var rows = days / 7;
            var sidx, eidx, row, col, cols, sd, ed, td, el;

            sm.setDate(sm.getDate() - sm.getDay());
            em.setDate(em.getDate() + 6 - em.getDay());

            var sw, ew;

            $.each(schedules, function (i, schedule) {
                sw = new Date(sm);
                ew = that.endOfWeek(sw, true);

                for (var j = 0; j < rows; j++) {
                    if (schedule.end > sw && schedule.start < ew) {
                        validSchedules[j] = validSchedules[j] || [];
                        validSchedules[j].push(schedule);
                    }
                    sw.setDate(sw.getDate() + 7);
                    ew.setDate(ew.getDate() + 7);
                }
            });


            $.each(validSchedules, function (i, weekSchedules) {
                weekSchedules.sort(function (a, b) {
                    return a.start.getHours() * 60 + a.start.getMinutes() -
                        b.start.getHours() * 60 - b.start.getMinutes();
                });

                sw = new Date(sm - 0 + i * 7 * that.dayMs);
                ew = that.endOfWeek(sw, true);

                $.each(weekSchedules, function (j, schedule) {
                    sd = Math.max(schedule.start, sw);
                    ed = Math.min(schedule.end, ew);
                    sidx = Math.floor((sd - sw) / that.dayMs);
                    eidx = Math.floor((ed - sw) / that.dayMs);
                    cols = eidx - sidx + 1;
                    row = i;
                    col = sidx;
                    td = getCell(row, col);
                    el = $('<div>').html(
                        that._pad0(schedule.start.getHours()) + ':' +
                        that._pad0(schedule.start.getMinutes()) + ' ' +
                        schedule.subject
                    ).data('schedule', schedule).addClass('schedule');

                    var sd = that.beginOfDay(schedule.start, true);
                    var ed = that.endOfDay(schedule.end, true);

                    if (sd < sw) {
                        el.css('border-left', '1px dashed transparent');
                    }
                    if (ed > ew) {
                        el.css('border-right', '1px dashed transparent');
                    }

                    if (cols == 1) el.appendTo(td);
                    else {
                        appendSchedule(el, td, cols);
                    }

                    if (cols > 1) {
                        el.css('width', cols + '00%');
                        if (cols - 3 > 0)
                            el.css('padding-right', (cols - 3) + 'px');
                    }
                });

                sw.setDate(sw.getDate() + 7);
                ew.setDate(ew.getDate() + 7);
            });

            // functions
            function getCell(row, col) {
                return $('.mcal')
                    .find('tr:eq(' + (row * 2 + 3) + ')')
                    .find('td:eq(' + col + ')');
            }

            function appendSchedule(el, td, cols) {
                var t = td, max = 0, n;
                for (var i = 0; i < cols; i++) {
                    max = Math.max(max, t.children().length);
                    t = t.next();
                }
                t = td;
                for (var i = 0; i < cols; i++) {
                    n = max - t.children().length;
                    if (i !== 0) n += 1;
                    for (var j = 0; j < n; j++) {
                        $('<div>').addClass('sholder').appendTo(t);
                    }
                    t = t.next();
                }
                el.appendTo(td);
            }
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
            return date.getFullYear() + '/' + this._pad0(date.getMonth() + 1) +
                '/' + this._pad0(date.getDate());
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
