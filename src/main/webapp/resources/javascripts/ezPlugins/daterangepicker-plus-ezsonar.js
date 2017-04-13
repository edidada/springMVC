/**
 * @version: 1.2
 * @author: Dan Grossman http://www.dangrossman.info/
 * @date: 2013-07-25
 * @copyright: Copyright (c) 2012-2013 Dan Grossman. All rights reserved.
 * @license: Licensed under Apache License v2.0. See http://www.apache.org/licenses/LICENSE-2.0
 * @website: http://www.improvely.com/
 */
(function ($,undefined) {

    var DateRangePicker = function (element, options) {
        var hasOptions = typeof options == 'object';
        var localeObject;

        this.outerContainer = '#container';

        //option defaults
        this.startDate = moment().startOf('minute');
        this.endDate = moment().startOf('minute');
        this.minDate = false;
        this.maxDate = false;
        this.dateLimit = false;
        this.shown = false;
        this.menuHoverDelayTimer = null;
        this.menuHoverDelay = 200;

        if(TIME_DELAY != null){
            this.eztimeDelay = TIME_DELAY;
        }else{
            this.eztimeDelay = 2;
        }

        this.useSecond = false;

        this.showDropdowns = false;
        this.showWeekNumbers = false;
        this.timePicker = true;
        this.timePickerIncrement = 30;
        this.timePicker12Hour = true;
        this.ranges = {};
        this.opens = 'right';

        //Global defaults for all the datetime picker instances(plus)
        this.useRecent = false;
        this.useHistory = true;
        this.useLocalStorage = true;
        this.historyLocalStorageName = "ezTimePickerHistory";
        this.rangesOptions = false;
        this.rangestype = "default";
        this.hovershowtime = false;
        this.selectRangesLabel = "";
        this.showCustom = true;
        this.showTimeTips = true;
        this.showExpandTools = false;
        this.showExpandToolsMove = 1;
        this.showExpandToolsChange = 1;
        this.expandToolsEventDelay = 1000;
        this.sendEvent = 0;
        this.currentText = 'Now';
        this.closeText = 'Done';
        this.ampm = false;
        this.amNames = ['AM', 'A'];
        this.pmNames = ['PM', 'P'];
        this.timeFormat = 'hh =mm tt';
        this.timeSuffix = '';
        this.timeOnlyTitle = 'Choose Time';
        this.timeText = '时间';
        this.hourText = '小时';
        this.minuteText = '分钟';
        this.secondText = '秒钟';
        this.millisecText = '毫秒';
        this.timezoneText = '时区';
        this.showButtonPanel = true;
        this.timeOnly = false;
        this.showHour = true;
        this.showMinute = true;
        this.showSecond = false;
        this.showMillisec = false;
        this.showTimezone = false;
        this.showTime = true;
        this.stepHour = 1;
        this.stepMinute = 1;
        this.stepSecond = 1;
        this.stepMillisec = 1;
        this.hour = 0;
        this.minute = 0;
        this.second = 0;
        this.millisec = 0;
        this.timezone = '+0000';
        this.hourMin = 0;
        this.minuteMin = 0;
        this.secondMin = 0;
        this.millisecMin = 0;
        this.hourMax = 23;
        this.minuteMax = 59;
        this.secondMax = 59;
        this.millisecMax = 999;
        this.minDateTime = null;
        this.maxDateTime = null;
        this.onSelect = null;
        this.hourGrid = 0;
        this.minuteGrid = 0;
        this.secondGrid = 0;
        this.millisecGrid = 0;
        this.alwaysSetTime = true;
        //this.separator = ' ';
        this.altFieldTimeOnly = true;
        this.showTimepicker = true;
        this.timezoneIso8609 = false;
        this.timezoneList = null;
        this.addSliderAccess = false;
        this.sliderAccessArgs = null;

        this.buttonClasses = ['btn', 'btn-small'];
        this.applyClass = 'btn btn-success mini';
        this.cancelClass = 'btn btn-light mini';

        this.format = 'YYYY/MM/DD HH:mm';
        this.separator = ' - ';

        this.locale = {
            applyLabel: '确定',
            cancelLabel: '取消',
            fromLabel: '起始',
            toLabel: '结束',
            weekLabel: 'W',
            customRangeLabel: '自定义',
            historyRangeLabel: '最近选择',
            daysOfWeek: moment()._lang._weekdaysMin,
            monthNames: moment()._lang._monthsShort,
            firstDay: 0
        };

        this.cb = function () { };

        //element that triggered the date range picker
        this.element = $(element);

        if (this.element.hasClass('pull-right'))
            this.opens = 'left';

        if (this.element.is('input')) {
            this.element.on({
                click: $.proxy(this.show, this)
                //focus: $.proxy(this.show, this)
            });
        } else {
            this.element.on('click', $.proxy(this.show, this));
        }

        localeObject = this.locale;

        if (hasOptions) {
            if (typeof options.locale == 'object') {
                $.each(localeObject, function (property, value) {
                    localeObject[property] = options.locale[property] || value;
                });
            }

            if (options.applyClass) {
                this.applyClass = options.applyClass;
            }

            if (options.cancelClass) {
                this.cancelClass = options.cancelClass;
            }

            if(typeof options.showExpandTools === 'boolean'){
                this.showExpandTools = options.showExpandTools;
            }

            if(typeof options.showExpandToolsMove === 'number'){
                this.showExpandToolsMove = options.showExpandToolsMove;
            }

            if(typeof options.showExpandToolsChange === 'number'){
                this.showExpandToolsChange = options.showExpandToolsChange;
            }

            if(typeof options.outerContainer === 'string'){
                this.outerContainer = options.outerContainer;
            }
        }

        var DRPTemplate = '<div class="daterangepicker dropdown-menu">' +
            '<div style="position: relative; float: left;">' +
            '<div class="calendar left"><div class="calendar-date"></div></div>' +
            '<div class="calendar right"><div class="calendar-date"></div></div>' +
            '<div class="history"><ul class="history-selections"></ul></div>' +
            '<div class="ranges">' +
            '<div class="range_inputs" style="text-align: right; display: none; position: absolute; bottom:5px;">' +
            '<div class="daterangepicker_start_input" style="float: left; display: none;">' +
            '<label for="daterangepicker_start">' + this.locale.fromLabel + '</label>' +
            '<input class="input-mini" type="text" name="daterangepicker_start" value="" disabled="disabled" />' +
            '</div>' +
            '<div class="daterangepicker_end_input" style="float: left; padding-left: 11px; display: none;">' +
            '<label for="daterangepicker_end">' + this.locale.toLabel + '</label>' +
            '<input class="input-mini" type="text" name="daterangepicker_end" value="" disabled="disabled" />' +
            '</div>' +
            '<button class="' + this.applyClass + ' applyBtn" disabled="disabled">' + this.locale.applyLabel + '</button>' +
            '<button class="' + this.cancelClass + ' cancelBtn">' + this.locale.cancelLabel + '</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
        var _timetipsdom = '<div class="datetime-icon-area"><div class="datetime-icon-container"><i class="icon-calendar2"></i><span class="datetime-text" style="visibility: hidden;"></span></div></div>';
        var _timearea = '<div style="display:inline-block; position:relative;"></div>';
        var _timeexpand_left = '<div class="time-expand-tools left"><a class="btn for-icon expand-left-minus"><i class="icon-minus"></i></a><a class="btn for-icon expand-left-plus"><i class="icon-plus"></i></a><a class="btn for-icon expand-left-move"><i class="icon-step-backward"></i></a></div>';
        var _timeexpand_right = '<div class="time-expand-tools right"><a class="btn for-icon expand-right-move"><i class="icon-step-forward"></i></a><a class="btn for-icon expand-right-plus"><i class="icon-plus"></i></a><a class="btn for-icon expand-right-minus"><i class="icon-minus"></i></a></div>';
        var _timerecent = '<div class="time-expand-tools right"><a class="btn for-icon recent-pre" disabled="disabled"><i class="icon-arrow-left"></i></a><a class="btn for-icon recent-next" disabled="disabled"><i class="icon-arrow-right"></i></a></div>';

        if($(this.outerContainer).length < 1){
            this.outerContainer = "body";
        }

        this.container = $(DRPTemplate).appendTo(this.outerContainer);
        this.outerContainerDom = $(this.outerContainer);

        if (hasOptions) {

            if (typeof options.selectedrange == 'string')
                this.selectRangesLabel = options.selectedrange;

            if (typeof options.showCustom == 'boolean')
                this.showCustom = options.showCustom;

            if (typeof options.format == 'string')
                this.format = options.format;

            if (typeof options.separator == 'string')
                this.separator = options.separator;

            if (typeof options.startDate == 'string')
                this.startDate = moment(options.startDate, this.format);

            if (typeof options.endDate == 'string')
                this.endDate = moment(options.endDate, this.format);

            if (typeof options.minDate == 'string')
                this.minDate = moment(options.minDate, this.format);

            if (typeof options.maxDate == 'string')
                this.maxDate = moment(options.maxDate, this.format);

            if (typeof options.startDate == 'object')
                this.startDate = moment(options.startDate);

            if (typeof options.endDate == 'object')
                this.endDate = moment(options.endDate);

            if (typeof options.minDate == 'object')
                this.minDate = moment(options.minDate);

            if (typeof options.maxDate == 'object')
                this.maxDate = moment(options.maxDate);

            //plus
            if(typeof options.rangestype == "string"){
                this.rangestype = options.rangestype;
            }
            if(typeof options.showTimeTips == "boolean"){
                this.showTimeTips = options.showTimeTips;
            }

            if(typeof options.useRecent == "boolean"){
                this.useRecent = options.useRecent;
            }
            if(this.useRecent){
                this.recentSelection = {sLength: 5, selections: [], current: -1};
            }

            if(typeof options.useHistory == "boolean"){
                this.useHistory = options.useHistory;
            }
            if(this.useHistory){
                this.historySelection = {sLength: 8, selections: {}, count: 0};
            }
            if(typeof options.useSecond == "boolean"){
                this.useSecond = options.useSecond;
            }

            if (typeof options.ranges == 'object') {
                this.rangesOptions = true;//plus
                for (var range in options.ranges) {

                    var start = moment(options.ranges[range][0]);
                    var end = moment(options.ranges[range][1]);

                    // If we have a min/max date set, bound this range
                    // to it, but only if it would otherwise fall
                    // outside of the min/max.
                    if (this.minDate && start.isBefore(this.minDate))
                        start = moment(this.minDate);

                    if (this.maxDate && end.isAfter(this.maxDate))
                        end = moment(this.maxDate);

                    // If the end of the range is before the minimum (if min is set) OR
                    // the start of the range is after the max (also if set) don't display this
                    // range option.
                    if ((this.minDate && end.isBefore(this.minDate)) || (this.maxDate && start.isAfter(this.maxDate))) {
                        continue;
                    }

                    this.ranges[range] = [start, end];
                }

                var list = '<ul>';
                for (var range in this.ranges) {
                    list += '<li>' + range + '</li>';
                }
                if(this.showCustom){
                    list += '<li class="ez-daterangepicker-customRange">' + this.locale.customRangeLabel + '</li>';
                }
                if(this.useHistory && this.showCustom){
                    list += '<li class="ez-daterangepicker-history disabled">' + this.locale.historyRangeLabel + '</li>';
                }
                list += '</ul>';
                this.container.find('.ranges').prepend(list);
            }else{
                this.updateRanges();
                var list = '<ul>';
                for (var range in this.ranges) {
                    list += '<li>' + range + '</li>';
                }
                if(this.showCustom){
                    list += '<li class="ez-daterangepicker-customRange">' + this.locale.customRangeLabel + '</li>';
                }
                if(this.useHistory && this.showCustom){
                    list += '<li class="ez-daterangepicker-history disabled">' + this.locale.historyRangeLabel + '</li>';
                }
                list += '</ul>';
                this.container.find('.ranges').prepend(list);
            }

            if (typeof options.dateLimit == 'object')
                this.dateLimit = options.dateLimit;

            // update day names order to firstDay
            if (typeof options.locale == 'object') {
                if (typeof options.locale.firstDay == 'number') {
                    this.locale.firstDay = options.locale.firstDay;
                    var iterator = options.locale.firstDay;
                    while (iterator > 0) {
                        this.locale.daysOfWeek.push(this.locale.daysOfWeek.shift());
                        iterator--;
                    }
                }
            }

            if (typeof options.opens == 'string')
                this.opens = options.opens;

            if (typeof options.showWeekNumbers == 'boolean') {
                this.showWeekNumbers = options.showWeekNumbers;
            }

            if (typeof options.buttonClasses == 'string') {
                this.buttonClasses = [options.buttonClasses];
            }

            if (typeof options.buttonClasses == 'object') {
                this.buttonClasses = options.buttonClasses;
            }

            if (typeof options.showDropdowns == 'boolean') {
                this.showDropdowns = options.showDropdowns;
            }

            if (typeof options.timePicker == 'boolean') {
                this.timePicker = options.timePicker;
            }

            if (typeof options.timePickerIncrement == 'number') {
                this.timePickerIncrement = options.timePickerIncrement;
            }

            if (typeof options.timePicker12Hour == 'boolean') {
                this.timePicker12Hour = options.timePicker12Hour;
            }

        }

        if(this.showExpandTools){
            if(this.showTimeTips){
                this.expandtools = this.element.wrap(_timearea).before(_timeexpand_left).after(_timeexpand_right).wrap(_timearea);
                this.element.before(_timetipsdom);
            }else{
                this.expandtools = this.element.wrap(_timearea).before(_timeexpand_left).after(_timeexpand_right);
            }
            $(".time-expand-tools").find('a.btn').on('click', $.proxy(this.timeExpand, this));
        }else{
            if(this.showTimeTips){
                this.element.wrap(_timearea);
                this.element.before(_timetipsdom);
            }
        }

        if(this.useRecent){
            this.timerecentarea = $(_timerecent);
            if(!this.showTimeTips && !this.showExpandTools){
                this.element.wrap(_timearea);
                this.element.after(this.timerecentarea);
            }else{
                this.element.after(this.timerecentarea);
            }
            this.element.addClass('use-recent');
            this.timerecentarea.find('a.btn').on('click', $.proxy(this.doRecent, this));
        }

        $(".datetime-icon-container").on('click', $.proxy(this.show, this));

        if (!this.timePicker) {
            this.startDate = this.startDate.startOf('day');
            this.endDate = this.endDate.startOf('day');
        }

        //apply CSS classes to buttons
        var c = this.container;
        $.each(this.buttonClasses, function (idx, val) {
            c.find('button').addClass(val);
        });

        if (this.opens == 'right') {
            //swap calendar positions
            var left = this.container.find('.calendar.left');
            var right = this.container.find('.calendar.right');
            left.removeClass('left').addClass('right');
            right.removeClass('right').addClass('left');
        }

        //plus
        /*if (typeof options == 'undefined' || typeof options.ranges == 'undefined') {
         this.container.find('.calendar').show();
         this.move();
         }*/
        //plus
        if(this.rangesOptions && typeof options.ranges == 'undefined'){
            this._showCalendar();
        }
        if(typeof options.startDate != 'undefined' && typeof options.endDate != 'undefined'){
            this._showCalendar();
        }

        if (typeof options.callback == 'function')
            this.cb = options.callback;

        this.container.addClass('opens' + this.opens);

        //try parse date if in text input
        if (!hasOptions || (typeof options.startDate == 'undefined' && typeof options.endDate == 'undefined')) {
            if ($(this.element).is('input[type=text]')) {
                var val = $(this.element).val();
                var split = val.split(this.separator);
                var start, end;
                if (split.length == 2) {
                    start = moment(split[0], this.format);
                    end = moment(split[1], this.format);
                }
                if (start != null && end != null) {
                    this.startDate = start;
                    this.endDate = end;
                }
            }
        }

        //state
        this.oldStartDate = this.startDate;
        this.oldEndDate = this.endDate;

        this.leftCalendar = {
            month: moment([this.startDate.year(), this.startDate.month(), 1, this.startDate.hour(), this.startDate.minute()]),
            calendar: []
        };

        this.rightCalendar = {
            month: moment([this.endDate.year(), this.endDate.month(), 1, this.endDate.hour(), this.endDate.minute()]),
            calendar: []
        };

        //event listeners
        this.container.on('mousedown', $.proxy(this.mousedown, this));
        this.container.find('.calendar').on('click', '.prev', $.proxy(this.clickPrev, this));
        this.container.find('.calendar').on('click', '.next', $.proxy(this.clickNext, this));
        this.container.find('.ranges').on('click', 'button.applyBtn', $.proxy(this.clickApply, this));
        this.container.find('.ranges').on('click', 'button.cancelBtn', $.proxy(this.clickCancel, this));

        this.container.find('.calendar').on('click', 'td.available', $.proxy(this.clickDate, this));
        this.container.find('.calendar').on('mouseenter', 'td.available', $.proxy(this.enterDate, this));
        this.container.find('.calendar').on('mouseleave', 'td.available', $.proxy(this.updateView, this));

        this.container.find('.ranges').on('click', 'li', $.proxy(this.clickRange, this));
        this.container.find('.ranges').on('mouseenter', 'li', $.proxy(this.enterRange, this));
        this.container.find('.ranges').on('mouseleave', 'li', $.proxy(this.leaveRange, this));
        this.container.find('.ranges').on('mouseleave', 'li', $.proxy(this.updateView, this));

        this.container.find('.calendar').on('change', 'select.yearselect', $.proxy(this.updateYear, this));
        this.container.find('.calendar').on('change', 'select.monthselect', $.proxy(this.updateMonth, this));

        this.container.find('.history-selections').on('click','li', $.proxy(this.doHistory,this));

        //need to ...
        //this.container.find('.calendar').on('change', 'select.hourselect', $.proxy(this.updateTime, this));
        //this.container.find('.calendar').on('change', 'select.minuteselect', $.proxy(this.updateTime, this));
        //this.container.find('.calendar').on('change', 'select.ampmselect', $.proxy(this.updateTime, this));

        this.element.on('keyup', $.proxy(this.updateFromControl, this));

        this.updateView();

        if(this.selectRangesLabel != "" && typeof options.startDate == "undefined" && typeof options.endDate == "undefined"){
            this._update("update",this.selectRangesLabel);
        }else if((this.selectRangesLabel == "" || this.selectRangesLabel == this.locale.customRangeLabel) && typeof options.startDate != "undefined" && typeof options.endDate != "undefined"){
            var sD = this.startDate.toDate();
            var eD = this.endDate.toDate();
            this._update("update",sD,eD);
        }else{
            this.updateCalendars();
        }

        this._setSlider();

        this.setHistoryFromLocalStorage();
    }

    var PROP_NAME = "daterangepicker";
    
    function ResetMomentEnd (inStartMoment,inEndMoment) {
        if (inEndMoment.isBefore(inStartMoment)) {
            inEndMoment = moment(inStartMoment)
        }
        return inEndMoment
    }


    $.extend(DateRangePicker.prototype, {

        constructor: DateRangePicker,
        inst: null,
        hour_slider_start: null,
        hour_slider_end: null,
        minute_slider_start: null,
        minute_slider_end: null,
        second_slider_start: null,
        second_slider_end: null,
        millisec_slider_start: null,
        millisec_slider_end: null,
        slider_text_start: null,
        slider_text_end: null,
        timezone_select: null,
        hour: 0,
        minute: 0,
        second: 0,
        millisec: 0,
        timezone: '+0000',
        hourMinOriginal: null,
        minuteMinOriginal: null,
        secondMinOriginal: null,
        millisecMinOriginal: null,
        hourMaxOriginal: null,
        minuteMaxOriginal: null,
        secondMaxOriginal: null,
        millisecMaxOriginal: null,
        ampm: '',
        formattedDate: '',
        formattedTime: '',
        formattedDateTime: '',
        timezoneList: null,

        mousedown: function (e) {
            e.stopPropagation();
        },

        updateRanges: function(){
            var _ranges;

            if (this.rangesOptions){
                return;
            }else if(this.rangestype == "type_0"){
                this.ranges = {};
            }else if(this.rangestype == "type_1"){
                _ranges = {
                    '最近5分钟': [moment().subtract('minutes', 5+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)],
                    '最近10分钟': [moment().subtract('minutes', 10+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)],
                    '最近15分钟': [moment().subtract('minutes', 15+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)],
                    '最近30分钟': [moment().subtract('minutes', 30+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)],
                    '最近1小时': [moment().subtract('minutes', 60+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)],
                    '最近4小时': [moment().subtract('minutes', 240+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)]
                };
            }else if(this.rangestype == "type_2"){
                _ranges = {
                    '最近30分钟': [moment().subtract('minutes', 30+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)],
                    '最近1小时': [moment().subtract('minutes', 60+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)],
                    '最近4小时': [moment().subtract('minutes', 240+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)]
                };
            }else if(this.rangestype == "type_3"){
                _ranges = {
                    '最近5分钟': [moment().subtract('minutes', 5+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)],
                    '最近10分钟': [moment().subtract('minutes', 10+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)],
                    '最近15分钟': [moment().subtract('minutes', 15+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)],
                    '最近30分钟': [moment().subtract('minutes', 30+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)],
                    '最近1小时': [moment().subtract('minutes', 60+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)],
                    '最近4小时': [moment().subtract('minutes', 240+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)],
                    '最近8小时': [moment().subtract('minutes', 480+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)]
                };
            }else if(this.rangestype == "type_4"){//针对业务路径详情
                _ranges = {
                    '最近1分钟': [moment().subtract('minutes', 1+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)],
                    '最近5分钟': [moment().subtract('minutes', 5+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)],
                    '最近10分钟': [moment().subtract('minutes', 10+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)],
                    '最近15分钟': [moment().subtract('minutes', 15+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)],
                    '最近30分钟': [moment().subtract('minutes', 30+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)],
                    '最近1小时': [moment().subtract('minutes', 60+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)],
                    '最近4小时': [moment().subtract('minutes', 240+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)]
                	
                };
            }else if(this.rangestype == "type_5"){//针对报表数据
                _ranges = {
                    //'最近12小时': [moment().subtract('minutes', 720), moment().subtract('minutes', 0)],
                    '最近1天': [moment().subtract('minutes', 1440), moment().subtract('minutes', 0)],
                    '最近1星期': [moment().subtract('minutes', (1440 * 7)), moment().subtract('minutes', 0)],
                    '最近1个月': [moment().subtract('minutes', (1440 * 31)), moment().subtract('minutes', 0)],
                    '最近1个季度': [moment().subtract('minutes', (1440 * 93)), moment().subtract('minutes', 0)],
                    '全部': [moment().subtract('minutes', (1440 * 365)), moment().subtract('minutes', 0)]
                };
            }else if(this.rangestype == "type_6"){//业务、渠道
                _ranges = {
                	'当天': [moment().startOf('day'), ResetMomentEnd(moment().startOf('day'),moment().subtract('minutes', this.eztimeDelay))],
                    '最近1分钟': [moment().subtract('minutes', 1+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)],
                    '最近5分钟': [moment().subtract('minutes', 5+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)],
                    '最近10分钟': [moment().subtract('minutes', 10+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)],
                    '最近15分钟': [moment().subtract('minutes', 15+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)],
                    '最近30分钟': [moment().subtract('minutes', 30+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)],
                    '最近1小时': [moment().subtract('minutes', 60+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)],
                    '最近4小时': [moment().subtract('minutes', 240+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)]
                	
                };
            }else {
                _ranges = {
                    '最近1小时': [moment().subtract('minutes', 60+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)],
                    '最近4小时': [moment().subtract('minutes', 240+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)],
                    '最近8小时': [moment().subtract('minutes', 480+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)],
                    '最近12小时': [moment().subtract('minutes', 720+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)],
                    '最近1天': [moment().subtract('minutes', 1440+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)],
                    '最近3天': [moment().subtract('minutes', 4320+this.eztimeDelay), moment().subtract('minutes', this.eztimeDelay)]
                };
            }
            for (var range in _ranges) {

                var start = moment(_ranges[range][0]);
                var end = moment(_ranges[range][1]);

                // If we have a min/max date set, bound this range
                // to it, but only if it would otherwise fall
                // outside of the min/max.
                if (this.minDate && start.isBefore(this.minDate))
                    start = moment(this.minDate);

                if (this.maxDate && end.isAfter(this.maxDate))
                    end = moment(this.maxDate);
                
                // If the end of the range is before the minimum (if min is set) OR
                // the start of the range is after the max (also if set) don't display this
                // range option.
                if ((this.minDate && end.isBefore(this.minDate)) || (this.maxDate && start.isAfter(this.maxDate))) {
                    continue;
                }

                this.ranges[range] = [start, end];
            }
        },

        updateView: function () {
            this.leftCalendar.month.month(this.startDate.month()).year(this.startDate.year());
            this.rightCalendar.month.month(this.endDate.month()).year(this.endDate.year());

            this.container.find('input[name=daterangepicker_start]').val(this.startDate.format(this.format));
            this.container.find('input[name=daterangepicker_end]').val(this.endDate.format(this.format));

            if (this.startDate.isBefore(this.endDate)) {
                this.container.find('button.applyBtn').removeAttr('disabled');
            } else {
                this.container.find('button.applyBtn').attr('disabled', 'disabled');
            }
        },

        updateFromControl: function () {
            if (!this.element.is('input')) return;
            if (!this.element.val().length) return;

            var dateString = this.element.val().split(this.separator);
            var start = moment(dateString[0], this.format);
            var end = moment(dateString[1], this.format);

            if (start == null || end == null) return;
            if (end.isBefore(start)) return;

            this.startDate = start;
            this.endDate = end;

            this.updateView();
            this.cb(this.startDate, this.endDate);
            this.updateCalendars();
        },

        notify: function () {
            this.updateView();
            this.cb(this.startDate, this.endDate);
        },

        move: function () {
            var minWidth = $(this.container).find('.ranges').outerWidth(true);
            if ($(this.container).find('.calendar').is(':visible')) {
                minWidth += $(this.container).find('.calendar').outerWidth(true) * 2;
            }
            if ($(this.container).find('.history').is(':visible')) {
                minWidth += $(this.container).find('.history').outerWidth(true);
            }
            var outerContainerTop = this.outerContainerDom.length > 0? this.outerContainerDom.offset().top : 0;
            var outerContainerScrollTop = this.outerContainerDom.length > 0? this.outerContainerDom.scrollTop() : 0;

            if (this.opens == 'left') {
                this.container.css({
                    top: this.element.offset().top + this.element.outerHeight() - outerContainerTop + outerContainerScrollTop,
                    right: $(window).width() - this.element.offset().left - this.element.outerWidth(),
                    left: 'auto',
                    'min-width': minWidth
                });
                if (this.container.offset().left < 0) {
                    this.container.css({
                        right: 'auto',
                        left: 9
                    });
                }
            } else {
                this.container.css({
                    top: this.element.offset().top + this.element.outerHeight() - outerContainerTop + outerContainerScrollTop,
                    left: this.element.offset().left,
                    right: 'auto',
                    'min-width': minWidth
                });
                if (this.container.offset().left + this.container.outerWidth() > $(window).width()) {
                    this.container.css({
                        left: 'auto',
                        right: 0
                    });
                }
            }
        },

        show: function (e) {
            this.updateRanges();
            this.container.show();
            this.move();
            this.shown = true;
            if (e) {
                e.stopPropagation();
                e.preventDefault();
            }

            this.oldStartDate = this.startDate;
            this.oldEndDate = this.endDate;

            $(document).on('mousedown', $.proxy(this.hide, this));
            this.element.trigger('shown', {target: e.target, picker: this});
        },

        hide: function (e) {
            if(e){
                if(!$(e.srcElement).parents().hasClass('daterangepicker')){
                    this.startDate = this.oldStartDate;
                    this.endDate = this.oldEndDate;
                };
            };
            this.shown = false;
            this.container.hide();
            this.container.find(".history").hide();
            this.updateCalendars();
            this.updateRangeList();

            if (!this.startDate.isSame(this.oldStartDate) || !this.endDate.isSame(this.oldEndDate))
                this.notify();

            $(document).off('mousedown', this.hide);
            this.element.trigger('hidden', { picker: this });
        },

        setSlider: function(){
            if (this.timePicker) {
                var o = this;
                tp_inst = this,
                    hourMax = parseInt((o.hourMax - ((o.hourMax - o.hourMin) % o.stepHour)) ,10),
                    minMax  = parseInt((o.minuteMax - ((o.minuteMax - o.minuteMin) % o.stepMinute)) ,10),
                    secMax  = parseInt((o.secondMax - ((o.secondMax - o.secondMin) % o.stepSecond)) ,10),
                    millisecMax  = parseInt((o.millisecMax - ((o.millisecMax - o.millisecMin) % o.stepMillisec)) ,10),
                    //dp_id = this.inst.id.toString().replace(/([^A-Za-z0-9_])/g, '');
                    dp_id = "";
                var noDisplay = ' style="display:none;"';
                var timepicker_html = '<div class="ui-timepicker-div" id="ui-timepicker-div-' + dp_id + '"><dl>' +
                        '<dt class="ui_tpicker_time_label" id="ui_tpicker_time_label_' + dp_id + '"' +
                        ((o.showTime) ? '' : noDisplay) + '>' + o.timeText + '</dt>' +
                            // '<dd class="ui_tpicker_time" id="ui_tpicker_time_' + dp_id + '"' +
                            // ((o.showTime) ? '' : noDisplay) + '></dd>' +
                        '<div class="ui_tpicker_time_container"><input class="ui_tpicker_time" type="time" id="ui_tpicker_time_' + dp_id + '"' +
                        ((o.showTime) ? '' : noDisplay) + '/><i class="icon-edit tpicker_icon"></i></div>' +
                        '<dt class="ui_tpicker_hour_label" id="ui_tpicker_hour_label_' + dp_id + '"' +
                        ((o.showHour) ? '' : noDisplay) + '>' + o.hourText + '</dt>',
                    hourGridSize = 0,
                    minuteGridSize = 0,
                    secondGridSize = 0,
                    millisecGridSize = 0,
                    size = null;

                // Hours
                timepicker_html += '<dd class="ui_tpicker_hour"><div id="ui_tpicker_hour_' + dp_id + '"' +
                    ((o.showHour) ? '' : noDisplay) + '></div>';
                if (o.showHour && o.hourGrid > 0) {
                    timepicker_html += '<div style="padding-left: 1px"><table class="ui-tpicker-grid-label"><tr>';

                    for (var h = o.hourMin; h <= hourMax; h += parseInt(o.hourGrid,10)) {
                        hourGridSize++;
                        var tmph = (o.ampm && h > 12) ? h-12 : h;
                        if (tmph < 10) tmph = '0' + tmph;
                        if (o.ampm) {
                            if (h == 0) tmph = 12 +'a';
                            else if (h < 12) tmph += 'a';
                            else tmph += 'p';
                        }
                        timepicker_html += '<td>' + tmph + '</td>';
                    }

                    timepicker_html += '</tr></table></div>';
                }
                timepicker_html += '</dd>';

                // Minutes
                timepicker_html += '<dt class="ui_tpicker_minute_label" id="ui_tpicker_minute_label_' + dp_id + '"' +
                    ((o.showMinute) ? '' : noDisplay) + '>' + o.minuteText + '</dt>'+
                    '<dd class="ui_tpicker_minute"><div id="ui_tpicker_minute_' + dp_id + '"' +
                    ((o.showMinute) ? '' : noDisplay) + '></div>';

                if (o.showMinute && o.minuteGrid > 0) {
                    timepicker_html += '<div style="padding-left: 1px"><table class="ui-tpicker-grid-label"><tr>';

                    for (var m = o.minuteMin; m <= minMax; m += parseInt(o.minuteGrid,10)) {
                        minuteGridSize++;
                        timepicker_html += '<td>' + ((m < 10) ? '0' : '') + m + '</td>';
                    }

                    timepicker_html += '</tr></table></div>';
                }
                timepicker_html += '</dd>';

                // Seconds
                timepicker_html += '<dt class="ui_tpicker_second_label" id="ui_tpicker_second_label_' + dp_id + '"' +
                    ((o.showSecond) ? '' : noDisplay) + '>' + o.secondText + '</dt>'+
                    '<dd class="ui_tpicker_second"><div id="ui_tpicker_second_' + dp_id + '"'+
                    ((o.showSecond) ? '' : noDisplay) + '></div>';

                if (o.showSecond && o.secondGrid > 0) {
                    timepicker_html += '<div style="padding-left: 1px"><table><tr>';

                    for (var s = o.secondMin; s <= secMax; s += parseInt(o.secondGrid,10)) {
                        secondGridSize++;
                        timepicker_html += '<td>' + ((s < 10) ? '0' : '') + s + '</td>';
                    }

                    timepicker_html += '</tr></table></div>';
                }
                timepicker_html += '</dd>';

                // Milliseconds
                timepicker_html += '<dt class="ui_tpicker_millisec_label" id="ui_tpicker_millisec_label_' + dp_id + '"' +
                    ((o.showMillisec) ? '' : noDisplay) + '>' + o.millisecText + '</dt>'+
                    '<dd class="ui_tpicker_millisec"><div id="ui_tpicker_millisec_' + dp_id + '"'+
                    ((o.showMillisec) ? '' : noDisplay) + '></div>';

                if (o.showMillisec && o.millisecGrid > 0) {
                    timepicker_html += '<div style="padding-left: 1px"><table><tr>';

                    for (var l = o.millisecMin; l <= millisecMax; l += parseInt(o.millisecGrid,10)) {
                        millisecGridSize++;
                        timepicker_html += '<td>' + ((l < 10) ? '0' : '') + l + '</td>';
                    }

                    timepicker_html += '</tr></table></div>';
                }
                timepicker_html += '</dd>';

                // Timezone
                timepicker_html += '<dt class="ui_tpicker_timezone_label" id="ui_tpicker_timezone_label_' + dp_id + '"' +
                    ((o.showTimezone) ? '' : noDisplay) + '>' + o.timezoneText + '</dt>';
                timepicker_html += '<dd class="ui_tpicker_timezone" id="ui_tpicker_timezone_' + dp_id + '"'	+
                    ((o.showTimezone) ? '' : noDisplay) + '></dd>';

                timepicker_html += '</dl></div>';

                this.container.find('.calendar.left').append(timepicker_html);
                this.container.find('.calendar.right').append(timepicker_html);

                var $tp_start =  this.container.find('.calendar.left');
                var $tp_end =  this.container.find('.calendar.right');
                var o = this;
                var tp_inst = this;
                var dp_id ="";
                var start_hour,start_minute,start_second,end_hour,end_minute,end_second;
                var start = this.startDate;
                var end = this.endDate;
                start_hour = start.hour();
                start_minute = start.minute();
                start_second = start.second();
                end_hour = end.hour();
                end_minute = end.minute();
                end_second = end.second();

                this.slider_text_start = $tp_start.find('#ui_tpicker_time_'+ dp_id);
                this.slider_text_end = $tp_end.find('#ui_tpicker_time_'+ dp_id);
                var s_text_start = "";
                var s_text_end = "";
                if(this.showHour && !this.showMinute){
                    s_text_start = start.format("HH");
                    s_text_end = end.format("HH");
                }else if(this.showMinute && !this.showSecond){
                    s_text_start = start.format("HH:mm");
                    s_text_end = end.format("HH:mm");
                }else if(this.showSecond){
                    s_text_start = start.format("HH:mm:ss");
                    s_text_end = end.format("HH:mm:ss");
                }
                // this.slider_text_start.text(s_text_start);
                // this.slider_text_end.text(s_text_end);

                this.slider_text_start.val(s_text_start);
                this.slider_text_end.val(s_text_end);

                this.hour_slider_start = $tp_start.find('#ui_tpicker_hour_'+ dp_id).slider({
                    orientation: "horizontal",
                    value: start_hour,
                    min: o.hourMin,
                    max: hourMax,
                    step: o.stepHour,
                    slide: function(event, ui) {
                        tp_inst.hour_slider_start.slider( "option", "value", ui.value);
                        tp_inst.updateTime(event);
                    }
                });

                this.minute_slider_start = $tp_start.find('#ui_tpicker_minute_'+ dp_id).slider({
                    orientation: "horizontal",
                    value: start_minute,
                    min: o.minuteMin,
                    max: minMax,
                    step: o.stepMinute,
                    slide: function(event, ui) {
                        tp_inst.minute_slider_start.slider( "option", "value", ui.value);
                        tp_inst.updateTime(event);
                    }
                });

                this.second_slider_start = $tp_start.find('#ui_tpicker_second_'+ dp_id).slider({
                    orientation: "horizontal",
                    value: start_second,
                    min: o.secondMin,
                    max: secMax,
                    step: o.stepSecond,
                    slide: function(event, ui) {
                        tp_inst.second_slider_start.slider( "option", "value", ui.value);
                        tp_inst.updateTime(event);
                    }
                });
                /*this.millisec_slider = $tp_start.find('#ui_tpicker_millisec_'+ dp_id).slider({
                 orientation: "horizontal",
                 value: this.millisec,
                 min: o.millisecMin,
                 max: millisecMax,
                 step: o.stepMillisec,
                 slide: function(event, ui) {
                 //tp_inst.millisec_slider.slider( "option", "value", ui.value);
                 tp_inst._onTimeChange(event);
                 }
                 });*/
                this.hour_slider_end = $tp_end.find('#ui_tpicker_hour_'+ dp_id).slider({
                    orientation: "horizontal",
                    value: end_hour,
                    min: o.hourMin,
                    max: hourMax,
                    step: o.stepHour,
                    slide: function(event, ui) {
                        tp_inst.hour_slider_end.slider( "option", "value", ui.value);
                        tp_inst.updateTime(event);
                    }
                });

                this.minute_slider_end = $tp_end.find('#ui_tpicker_minute_'+ dp_id).slider({
                    orientation: "horizontal",
                    value: end_minute,
                    min: o.minuteMin,
                    max: minMax,
                    step: o.stepMinute,
                    slide: function(event, ui) {
                        tp_inst.minute_slider_end.slider( "option", "value", ui.value);
                        tp_inst.updateTime(event);
                    }
                });

                this.second_slider_end = $tp_end.find('#ui_tpicker_second_'+ dp_id).slider({
                    orientation: "horizontal",
                    value: end_second,
                    min: o.secondMin,
                    max: secMax,
                    step: o.stepSecond,
                    slide: function(event, ui) {
                        tp_inst.second_slider_end.slider( "option", "value", ui.value);
                        tp_inst.updateTime(event);
                    }
                });
                /*this.millisec_slider = $tp_end.find('#ui_tpicker_millisec_'+ dp_id).slider({
                 orientation: "horizontal",
                 value: this.millisec,
                 min: o.millisecMin,
                 max: millisecMax,
                 step: o.stepMillisec,
                 slide: function(event, ui) {
                 //tp_inst.millisec_slider.slider( "option", "value", ui.value);
                 tp_inst._onTimeChange(event);
                 }
                 });*/

                var timeFormatCheck = "^(([0-1]?[0-9])|([2][0-3])):([0-5]?[0-9])$";

                this.slider_text_start.on('change', function(event) {
                    // event.preventDefault();
                    if($(this).val().search(timeFormatCheck) == -1){
                        $(this).val(tp_inst._getFormatTimeVal("start"));
                        return;
                    }
                    var _start = $(this).val().split(":");
                    tp_inst.hour_slider_start.slider("value", (_start[0]-0));
                    tp_inst.minute_slider_start.slider("value", (_start[1]-0));
                    tp_inst.updateTime(event);
                });

                this.slider_text_end.on('change', function(event) {
                    // event.preventDefault();
                    if($(this).val().search(timeFormatCheck) == -1){
                        $(this).val(tp_inst._getFormatTimeVal("end"));
                        return;
                    }
                    var _end = $(this).val().split(":");
                    tp_inst.hour_slider_end.slider("value", (_end[0]-0));
                    tp_inst.minute_slider_end.slider("value", (_end[1]-0));
                    tp_inst.updateTime(event);
                });
            }
        },

        _getFormatTimeVal: function(soe){
            var opt = {
                start: 'startDate',
                end: 'endDate'
            }
            if(opt[soe]){
                var tmpTime = this[opt[soe]];
                var tmpVal = "";
                if(this.showHour && !this.showMinute){
                    tmpVal = tmpTime.format("HH");
                }else if(this.showMinute && !this.showSecond){
                    tmpVal = tmpTime.format("HH:mm");
                }else if(this.showSecond){
                    tmpVal = tmpTime.format("HH:mm:ss");
                }
                return tmpVal;
            }else{
                return "00:00";
            }
        },

        updateSlider:function(){
            if(this.timePicker){
                var start = this.startDate;
                var end = this.endDate;
                var s_text_start = "";
                var s_text_end = "";
                if(this.showHour && !this.showMinute){
                    s_text_start = start.format("HH");
                    s_text_end = end.format("HH");
                }else if(this.showMinute && !this.showSecond){
                    s_text_start = start.format("HH:mm");
                    s_text_end = end.format("HH:mm");
                }else if(this.showSecond){
                    s_text_start = start.format("HH:mm:ss");
                    s_text_end = end.format("HH:mm:ss");
                }
                // this.slider_text_start.text(s_text_start);
                // this.slider_text_end.text(s_text_end);

                this.slider_text_start.val(s_text_start);
                this.slider_text_end.val(s_text_end);

                this.hour_slider_start.slider("value", start.hour());
                this.minute_slider_start.slider("value", start.minute());
                this.second_slider_start.slider("value", start.second());
                this.hour_slider_end.slider("value", end.hour());
                this.minute_slider_end.slider("value", end.minute());
                this.second_slider_end.slider("value", end.second());
            }
        },

        updateTimeLabel:function(){
            if(this.element.is('input')){
                if (this.selectRangesLabel == this.locale.customRangeLabel) {
                    this.element.val(this.startDate.format(this.format) + this.separator + this.endDate.format(this.format));
                }else{
                    this.element.val(this.selectRangesLabel);
                }
            }
        },

        enterRange: function (e) {
            var label = e.target.innerHTML;
            var tmpLi = $(e.target);
            if (label == this.locale.customRangeLabel) {

                //plus
                if(this.hovershowtime){
                    if(this.element.is('input')){
                        this.element.val("");
                    }else{
                        //this.element.text("");
                    }
                }
                if(!tmpLi.hasClass('active')){
                    if(this.menuHoverDelayTimer){
                        clearTimeout(this.menuHoverDelayTimer);
                    }
                    this.menuHoverDelayTimer = setTimeout(function(){
                        tmpLi.trigger('click');
                    },this.menuHoverDelay);
                }
                this.updateView();
            } else if(label == this.locale.historyRangeLabel){
                if(!tmpLi.hasClass('active')){
                    if(this.menuHoverDelayTimer){
                        clearTimeout(this.menuHoverDelayTimer);
                    }
                    this.menuHoverDelayTimer = setTimeout(function(){
                        tmpLi.trigger('click');
                    },this.menuHoverDelay);
                }
                this.updateView();
            } else {
                var dates = this.ranges[label];
                this.container.find('input[name=daterangepicker_start]').val(dates[0].format(this.format));
                this.container.find('input[name=daterangepicker_end]').val(dates[1].format(this.format));
                //plus
                if(this.hovershowtime){
                    if(this.element.is('input')){
                        this.element.val(dates[0].format(this.format)+" - "+dates[1].format(this.format));
                    }else{
                        this.element.text(dates[0].format(this.format)+" - "+dates[1].format(this.format));
                    }
                }
            }
        },

        leaveRange: function (e){
            if(this.menuHoverDelayTimer){
                clearTimeout(this.menuHoverDelayTimer);
            };
        },

        clickRange: function (e) {
            if(this.menuHoverDelayTimer){
                clearTimeout(this.menuHoverDelayTimer);
            };
            var label = e.target.innerHTML;
            if (label == this.locale.customRangeLabel) {
                this.updateCalendars();
                this.updateSlider();
                this.container.find('.history').hide();
                this.container.find('.ranges li').removeClass('active');//plus
                $(e.target).addClass('active');//plus
                this._showCalendar();
            }else if(label == this.locale.historyRangeLabel){
                if($(e.target).hasClass('disabled')){
                    return;
                }
                this.container.find('.ranges li').removeClass('active');//plus
                $(e.target).addClass('active');
                this.container.find('.calendar').hide();
                this.container.find('.range_inputs').hide();//plus
                this.container.find('.ranges').css("margin-bottom","0px");//plus
                this.container.find('.history').show();
                this.move();
            } else {
                this.selectRangesLabel = label;
                var dates = this.ranges[label];

                this.startDate = dates[0];
                this.endDate = dates[1];

                if (!this.timePicker) {
                    this.startDate.startOf('day');
                    this.endDate.startOf('day');
                }

                this.leftCalendar.month.month(this.startDate.month()).year(this.startDate.year()).hour(this.startDate.hour()).minute(this.startDate.minute());
                this.rightCalendar.month.month(this.endDate.month()).year(this.endDate.year()).hour(this.endDate.hour()).minute(this.endDate.minute());
                this.updateCalendars();
                this.updateRangeList();

                this.updateTimeLabel();
                this._updateTimeTips(this.selectRangesLabel);

                this._recordSelection(this.selectRangesLabel);
                this._recordHistory(this.selectRangesLabel);

                this.container.find('.calendar').hide();
                this.container.find('.range_inputs').hide();//plus
                this.container.find('.ranges').css("margin-bottom","0px");//plus
                this.container.find('.history').hide();
                this.hide();
                jQuery.event.trigger("eztimeupdate",[this._getStartDate(),this._getEndDate(),this.selectRangesLabel]);
            }
        },

        clickPrev: function (e) {
            var cal = $(e.target).parents('.calendar');
            if (cal.hasClass('left')) {
                this.leftCalendar.month.subtract('month', 1);
            } else {
                this.rightCalendar.month.subtract('month', 1);
            }
            this.updateCalendars();
        },

        clickNext: function (e) {
            var cal = $(e.target).parents('.calendar');
            if (cal.hasClass('left')) {
                this.leftCalendar.month.add('month', 1);
            } else {
                this.rightCalendar.month.add('month', 1);
            }
            this.updateCalendars();
        },

        enterDate: function (e) {

            var title = $(e.target).attr('data-title');
            var row = title.substr(1, 1);
            var col = title.substr(3, 1);
            var cal = $(e.target).parents('.calendar');

            if (cal.hasClass('left')) {
                this.container.find('input[name=daterangepicker_start]').val(this.leftCalendar.calendar[row][col].format(this.format));
            } else {
                this.container.find('input[name=daterangepicker_end]').val(this.rightCalendar.calendar[row][col].format(this.format));
            }

        },

        clickDate: function (e) {
            var title = $(e.target).attr('data-title');
            var row = title.substr(1, 1);
            var col = title.substr(3, 1);
            var cal = $(e.target).parents('.calendar');

            if (cal.hasClass('left')) {
                var startDate = this.leftCalendar.calendar[row][col];
                var endDate = this.endDate;
                if (typeof this.dateLimit == 'object') {
                    var maxDate = moment(startDate).add(this.dateLimit).startOf('day');
                    if (endDate.isAfter(maxDate)) {
                        endDate = maxDate;
                    }
                }
            } else {
                var startDate = this.startDate;
                var endDate = this.rightCalendar.calendar[row][col];
                if (typeof this.dateLimit == 'object') {
                    var minDate = moment(endDate).subtract(this.dateLimit).startOf('day');
                    if (startDate.isBefore(minDate)) {
                        startDate = minDate;
                    }
                }
            }

            cal.find('td').removeClass('active');

            if (startDate.isSame(endDate) || startDate.isBefore(endDate)) {
                $(e.target).addClass('active');
                this.startDate = startDate;
                this.endDate = endDate;
            } else if (startDate.isAfter(endDate)) {
                $(e.target).addClass('active');
                this.startDate = startDate;
                var tmpOldEndDate = {
                    'hour': this.endDate.hour(),
                    'minute': this.endDate.minute(),
                    'second': this.endDate.second()
                }
                this.endDate = moment(startDate).add('day', 1).startOf('day');
                this.endDate.hour(tmpOldEndDate.hour);
                this.endDate.minute(tmpOldEndDate.minute);
                this.endDate.second(tmpOldEndDate.second);
            }

            this.leftCalendar.month.month(this.startDate.month()).year(this.startDate.year());
            this.rightCalendar.month.month(this.endDate.month()).year(this.endDate.year());
            this.updateSlider();
            this.updateCalendars();
        },

        clickApply: function (e) {
//            if (this.element.is('input'))
//                this.element.val(this.startDate.format(this.format) + this.separator + this.endDate.format(this.format));
            this.selectRangesLabel = this.locale.customRangeLabel;
            this.updateTimeLabel();
            this.hide();
            this._recordSelection(this.startDate.format(this.format) + this.separator + this.endDate.format(this.format));
            this._recordHistory(this.startDate.format(this.format) + this.separator + this.endDate.format(this.format));
            this._updateTimeTips(this.selectRangesLabel);
            jQuery.event.trigger("eztimeupdate",[this._getStartDate(true),this._getEndDate(true),this.selectRangesLabel]);
        },

        clickCancel: function (e) {
            this.startDate = this.oldStartDate;
            this.endDate = this.oldEndDate;
            this.updateView();
            this.updateCalendars();
            this.updateRangeList();
            this.hide();
        },

        updateYear: function (e) {
            var year = parseInt($(e.target).val());
            var isLeft = $(e.target).closest('.calendar').hasClass('left');

            if (isLeft) {
                this.leftCalendar.month.month(this.startDate.month()).year(year);
            } else {
                this.rightCalendar.month.month(this.endDate.month()).year(year);
            }

            this.updateCalendars();
        },

        updateMonth: function (e) {
            var month = parseInt($(e.target).val());
            var isLeft = $(e.target).closest('.calendar').hasClass('left');

            if (isLeft) {
                this.leftCalendar.month.month(month).year(this.startDate.year());
            } else {
                this.rightCalendar.month.month(month).year(this.endDate.year());
            }
            this.updateCalendars();
        },

        updateTime: function(e) {

            var isLeft = $(e.target).closest('.calendar').hasClass('left');
            var cal = this.container.find('.calendar.left');
            var hour = (this.hour_slider_start) ? this.hour_slider_start.slider('value') : false,
                minute = (this.minute_slider_start) ? this.minute_slider_start.slider('value') : false,
                second = (this.second_slider_start) ? this.second_slider_start.slider('value') : false;
            if (!isLeft){
                cal = this.container.find('.calendar.right');
                hour = (this.hour_slider_end) ? this.hour_slider_end.slider('value') : false,
                    minute = (this.minute_slider_end) ? this.minute_slider_end.slider('value') : false,
                    second = (this.second_slider_end) ? this.second_slider_end.slider('value') : false;
            }


            //need to ...

            var o = this;

            if (typeof(hour) == 'object') hour = false;
            if (typeof(minute) == 'object') minute = false;
            if (typeof(second) == 'object') second = false;


            /*if (hour !== false) hour = parseInt(hour,10);
             if (minute !== false) minute = parseInt(minute,10);
             if (second !== false) second = parseInt(second,10);
             if (millisec !== false) millisec = parseInt(millisec,10);*/

            /*var ampm = o[hour < 12 ? 'amNames' : 'pmNames'][0];

             var hour = parseInt(cal.find('.hourselect').val());
             var minute = parseInt(cal.find('.minuteselect').val());

             if (this.timePicker12Hour) {
             var ampm = cal.find('.ampmselect').val();
             if (ampm == 'PM' && hour < 12)
             hour += 12;
             }*/

            var tmp_time = moment().hour(hour).minute(minute).second(second);
            var s_text = "";
            if(this.showHour && !this.showMinute){
                s_text = tmp_time.format("HH");
            }else if(this.showMinute && !this.showSecond){
                s_text = tmp_time.format("HH:mm");
            }else if(this.showSecond){
                s_text = tmp_time.format("HH:mm:ss");
            }

            if (isLeft) {
                var start = this.startDate;
                start.hour(hour);
                start.minute(minute);
                start.second(second);
                this.startDate = start;
                this.leftCalendar.month.hour(hour).minute(minute).second(second);
                // this.slider_text_start.text(s_text);
                this.slider_text_start.val(s_text);
            } else {
                var end = this.endDate;
                end.hour(hour);
                end.minute(minute);
                end.second(second);
                this.endDate = end;
                this.rightCalendar.month.hour(hour).minute(minute).second(second);
                // this.slider_text_end.text(s_text);
                this.slider_text_end.val(s_text);
            }
            this.updateView();
            this.updateCalendars();

        },

        updateRangeList: function(){
            this.container.find('.ranges li').removeClass('active');
            var customRange = true;
            var i = 0;
            for (var range in this.ranges) {
                if(this.selectRangesLabel == range){
                    customRange = false;
                    this.container.find('.ranges li:eq(' + i + ')').addClass('active');
                    this.container.find('.calendar').hide();
                    this.container.find('.range_inputs').hide();
                    this.container.find('.ranges').css("margin-bottom","0px");
                }
                // if (this.timePicker) {
                //     if (this.startDate.isSame(this.ranges[range][0]) && this.endDate.isSame(this.ranges[range][1])) {
                //         customRange = false;
                //         this.container.find('.ranges li:eq(' + i + ')').addClass('active');
                //     }
                // } else {
                //     //ignore times when comparing dates if time picker is not enabled
                //     if (this.startDate.format('YYYY-MM-DD') == this.ranges[range][0].format('YYYY-MM-DD') && this.endDate.format('YYYY-MM-DD') == this.ranges[range][1].format('YYYY-MM-DD')) {
                //         customRange = false;
                //         this.container.find('.ranges li:eq(' + i + ')').addClass('active');
                //     }
                // }
                i++;
            }
            if (customRange){
                this.container.find('.ranges li.ez-daterangepicker-customRange').addClass('active');
                this._showCalendar();
            }
        },

        updateCalendars: function () {
            this.leftCalendar.calendar = this.buildCalendar(this.leftCalendar.month.month(), this.leftCalendar.month.year(), this.leftCalendar.month.hour(), this.leftCalendar.month.minute(), 'left');
            this.rightCalendar.calendar = this.buildCalendar(this.rightCalendar.month.month(), this.rightCalendar.month.year(), this.rightCalendar.month.hour(), this.rightCalendar.month.minute(), 'right');
            this.container.find('.calendar.left > .calendar-date').html(this.renderCalendar(this.leftCalendar.calendar, this.startDate, this.minDate, this.maxDate));
            this.container.find('.calendar.right > .calendar-date').html(this.renderCalendar(this.rightCalendar.calendar, this.endDate, this.startDate, this.maxDate));
        },

        buildCalendar: function (month, year, hour, minute, side) {

            var firstDay = moment([year, month, 1]);
            var lastMonth = moment(firstDay).subtract('month', 1).month();
            var lastYear = moment(firstDay).subtract('month', 1).year();

            var daysInLastMonth = moment([lastYear, lastMonth]).daysInMonth();

            var dayOfWeek = firstDay.day();

            //initialize a 6 rows x 7 columns array for the calendar
            var calendar = [];
            for (var i = 0; i < 6; i++) {
                calendar[i] = [];
            }

            //populate the calendar with date objects
            var startDay = daysInLastMonth - dayOfWeek + this.locale.firstDay + 1;
            if (startDay > daysInLastMonth)
                startDay -= 7;

            if (dayOfWeek == this.locale.firstDay)
                startDay = daysInLastMonth - 6;

            var curDate = moment([lastYear, lastMonth, startDay, hour, minute]);
            for (var i = 0, col = 0, row = 0; i < 42; i++, col++, curDate = moment(curDate).add('day', 1)) {
                if (i > 0 && col % 7 == 0) {
                    col = 0;
                    row++;
                }
                calendar[row][col] = curDate;
            }

            return calendar;

        },

        renderDropdowns: function (selected, minDate, maxDate) {
            var currentMonth = selected.month();
            var monthHtml = '<select class="monthselect">';
            var inMinYear = false;
            var inMaxYear = false;

            for (var m = 0; m < 12; m++) {
                if ((!inMinYear || m >= minDate.month()) && (!inMaxYear || m <= maxDate.month())) {
                    monthHtml += "<option value='" + m + "'" +
                        (m === currentMonth ? " selected='selected'" : "") +
                        ">" + this.locale.monthNames[m] + "</option>";
                }
            }
            monthHtml += "</select>";

            var currentYear = selected.year();
            var maxYear = (maxDate && maxDate.year()) || (currentYear + 5);
            var minYear = (minDate && minDate.year()) || (currentYear - 50);
            var yearHtml = '<select class="yearselect">'

            for (var y = minYear; y <= maxYear; y++) {
                yearHtml += '<option value="' + y + '"' +
                    (y === currentYear ? ' selected="selected"' : '') +
                    '>' + y + '</option>';
            }

            yearHtml += '</select>';

            return monthHtml + yearHtml;
        },
        renderCalendar: function (calendar, selected, minDate, maxDate) {

            //var html = '<div class="calendar-date">';
            var html = '<table class="table-condensed">';
            html += '<thead>';
            html += '<tr>';

            // add empty cell for week number
            if (this.showWeekNumbers)
                html += '<th></th>';

            if (!minDate || minDate.isBefore(calendar[1][1])) {
                html += '<th class="prev available"><i class="icon-arrow-left"></i></th>';
            } else {
                html += '<th></th>';
            }

            var dateHtml = this.locale.monthNames[calendar[1][1].month()] + calendar[1][1].format(" YYYY");

            if (this.showDropdowns) {
                dateHtml = this.renderDropdowns(calendar[1][1], minDate, maxDate);
            }

            html += '<th colspan="5" style="width: auto">' + dateHtml + '</th>';
            if (!maxDate || maxDate.isAfter(calendar[1][1])) {
                html += '<th class="next available"><i class="icon-arrow-right"></i></th>';
            } else {
                html += '<th></th>';
            }

            html += '</tr>';
            html += '<tr>';

            // add week number label
            if (this.showWeekNumbers)
                html += '<th class="week">' + this.locale.weekLabel + '</th>';

            $.each(this.locale.daysOfWeek, function (index, dayOfWeek) {
                html += '<th>' + dayOfWeek + '</th>';
            });

            html += '</tr>';
            html += '</thead>';
            html += '<tbody>';

            for (var row = 0; row < 6; row++) {
                html += '<tr>';

                // add week number
                if (this.showWeekNumbers)
                    html += '<td class="week">' + calendar[row][0].week() + '</td>';

                for (var col = 0; col < 7; col++) {
                    var cname = 'available ';
                    cname += (calendar[row][col].month() == calendar[1][1].month()) ? '' : 'off';

                    if ((minDate && calendar[row][col].isBefore(minDate)) || (maxDate && calendar[row][col].isAfter(maxDate))) {
                        cname = ' off disabled ';
                    } else if (calendar[row][col].format('YYYY-MM-DD') == selected.format('YYYY-MM-DD')) {
                        cname += ' active ';
                        if (calendar[row][col].format('YYYY-MM-DD') == this.startDate.format('YYYY-MM-DD')) {
                            cname += ' start-date ';
                        }
                        if (calendar[row][col].format('YYYY-MM-DD') == this.endDate.format('YYYY-MM-DD')) {
                            cname += ' end-date ';
                        }
                    } else if (calendar[row][col] >= this.startDate && calendar[row][col] <= this.endDate) {
                        cname += ' in-range ';
                        if (calendar[row][col].isSame(this.startDate)) { cname += ' start-date '; }
                        if (calendar[row][col].isSame(this.endDate)) { cname += ' end-date '; }
                    }

                    var title = 'r' + row + 'c' + col;
                    html += '<td class="' + cname.replace(/\s+/g, ' ').replace(/^\s?(.*?)\s?$/, '$1') + '" data-title="' + title + '">' + calendar[row][col].date() + '</td>';
                }
                html += '</tr>';
            }

            html += '</tbody>';
            html += '</table>';
            //html += '</div>';

            return html;
        },
        _recordHistory: function(select,flag){
            if(!this.useHistory){
                return;
            };
            var historyListDom = this.container.find(".history-selections");
            if(this.historySelection.selections[select]){
                this.historySelection.selections[select].remove();
                historyListDom.prepend(this.historySelection.selections[select]);
            }else{
                this.historySelection.selections[select] = $("<li>"+ select +"</li>");
                this.historySelection.count ++;
                historyListDom.prepend(this.historySelection.selections[select]);
                this.saveHistoryToLocalStorage(select,flag);
                if(this.historySelection.count > this.historySelection.sLength){
                    var tmp = historyListDom.find("li:last").text();
                    this.deleteHistoryFromLocalStorage(tmp,flag);
                    this.historySelection.selections[tmp].remove();
                    delete this.historySelection.selections[tmp];
                    this.historySelection.count = this.historySelection.sLength;
                }
            }
            this.container.find('.ranges li.ez-daterangepicker-history').removeClass('disabled');
        },
        _updateRecentBtn :function(){
            if(this.recentSelection.current > 0){
                this.timerecentarea.find('.recent-pre').removeAttr("disabled");
            }else{
                this.timerecentarea.find('.recent-pre').attr("disabled","disabled");
            }
            if(this.recentSelection.current < this.recentSelection.selections.length - 1){
                this.timerecentarea.find('.recent-next').removeAttr("disabled");
            }else{
                this.timerecentarea.find('.recent-next').attr("disabled","disabled");
            }
        },
        _recordSelection: function(select){
            if(!this.useRecent){
                return;
            }
            var _deleteL = this.recentSelection.selections.length - 1 - this.recentSelection.current;
            this.recentSelection.selections.splice(this.recentSelection.current+1,_deleteL,select);
            if(this.recentSelection.current == this.recentSelection.sLength-1 ){
                this.recentSelection.selections.shift();
            }else{
                this.recentSelection.current = this.recentSelection.selections.length-1;
            }
            this._updateRecentBtn();
        },

        _getRecentSelectionPre: function(){
            if(this.recentSelection.current > 0){
                this.recentSelection.current --;
                return this.recentSelection.selections[this.recentSelection.current];
            }else{
                return false;
            }
        },

        _getRecentSelectionNext: function(){
            if(this.recentSelection.current < this.recentSelection.selections.length - 1){
                this.recentSelection.current ++;
                return this.recentSelection.selections[this.recentSelection.current];
            }else{
                return false;
            }
        },

        _getInst: function(a) {
            try {
                return $.data(a, PROP_NAME)
            } catch(b) {
                throw "Missing instance data for this datepicker"
            }
        },

        _getStartDate: function(removeSecond) {
            var _date = this.startDate.toDate();
            if(!this.useSecond){
                _date.setSeconds(00,000);
            }
            if(removeSecond){
                _date.setSeconds(00,000);
            }
            return _date;
        },
        _getEndDate: function(removeSecond) {
            var _date = this.endDate.toDate();
            if(!this.useSecond){
                _date.setSeconds(00,000);
            }
            if(removeSecond){
                _date.setSeconds(00,000);
            }
            return _date;
        },
        _getSelectedRange: function() {
            return this.selectRangesLabel;
        },
        _getRangesType: function(){
            return this.rangestype;
        },
        _timetips: function (text){
            if(text.indexOf(this.locale.customRangeLabel) >= 0){
                return "C";
            }else if(text.indexOf("小时") >= 0){
                return text.replace("小时","").replace("最近","") + "h";
            }else if(text.indexOf("天") >= 0){
                return text.replace("天","").replace("最近","") + "d";
            }else if(text.indexOf("分钟") >= 0){
                return text.replace("分钟","").replace("最近","");
            }else{
                return "";
            }
        },
        _updateTimeTips: function(text){
            if(!this.showTimeTips){
                return;
            }
            $(".datetime-text").text(this._timetips(text));
            this.element.attr("title",this._timeLabelFormat(this.element.val()));
        },
        _showCalendar: function(){
            this.container.find('.calendar').show();
            this.move();
            this.container.find('.ranges').css("margin-bottom","30px");
            if(this.opens == "left"){
                this.container.find('.range_inputs').css("left","5px");  //修改按钮位置
            }else{
                this.container.find('.range_inputs').css("right","5px");  //修改按钮位置
            }
            this.container.find('.range_inputs').show();
        },
        _setSlider: function(){
            $(".ui-timepicker-div").remove();
            this.setSlider();
        },
        _update: function(opt) {
            if(this.shown){
                if(console && console.info){
                    console.info("正在选择时间，暂时不能进行更新");
                }
                return;
            };
            if(arguments.length < 4){
                this.updateRanges();
                if(arguments.length == 1){
                    if(this.selectRangesLabel == this.locale.customRangeLabel){
                        if(console && console.info){
                            console.info("选择时间范围为自定义，无需更新时间");
                        }
                        return;
                    }
                    if(this.selectRangesLabel == ""){
                        if(console && console.info){
                            console.info("未选择时间范围，无法更新时间");
                        }
                        return;
                    }
                    var dates = this.ranges[this.selectRangesLabel];
                }else if(arguments.length == 2 && typeof(arguments[1]) == "string"){
                    var dates = this.ranges[arguments[1]];
                    this.selectRangesLabel = arguments[1];
                }else if(arguments.length == 3 && arguments[1] instanceof Date && arguments[2] instanceof Date){
                    if(arguments[1] > arguments[2]){
                        var tmp = arguments[1];
                        arguments[1] = arguments[2];
                        arguments[2] = tmp;
                    }
                    var dates = [moment(arguments[1]),moment(arguments[2])];
                    this.selectRangesLabel = this.locale.customRangeLabel;
                    this._showCalendar();
                }
                this.startDate = dates[0];
                this.endDate = dates[1];

                if (!this.timePicker) {
                    this.startDate.startOf('day');
                    this.endDate.startOf('day');
                }

                this.leftCalendar.month.month(this.startDate.month()).year(this.startDate.year()).hour(this.startDate.hour()).minute(this.startDate.minute());
                this.rightCalendar.month.month(this.endDate.month()).year(this.endDate.year()).hour(this.endDate.hour()).minute(this.endDate.minute());
                this.updateCalendars();
                this.updateRangeList();
                this._setSlider();

                this.updateTimeLabel();
                this._updateTimeTips(this.selectRangesLabel);


                if(this.selectRangesLabel == this.locale.customRangeLabel){
                    this._recordSelection(this.startDate.format(this.format) + this.separator + this.endDate.format(this.format));
                }else{
                    this._recordSelection(this.selectRangesLabel);
                }
            }else{
                return;
            }
        },
        _timeLabelFormat:function(time){
//			var split = time.split(this.separator);
//			var start, end;
//			if (split.length == 2) {
//				start = moment(split[0], this.format);
//				end = moment(split[1], this.format);
//			}
            var start = this.startDate;
            var end = this.endDate;
            var split = (start.format(this.format) + this.separator + end.format(this.format)).split(this.separator);

            var _return = "";
            if(start.isSame(end,"day")){
                _return = this._timeLabelTransform(split[0]) + this.separator + split[1].split(" ")[1];
            }else{
                _return = this._timeLabelTransform(split[0]) + this.separator + this._timeLabelTransform(split[1]);
            }
            return _return;
        },
        _timeLabelTransform:function(timestring){
            var _now = moment();
            var _time = moment(timestring, this.format);
            var _difference = _time.dayOfYear()-_now.dayOfYear();
            var _return = "";
            switch(_difference){
                case -2:
                    _return = "前天";
                    break;
                case -1:
                    _return = "昨天";
                    break;
                case 0:
                    _return = "今天";
                    break;
                case 1:
                    _return = "明天";
                    break;
                case 2:
                    _return = "后天";
                    break;
                default:
                    _return = timestring.split(" ")[0];
            }
            _return += " " + timestring.split(" ")[1];
            return _return;
        },
        saveHistoryToLocalStorage: function(select,flag){
            //判断选择的时间是否为自定义时间，如果不是则不做处理，直接返回
            var split = select.split(this.separator);
            if(split.length == 1){
                return;
            }

            //将自定义的时间范围保存至localstorage
            if(window.localStorage && this.useLocalStorage && !flag){
                if(window.localStorage.getItem(this.historyLocalStorageName)){
                    var tmp = JSON.parse(window.localStorage.getItem(this.historyLocalStorageName));
                    tmp[select] = select;
                    window.localStorage.setItem(this.historyLocalStorageName, JSON.stringify(tmp));
                }else{
                    window.localStorage.setItem(this.historyLocalStorageName, JSON.stringify({select:select}));
                }
            }
        },
        deleteHistoryFromLocalStorage: function(target,flag){
            if(window.localStorage && this.useLocalStorage && !flag){
                if(window.localStorage.getItem(this.historyLocalStorageName)){
                    var tmp = JSON.parse(window.localStorage.getItem(this.historyLocalStorageName));
                    if(tmp[target]){
                        delete tmp[target];
                    };
                    window.localStorage.setItem(this.historyLocalStorageName, JSON.stringify(tmp));
                }
            }
        },
        setHistoryFromLocalStorage: function(){
            if(window.localStorage && this.useLocalStorage){
                if(window.localStorage.getItem(this.historyLocalStorageName)){
                    var tmp = JSON.parse(window.localStorage.getItem(this.historyLocalStorageName));
                    var _this = this;
                    for(var key in tmp){
                        _this._recordHistory(tmp[key],true);
                    }
                }
            }
        },
        doHistory: function(e){
            var selectRangesLabel = e.target.innerHTML;
            var start, end;
            var split = selectRangesLabel.split(this.separator);
            if (split.length == 2) {
                start = moment(split[0], this.format);
                end = moment(split[1], this.format);
                this.selectRangesLabel = this.locale.customRangeLabel;
            }else{
                start = this.ranges[selectRangesLabel][0];
                end = this.ranges[selectRangesLabel][1];
                this.selectRangesLabel = selectRangesLabel;
            }
            this.startDate = start;
            this.endDate = end;
            this.leftCalendar.month.month(this.startDate.month()).year(this.startDate.year()).hour(this.startDate.hour()).minute(this.startDate.minute());
            this.rightCalendar.month.month(this.endDate.month()).year(this.endDate.year()).hour(this.endDate.hour()).minute(this.endDate.minute());
            this.updateCalendars();
            this.updateRangeList();
            this.updateSlider();

            this.updateTimeLabel();
            this._updateTimeTips(this.selectRangesLabel);

            if(this.selectRangesLabel == this.locale.customRangeLabel){
                this._recordSelection(this.startDate.format(this.format) + this.separator + this.endDate.format(this.format));
            }else{
                this._recordSelection(this.selectRangesLabel);
            }
            this.hide();
            jQuery.event.trigger("eztimeupdate",[this._getStartDate(),this._getEndDate(),this.selectRangesLabel]);
        },
        doRecent:function(e){
            var clicked_btn;
            if($(e.target).is("a")){
                clicked_btn = $(e.target);
            }else{
                clicked_btn = $(e.target).parent();
            }

            var _timeSelection = "";

            if(clicked_btn.hasClass("recent-next")){
                _timeSelection = this._getRecentSelectionNext();
            }else if(clicked_btn.hasClass("recent-pre")){
                _timeSelection = this._getRecentSelectionPre();
            }

            if(!_timeSelection){
                return;
            }else{
                clearTimeout(this.sendEvent);
            }

            var start, end;
            var split = _timeSelection.split(this.separator);
            if (split.length == 2) {
                start = moment(split[0], this.format);
                end = moment(split[1], this.format);
                this.selectRangesLabel = this.locale.customRangeLabel;
            }else{
                start = this.ranges[_timeSelection][0];
                end = this.ranges[_timeSelection][1];
                this.selectRangesLabel = _timeSelection;
            }
            this.startDate = start;
            this.endDate = end;

            this._updateRecentBtn();

            this.leftCalendar.month.month(this.startDate.month()).year(this.startDate.year()).hour(this.startDate.hour()).minute(this.startDate.minute());
            this.rightCalendar.month.month(this.endDate.month()).year(this.endDate.year()).hour(this.endDate.hour()).minute(this.endDate.minute());
            this.updateCalendars();
            this.updateRangeList();
            this.updateSlider();

            this.updateTimeLabel();
            this._updateTimeTips(this.selectRangesLabel);
            this.sendEvent = setTimeout(function(){jQuery.event.trigger("eztimeupdate",[$.ezdaterangepicker._getStartDate(),$.ezdaterangepicker._getEndDate(),$.ezdaterangepicker.selectRangesLabel]);},$.ezdaterangepicker.expandToolsEventDelay);
        },
        timeExpand:function(e){
            var clicked_btn;
            if($(e.target).is("a")){
                clicked_btn = $(e.target);
            }else{
                clicked_btn = $(e.target).parent();
            };
            if(typeof(clicked_btn.attr("disabled")) == "undefined"){
                clearTimeout(this.sendEvent);
            }else{
                return;
            }
            var _startDate = this.startDate;
            var _endDate = this.endDate;
            var _move = this.showExpandToolsMove;
            var _change = this.showExpandToolsChange;

            if(clicked_btn.hasClass("expand-left-move")){
                _startDate.subtract('h',_move);
                _endDate.subtract('h',_move);
            }else if(clicked_btn.hasClass("expand-left-plus")){
                _startDate.subtract('h',_change);
            }else if(clicked_btn.hasClass("expand-left-minus")){
                if(!_startDate.isBefore(_endDate)){
                    return;
                }
                _startDate.add('h',_change);
            }else if(clicked_btn.hasClass("expand-right-move")){
                _startDate.add('h',_move);
                _endDate.add('h',_move);
            }else if(clicked_btn.hasClass("expand-right-plus")){
                _endDate.add('h',_move);
            }else if(clicked_btn.hasClass("expand-right-minus")){
                if(!_endDate.isAfter(_startDate)){
                    return;
                }
                _endDate.subtract('h',_move);
            }

            this.startDate = _startDate;
            this.endDate = _endDate;

            if(_startDate.isBefore(_endDate)){
                clicked_btn.parent().parent().find(".time-expand-tools > a").removeAttr("disabled");
            }else{
                clicked_btn.parent().parent().find(".time-expand-tools > a.expand-left-minus,.time-expand-tools > a.expand-right-minus").attr("disabled","disabled");
            }

            if (!this.timePicker) {
                this.startDate.startOf('day');
                this.endDate.startOf('day');
            }

            this.selectRangesLabel = this.locale.customRangeLabel;

            this.leftCalendar.month.month(this.startDate.month()).year(this.startDate.year()).hour(this.startDate.hour()).minute(this.startDate.minute());
            this.rightCalendar.month.month(this.endDate.month()).year(this.endDate.year()).hour(this.endDate.hour()).minute(this.endDate.minute());
            this.updateCalendars();
            this.updateRangeList();
            this.updateSlider();

            this.updateTimeLabel();
            this._updateTimeTips(this.selectRangesLabel);

//			this.sendEvent = setTimeout(function(){jQuery.event.trigger("eztimeupdate",[$.ezdaterangepicker._getStartDate(),$.ezdaterangepicker._getEndDate(),$.ezdaterangepicker.selectRangesLabel])},$.ezdaterangepicker.expandToolsEventDelay);
            this.sendEvent = setTimeout($.proxy(function(){
                //jQuery.event.trigger("eztimeupdate",[$.ezdaterangepicker._getStartDate(),$.ezdaterangepicker._getEndDate(),$.ezdaterangepicker.selectRangesLabel]);
                jQuery.event.trigger("eztimeupdate",[this._getStartDate(),this._getEndDate(),this.selectRangesLabel]);
                this._recordSelection(this.startDate.format(this.format) + this.separator + this.endDate.format(this.format));
            }, this),this.expandToolsEventDelay);
        }
    }),
        $.fn.daterangepicker = function (options) {
            options = options || {};
            var b = Array.prototype.slice.call(arguments, 1);
            if(typeof(options) == 'string' && (options == "getStartDate" || options == "getEndDate" || options == "getSelectedRange" || options == "getRangesType" || options == "update")){
                return $.data(this[0], "daterangepicker")["_" + options].apply($.data(this[0], "daterangepicker"), [this[0]].concat(b));
            }else if(typeof(options) == 'string'){
                options = {};
                this.each(function () {
                    var el = $(this);
                    if (!el.data('daterangepicker'))
                        el.data('daterangepicker', new DateRangePicker(el, options));
                });
                var _this = this[0];
                $.ezdaterangepicker = $.data(_this, "daterangepicker");
                $(document).on("ezupdatetime",function(event){
                    var _args = Array.prototype.slice.call(arguments, 1);
                    var _trigger = true;
                    if(typeof(_args[_args.length-1]) == "boolean"){
                        _trigger = _args.pop();
                    }
                    $.data(_this, "daterangepicker")["_update"].apply($.data(_this, "daterangepicker"), [_this].concat(_args));
                    if(_trigger){
                        if($.data(_this, "daterangepicker").shown){
                            return;
                        };
                        jQuery.event.trigger("eztimeupdate",[$.ezdaterangepicker._getStartDate(),$.ezdaterangepicker._getEndDate(),$.ezdaterangepicker.selectRangesLabel]);
                    }
                });
            }else{
                this.each(function () {
                    var el = $(this);
                    if (!el.data('daterangepicker'))
                        el.data('daterangepicker', new DateRangePicker(el, options));
                });
                var _this = this[0];
                $.ezdaterangepicker = $.data(_this, "daterangepicker");
                $(document).on("ezupdatetime",function(event){
                    var _args = Array.prototype.slice.call(arguments, 1);
                    var _trigger = true;
                    if(typeof(_args[_args.length-1]) == "boolean"){
                        _trigger = _args.pop();
                    }
                    $.data(_this, "daterangepicker")["_update"].apply($.data(_this, "daterangepicker"), [_this].concat(_args));
                    if(_trigger){
                        if($.data(_this, "daterangepicker").shown){
                            return;
                        };
                        jQuery.event.trigger("eztimeupdate",[$.ezdaterangepicker._getStartDate(),$.ezdaterangepicker._getEndDate(),$.ezdaterangepicker.selectRangesLabel]);
                    }
                });
                return this;
            }
        }
})(jQuery);
