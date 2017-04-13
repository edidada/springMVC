/* Simplified Chinese translation for the jQuery Timepicker Addon /
/ Written by Will Lu */
(function($) {
	$.timepicker.regional['zh-CN'] = {
		timeOnlyTitle: '选择时间',
		timeText: '时间',
		hourText: '小时',
		minuteText: '分钟',
		secondText: '秒钟',
		millisecText: '微秒',
		timezoneText: '时区',
		currentText: '现在时间',
		closeText: '关闭',
		timeFormat: 'hh:mm:ss',
        // showSecond: true,
		amNames: ['AM', 'A'],
		pmNames: ['PM', 'P'],
		ampm: false,
		monthNames:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],
		monthNamesShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
		dayNames:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
		dayNamesShort:["日","一","二","三","四","五","六"],
		dayNamesMin:["日","一","二","三","四","五","六"]
	};
	$.timepicker.setDefaults($.timepicker.regional['zh-CN']);
})(jQuery);
