/**
 * @author H.Yvonne
 * @create 2016.4.7
 * calendar
 */
(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], function () {
            return (root.calendar = factory());
        });
    } else {
        root.calendar = factory();
    }
})(this, function () {
    var plugin = function(config){
        config = config || {};
        var o;
        for(o in config){
            this[o] = config[o];
        }
        this.arr = [];
        this.init();
    };

    // var arr = [];

    /*config*/
    $.extend(plugin.prototype, {
        lange: 'en',//'cn'|'en'
        number: 6,//一次显示几个月份
        need: 1,//需要选择多少个日期
        currDate: '',//当前选择的日期
        showStart: '1',//几月开始显示
        showYear: '2016',//显示日期的年份
        dataRange: '',//日期选择范围，数组
        callback: ''
    });

    $.extend(plugin.prototype, {
        init: function () {
            this.mainView();
            this.getDates();
            this.renderView();
            this.renderActive();
            this.mouseFun();
        }
    });

    /*click function*/
    $.extend(plugin.prototype, {
        mouseFun: function () {
            var _self = this;
            $('div.calendar-wrap').on('click', 'a.calendar-back-icon', function () {
                $('div.calendar-popbox').remove();
            }).on('click', 'a.main-date-btn', function () {
                var $li = $(this).parents('li.it');
                if($li.hasClass('disabled')) return;
                // 已选中则取消选中
                if($li.hasClass('active')) {
                    $li.removeClass('active');
                    _self.arr = [];
                    $('li.active').each(function () {
                        var date = $(this).attr('data-day');
                        date?_self.arr.push(date):'';
                    });
                } else {
                    if(_self.arr.length >= _self.need) {
                        _self.arr = [];
                        $('li.active').removeClass('active');
                    }
                    $li.addClass('active');
                    var date = $li.attr('data-day');
                    _self.arr.push(date);
                    if(_self.arr.length >= _self.need) {
                        if(typeof _self.callback === 'function') {
                            $('div.calendar-popbox').remove();
                            _self.callback(_self.arr);
                        }
                    }
                }
            });
        }
    });

    /*main view*/
    $.extend(plugin.prototype, {
        mainView: function () {
            var _self = this;
            $('body').append(_self.getMHtml());
        },
        renderActive: function () {
            var _self = this;
            if(_self.currDate) {
                    var list = _self.currDate.split(',');
                for(var j in list) {
                    $('li[data-day="'+list[j]+'"]').addClass('active');
                    _self.arr.push(list[j]);
                }
            }
        }
    });

    /*item view*/
    $.extend(plugin.prototype, {
        getDates: function () {
            var myDate = new Date(), _self = this;
            // var fullYear = myDate.getFullYear(), currMonth = myDate.getMonth(), nMonth, nYear;
            var fullYear = _self.showYear, currMonth = _self.showStart-1, nMonth, nYear;
            _self.dateArr = [];
            for(var i = 0; i < _self.number; i++) {
                nMonth = currMonth+1+i, nYear = fullYear;
                if(nMonth > 12) {
                    nMonth = nMonth - 12;
                    nYear = nYear+1;
                }
                var date = new Date(nYear+'/'+nMonth+'/01');
                var startDay;
                if(_self.lange == 'cn') {
                    startDay = date.getDay()-1;
                    startDay < 0?startDay = 6:'';
                } else if (_self.lange == 'en') {
                    startDay = date.getDay();
                }
                date.setMonth(nMonth);
                date.setDate(0);
                var totalDays = date.getDate();
                this.dateArr.push({
                    year: nYear,
                    month: nMonth<10?('0'+nMonth):nMonth,
                    start: startDay,
                    total: totalDays
                });
            }
        },
        renderView: function () {
            var _self = this;
            for(var i = 0; i < _self.number; i++) {
                var $wrap = $('div.calendar-main-wrap');
                $wrap.append(_self.getItem(i));
                $wrap.find('ul.main-date-list').eq(i).html(_self.renderTable(i));
            }
        },
        renderTable: function (i) {
            var _self = this, html = '';
            for(var j = 0; j < _self.dateArr[i].start; j++) {
                html = html + '<li class="it"></li>';
            }
            for(var k = 0; k < _self.dateArr[i].total; k++) {
                var day, currDay = new Date().getDate(), m = new Date().getMonth();
                day < 9 ? day = '0'+(k+1) : day = k+1;
                if(_self.dataRange) {
                    var d = _self.showYear+'-'+'0'+_self.showStart+'-'+day;
                    if(_self.dataRange.indexOf(d) >= 0) {
                        html = html + '<li class="it" data-day="'+_self.dateArr[i].year+'-'+_self.dateArr[i].month+'-'+day+'"><a href="javascript:;" class="main-date-btn">'+(k+1)+'</a></li>';
                    } else {
                        html = html + '<li class="it disabled" data-day="'+_self.dateArr[i].year+'-'+_self.dateArr[i].month+'-'+day+'"><a href="javascript:;" class="main-date-btn">'+(k+1)+'</a></li>';
                    }
                } else {
                    if(_self.dateArr[i].month == (m+1)%12 && i == 0 && k+1 <= currDay) {
                        html = html + '<li class="it disabled" data-day="'+_self.dateArr[i].year+'-'+_self.dateArr[i].month+'-'+day+'"><a href="javascript:;" class="main-date-btn">'+(k+1)+'</a></li>';
                    } else {
                        html = html + '<li class="it" data-day="'+_self.dateArr[i].year+'-'+_self.dateArr[i].month+'-'+day+'"><a href="javascript:;" class="main-date-btn">'+(k+1)+'</a></li>';
                    }
                }
            }
            var extra = 7-(_self.dateArr[i].start+_self.dateArr[i].total)%7;
            if(extra < 7) {
                for(var l = 0; l < extra; l++) {
                    html = html + '<li class="it"></li>';
                }
            }
            return html;
        }
    });

    /*modules*/
    $.extend(plugin.prototype, {
        getMHtml: function () {
            var html = '<div class="calendar-popbox">\
                            <div class="calendar-wrap">\
                                <header class="calendar-title-wrap">\
                                    <h1 class="calendar-title">选择日期</h1>\
                                    <a href="javascript:;" class="calendar-back-icon"></a>\
                                </header>\
                                <ul class="calendar-sub-title">\
                                    <li class="it">日</li>\
                                    <li class="it">一</li>\
                                    <li class="it">二</li>\
                                    <li class="it">三</li>\
                                    <li class="it">四</li>\
                                    <li class="it">五</li>\
                                    <li class="it">六</li>\
                                </ul>\
                                <div class="calendar-main-wrap"></div>\
                            </div>\
                            <div class="calendar-mask-layer"></div>\
                        </div>';
            return html;
        },
        getItem: function (i) {
            var _self = this;
            var html = '<section class="calendar-main-item">'+
                            '<h1 class="main-date-title">'+_self.dateArr[i].year+'年'+_self.dateArr[i].month+'月</h1>'+
                            '<ul class="main-date-list"></ul>'+
                        '</section>';
            return html;
        }
    });

    return function(config){
        new plugin(config);
    }
});