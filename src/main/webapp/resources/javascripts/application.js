// 全局interval
var GLOBAL_INTERVAL = 60;
var LAST_HEALTH_STATE = "";//记录系统health上一次的状态
var SYSTEM_STATE_HTML = null;
Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1, // month
        "d+": this.getDate(), // day
        "h+": this.getHours(), // hour
        "m+": this.getMinutes(), // minute
        "s+": this.getSeconds(), // second
        "q+": Math.floor((this.getMonth() + 3) / 3), // quarter
        "S": this.getMilliseconds()
    };
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "")
            .substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k]
                : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
};
Date.prototype.pattern=function(fmt) {     
	var o = {     
	"M+" : this.getMonth()+1, //月份     
	"d+" : this.getDate(), //日     
	"h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12, //小时     
	"H+" : this.getHours(), //小时     
	"m+" : this.getMinutes(), //分     
	"s+" : this.getSeconds(), //秒     
	"q+" : Math.floor((this.getMonth()+3)/3), //季度     
	"S" : this.getMilliseconds() //毫秒     
	};     
	var week = {     
	"0" : "\u65e5",     
	"1" : "\u4e00",     
	"2" : "\u4e8c",     
	"3" : "\u4e09",     
	"4" : "\u56db",     
	"5" : "\u4e94",     
	"6" : "\u516d"    
	};     
	if(/(y+)/.test(fmt)){     
		fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));     
	}     
	if(/(E+)/.test(fmt)){     
		fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "\u661f\u671f" : "\u5468") : "")+week[this.getDay()+""]);     
	}     
	for(var k in o){     
		if(new RegExp("("+ k +")").test(fmt)){     
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));     
		}     
	}     
	return fmt;     
};

function bindMessageSidebarClicks() {
    $('td.needpopover span.time-light').each(function () {
        $(this).popover({
            html: true,
            placement: "right",
            selector: "span.time-light",
            trigger: "manual",
            content: $(this).next("div.full_message_popover").html()
        });
    });

    $('td.needpopover span.time-light').click(function () {
        $("div.popover").hide();
        $(this).popover("show");
    });

    $(document).click(
        function (event) {
            src_element = $(event.srcElement || event.target);
            if (!src_element.hasClass("time-light") && src_element.parents("div.popover").length == 0)
                $("div.popover").hide();
        }
    );
}

function updateDisplayDate(from, to) {
    $("#timerange-from-date").text(from.format('yyyy-MM-dd'));
    $("#timerange-from-time").text(from.format('hh:mm:ss'));
    $("#timerange-to-date").text(to.format('yyyy-MM-dd'));
    $("#timerange-to-time").text(to.format('hh:mm:ss'));
}

$(document).ready(function () {
    $("#global-message > a.close").click(function () {
        GMS.hideGMS();
    });
    $("#closeBtn").live("click", function () {
        var date = new Date();
        date.setTime(date.getTime() + (30 * 60 * 1000));
        $.cookie("isClosed", true, {expires: date, path: '/'});
        $.cookie("lastHealthState", LAST_HEALTH_STATE, {expires: date, path: '/'});
    });
    SYSTEM_STATE_HTML = $("#system_state");
    LAST_HEALTH_STATE = $.cookie("lastHealthState");
    $("#system_state").remove();
});

var GMS = new function () {
    this.loading = function (message) {
        var gmDiv = $("#global-message");
        var mDiv = $("#global-message > div");
        var mClose = $("#global-message > a.close");
        mClose.hide();
        if (message == undefined)
            message = "加载中";
        message += "...";
        mDiv.removeAttr("class").addClass("g-loading");
        mDiv.text(message);
        gmDiv.css("margin-left", parseInt(gmDiv.css("width")) / -2);
        gmDiv.show();
    };
    this.success = function (message, millisecond) {
        var gmDiv = $("#global-message");
        var mDiv = $("#global-message > div");
        var mClose = $("#global-message > a.close");
        mClose.hide();
        message = message == undefined ? "加载完成" : message;
        mDiv.removeAttr("class").addClass("g-success");
        mDiv.text(message);
        gmDiv.css("margin-left", parseInt(gmDiv.css("width")) / -2);
        gmDiv.show();
        millisecond = millisecond == undefined ? 2000 : parseInt(millisecond);
        setTimeout('GMS.hideGMS()', millisecond);
    };

    this.error = function (message, millisecond) {
        var gmDiv = $("#global-message");
        var mDiv = $("#global-message > div");
        var mClose = $("#global-message > a.close");
        message = message == undefined ? "加载失败" : message;
        mDiv.removeAttr("class").addClass("g-error");
        mDiv.text(message);
        gmDiv.css("margin-left", parseInt(gmDiv.css("width")) / -2);
        gmDiv.show();
        mClose.show();
        millisecond = millisecond == undefined ? 30000 : parseInt(millisecond);
        setTimeout('GMS.hideGMS()', parseInt(millisecond));
    };

    this.hideGMS = function () {
        $("#global-message > a.close").hide();
        $("#global-message").hide();
    };
};

function jsonToString(obj) {
    var THIS = this;
    switch (typeof (obj)) {
        case 'string':
            return '"' + obj.replace(/(["\\])/g, '\\$1') + '"';
        case 'array':
            return '[' + obj.map(THIS.jsonToString).join(',') + ']';
        case 'object':
            if (obj instanceof Array) {
                var strArr = [];
                var len = obj.length;
                for (var i = 0; i < len; i++) {
                    strArr.push(THIS.jsonToString(obj[i]));
                }
                return '[' + strArr.join(',') + ']';
            } else if (obj == null) {
                return 'null';

            } else {
                var string = [];
                for (var property in obj)
                    string.push(THIS.jsonToString(property) + ':'
                    + THIS.jsonToString(obj[property]));
                return '{' + string.join(',') + '}';
            }
        case 'number':
            return obj;
        case false:
            return obj;
    }
}

var util = {
    clone: function (obj) {
        if (typeof (obj) != 'object')
            return obj;
        var re = {};
        if (obj.constructor == Array)
            re = [];
        for (var i in obj) {
            re[i] = util.clone(obj[i]);
        }
        return re;
    }
};


function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r != null) return unescape(r[2]);
    return null; //返回参数值
}

function resizeWindow() {
    $(window).resize();
}

function htmlEncode(v) {
    return $('<div/>').text(v).html();
}
/**
 * 系统状态
 */
function getHealthInfo() {
	if(SUBSYSTEM_APP_NAME.indexOf("apm") < 0 || SUBSYSTEM_APP_NAME.indexOf("npm") < 0){
		return;
	}
    $.ajax({
        url: SUBSYSTEM_APP_NAME + "health/info",
        success: function (data) {
            if (data.ping == 'false' || data.mongo_state == 'false' || data.es_state == 'false' || data.logger_state == 'false') {
                var text = "";
                if (data.logger_state == 'false') {
                    text = appendText(text, "Collector");
                }
                if (data.mongo_state == 'false') {
                    text = appendText(text, "DataBase");
                }
                if (data.es_state == 'false') {
                    text = appendText(text, "ES");
                }
                if (data.ping == 'false') {
                    text = appendText(text, "分析引擎");
                }
                var isClosed = $.cookie("isClosed");
                if (isClosed == 'true') {//被关闭
                    if (text != LAST_HEALTH_STATE) {
                        $("#errorBar").html(SYSTEM_STATE_HTML);
                        $("#system_error_text").text(text + "运行异常。");
                        $("#system_state").show();
                        LAST_HEALTH_STATE = text;
                    }
                } else {
                    $("#errorBar").html(SYSTEM_STATE_HTML);
                    $("#system_error_text").text(text + "运行异常。");
                    $("#system_state").show();
                    LAST_HEALTH_STATE = text;
                }
            } else {
                $("#system_state").hide();
            }
        }
    });
}
function appendText(text, type) {
    if (text.length > 0) {
        text += "、";
    }
    text += type;
    return text;
}

/**
 * @description 验证时间
 * @param start
 * @param end
 * @returns {Boolean}
 */
function validateTime(start, end){
	if((start == null || start.trim() == "") && (end == null || end.trim() == "")){
		GMS.error("开始时间或结束时间不能为空!", 3000);
		return false;
	}
	var start = $("#startTime").datetimepicker("getDate").getTime();
	var end = $("#endTime").datetimepicker("getDate").getTime();
	if(isNaN(start) || isNaN(end)){
		GMS.error("开始时间或结束时间格式不正确!", 3000);
		return false;
	}
	if(start == end){
		GMS.error("起止时间不能相等!", 3000);
		return false;
	}
	if(start > end){
		GMS.error("开始时间不能大于结束时间!", 3000);
		return false;
	}
	return true;
}

/**
 * 格式化数字
 * @param num
 * @param flag
 * @param fiexedNum
 * @returns
 */
function formatterNumber(num,flag,fiexedNum){
	flag++;
	var u_s = "";
	var _num = num/1000;
	if(_num >= 1){
		_num = _num.toFixed((fiexedNum == null ? 1 : fiexedNum));
		return formatterNumber(_num, flag);
	}else{
		switch(flag){
			case 1:
				u_s = "";
				break;
			case 2:
				u_s = "K";
				break;
			case 3:
				u_s = "M";
				break;
			case 4:
				u_s = "G";
				break;
			default:
				u_s = "G";
				num = 1000*num;
				break;
		}
		return num + u_s;
	}
}

/**
 *  npm  流量数字格式化
 * @param num
 * @param flag
 * @param fiexedNum
 * @returns {string}
 */
function formatterFlowNumber(num, flag, fiexedNum) {
    flag++;
    var u_s = "";
    var _num = num / 1024;
    if (_num >= 1) {
        _num = _num.toFixed((fiexedNum == null ? 1 : fiexedNum));
        return formatterFlowNumber(_num, flag);
    } else {
        switch (flag) {
            case 1:
                u_s = "";
                break;
            case 2:
                u_s = "K";
                break;
            case 3:
                u_s = "M";
                break;
            case 4:
                u_s = "G";
                break;
            default:
                u_s = "G";
                num = 1024 * num;
                break;
        }
        num =  parseFloat(num);
        return flag == 1 ? (num == 0 ? 0 : num.toFixed((fiexedNum == null || fiexedNum == undefined ? 2 : fiexedNum)) + u_s) : num + u_s;
    }
}

/**
 * @description 初始化精度下拉框的chosen样式
 */
function initTimeScale() {
    $("#timeScale").chosen({
        no_results_text: "没有匹配项",
        allow_single_deselect: true,
        disable_search: true
    });
    $("#timeScale").change(function () {
        $("#timeScale").trigger("chosen:updated");
    });
}

/**
 * @description 根据时间长度控制粒度选择
 * @param startDate
 * @param endDate
 */
function checkTimeRange(targetElement, startDate, endDate){
	 var one_hour = 3600;
	 var TIME_RANGES = [{
	    selectTimeRange : 12,  //0.5天
	    minInterval: 60
	 },{
	    selectTimeRange : 24,  //1天
	    minInterval: 300
	 },
	 {
	    selectTimeRange : 72,  //3天
	    minInterval: 600
	 },
	 {
	    selectTimeRange : 120, //5天
	    minInterval: 1800
	 }];
     var from = Math.floor(startDate.getTime() / 1000);
     var to = Math.floor(endDate.getTime() / 1000);
     var range = to - from;
     var isChanged = false;
     var selectedVal = parseInt(targetElement.val()); //当前选中的值
     targetElement.find("option").each(function(){
         var val = parseInt($(this).val());
         $(this).removeAttr("disabled").removeAttr('title');
         for(var i = 0; i < TIME_RANGES.length; i++){
             var selectTimeRange = TIME_RANGES[i].selectTimeRange;
             var minInterval = TIME_RANGES[i].minInterval;
        	 if(range >= (selectTimeRange * one_hour)){
                 if(val < minInterval){
                     $(this).attr("disabled","disabled");
                 }else{
            		 isChanged = true;
                	 targetElement.val(selectedVal > minInterval ? selectedVal : minInterval);
                     $(this).removeAttr("disabled").removeAttr('title');
                 }
             }else if(val > range){
        		 isChanged = true;
        		 $(this).attr("disabled","disabled");
                 targetElement.val(selectedVal < range ? selectedVal : GLOBAL_INTERVAL);
             }
         }
     });
     targetElement.trigger("chosen:updated");
     $("#timeScale_chosen").bind("click", function(){
    	 $(this).find(".disabled-result").each(function(){
        	 $(this).attr("title", "当前选择的时间范围太大，无法选择此粒度");
         });
     });
     if(isChanged){
    	 jQuery.event.trigger("resetTimer");
     }
}
/**
 * @description 全局的打开新页面的方法
 * @param url  跳转地址
 * @param isBlank 是否打开新窗口 default false
 */
function openWindow(url, isBlank) {
    var target = "_self";
    if (isBlank) {
        target = "_blank";
    }
    window.open(url, target);
}

/**
 * 取得url的nameSpace
 * @param url
 */
function getNamespace(url) {
    var namespace = url.substring(url.lastIndexOf(APP_NAME) + APP_NAME.length);
    var index = namespace.indexOf("/");
    if (index < 0) {
        index = namespace.length;
    }
    return namespace.substring(0, index);
}

var HELPER_UTILS = {

    /**
     * 超过最大长度截取字符串、以......补到结尾
     * @param {string} str
     * @param {number} exceedValue
     */
    substringExceedMaxlength: function (str, exceedValue) {
        exceedValue = exceedValue < 1 ? 0 : exceedValue;
        if (str && typeof str === 'string' && str.length > exceedValue) {
            return str.substring(0, exceedValue - 1) + "......";
        }
        return str;
    },

    /**
     * 回到顶部
     */
    toTopOfScroll: function toTopOfScroll(height) {
        var height_ = height ? height : 0;
        $("html, body").animate({scrollTop: height_}, 500);
    }
};
