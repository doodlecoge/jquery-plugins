(function ($) {
    var panelHeight, panelScrollHeight, barHeight, startY, startBarTop;

    $.widget("ui.ScrollBar", {
        _create: function () {
            this.element.css('overflow', 'hidden');
            this.rail = $('<div>')
                .addClass('scrollbar-y-rail')
                .appendTo(this.element);
            this.bar = $('<div>')
                .addClass('scrollbar-y')
                .appendTo(this.rail);
        },
        _init: function () {
            this.updateScrollBar();
        },
        updateScrollBar: function () {
            var h = this.element.height();
            var sh = this.element.get(0).scrollHeight;
            this.bar.height(Math.max(h * h / sh, 50));
            this._updateEvent();
        },
        _updateEvent: function () {
            barHeight = this.bar.height();
            panelHeight = this.element.height();
            panelScrollHeight = this.element.get(0).scrollHeight;

            this._off(this.bar);
            this._off(this.rail);
            this._off($(document));

            this._on(this.bar, {
                mousedown: function (e) {
                    this.scrolling = true;
                    startY = e.pageY;
                    startBarTop = this.bar.offset().top - this.rail.offset().top;
                    e.stopPropagation();
                    return false;
                }
            });
            this._on(document, {
                mousemove: function (e) {
                    if (!this.scrolling)return;
                    var barTop = startBarTop + e.pageY - startY;
                    this._updateByBarTop(barTop);
                },
                mouseup: function () {
                    this.scrolling = false;
                }
            });
            this._on(this.rail, {
                click: function (e) {
                    if (!$(e.target).hasClass('scrollbar-y-rail'))return;

                    var y = e.pageY - this.rail.offset().top - this.bar.height() / 2;
                    this._updateByBarTop(y);
                }
            });
            this._on(this.element, {
                mousewheel: function (e) {
                    this._updateByScrollTop(this.element.get(0).scrollTop - 50 * e.deltaY);
                }
            });
        },
        _updateByBarTop: function (newBarTop) {
            var barTop = Math.max(0, Math.min(newBarTop, panelHeight - barHeight));

            var newScrollTop = barTop / (panelHeight - barHeight) *
                (panelScrollHeight - panelHeight);

            this.bar.css('top', barTop + 'px');
            this.rail.css('top', newScrollTop + 'px');
            this.element.get(0).scrollTop = newScrollTop;
        },
        _updateByScrollTop: function (newScrollTop) {
            newScrollTop = Math.max(0, Math.min(newScrollTop, panelScrollHeight - panelHeight));
            var barTop = newScrollTop * (panelHeight - barHeight) /
                (panelScrollHeight - panelHeight);

            this.bar.css('top', barTop + 'px');
            this.rail.css('top', newScrollTop + 'px');
            this.element.get(0).scrollTop = newScrollTop;
        }
    })
    ;
})
(jQuery);