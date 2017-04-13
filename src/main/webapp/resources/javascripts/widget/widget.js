/**
 * 仪表盘/仪表盘模板处理
 */
var M0DULE_TYPE_DASHBOARD = "dashboard";

var defaultRatioDenominator = 16;
var minRatioMolecule = 3;
var canDrillDown = false; //需要全局变量canDrillDown存在才可以使用下钻功能
//指标图标对应
var chartType = {
		"plotArea"        : "icon-area-chart",
		"plotBar"         : "icon-paragrph-left",
		"plotColumn"      : "icon-bar-chart",
		"plotColumnStack" : "icon-bar-chart",
		"plotList"        : "icon-table",
		"plotMutiLine"    : "icon-area-chart",
		"plotPie"         : "icon-pie-chart",
		"plotStack"       : "icon-area-chart",
		"plotValueText"   : "icon-table"
};

var GLOBAL_PARAMS = {}; 	//全局参数
var allWidgetMonitors = [];	//所有图表
var allMetricSources = [];	//所有指标
var widgetArr = [];			//包含所有图表信息的数组
var sortableId = null;		//包含所有图表的Div的ID

var resizeCallback = function ($item) {
    var $chart = $item.children("div.chart");
    var chartObj = getWidgetInfoById($item.attr("id")).chart;
    if(chartObj != null){
    	chartObj.setSize(subPx($chart.css("width")), subPx($chart.css("height")));
    }
    updateWidget($item, "resize", GLOBAL_PARAMS.id, GLOBAL_PARAMS.module_type);
};

var sortcallback = function () {
    sortWidget(GLOBAL_PARAMS.id, GLOBAL_PARAMS.module_type);
};

var mergerWidgetCallback = function(sourceWidgetInfoId,targetWidgetInfoId){
	mergerWidget(GLOBAL_PARAMS.id, GLOBAL_PARAMS.module_type, sourceWidgetInfoId, targetWidgetInfoId);
};

var dashboardOpts = {
    item:"div.widget_s",
    titlespan:"div.widget-title",
    contentspan:"div.chart",
    refresh:false,
    moveHandler:"div.widget-title",
    resizeCallback:resizeCallback,
    sortcallback:sortcallback,
    mergerWidgetCallback : mergerWidgetCallback,
    highRatio:3 / 4
};

$(document).ready(function(){
	if($("#canDrillDown").length >0 ){
		canDrillDown = true;
	}
});

/**
 * @description 处理dashboardOpts
 * @param isEditDashboard
 * @param columns
 */
function returnExtendOpts(isEditDashboard, columns){
	GLOBAL_PARAMS.isEditDashboard = (isEditDashboard == undefined ? GLOBAL_PARAMS.isEditDashboard : isEditDashboard);
	GLOBAL_PARAMS.columns = (columns == undefined ? GLOBAL_PARAMS.columns : columns);
    var ratio = GLOBAL_PARAMS.widget_ratio;
    dashboardOpts = $.extend(dashboardOpts, {
    	highRatio : eval(ratio + "/" + defaultRatioDenominator), 
    	isEditDashboard : GLOBAL_PARAMS.isEditDashboard,
    	columns : GLOBAL_PARAMS.columns
    });
    return dashboardOpts;
}

/**
 * @description 获取全局使用的参数
 * @param param				仪表盘id
 * @param module_type		仪表盘或者模板
 * @param isEditDashboard	是否是可编辑状态
 * @param {function} func 	回调函数
 */
function getGlobalParams(param, module_type, isEditDashboard, func){
	var namespace = (module_type == M0DULE_TYPE_DASHBOARD) ? "apm/dashboards" : "dashboardTemplate";
	$.ajax({
		url : APP_NAME + namespace + "/getGlobalParams",
		type : "post",
		data : param,
		success : function(res){
			GLOBAL_PARAMS.id = res.id;							//id
			GLOBAL_PARAMS.module_type = module_type; 			//仪表盘或仪表盘模板
			GLOBAL_PARAMS.isEditDashboard = !!(isEditDashboard == 'true' || isEditDashboard == true);     //是否是编辑仪表盘
			GLOBAL_PARAMS.widget_ratio = eval(res.widget_ratio == null ? (0.5) : res.widget_ratio) * 16;  //高宽比
			GLOBAL_PARAMS.columns = (res.columns == null ? 2 : res.columns); 		 				 	  //列数
			GLOBAL_PARAMS.templateType = res.template_type;

			allWidgetMonitors = res.allWidgetMonitors;
			allMetricSources = res.allMetricSources;
			widgetArr = returnWidgetArray(res.widgetInfos, module_type);
			sortableId = "sortable_" + GLOBAL_PARAMS.id;
			
			renderWidget();
			func();
		}
	});
}
/**
 * @description 加载仪表盘图表 
 * @param {String} 		id  				仪表盘id
 * @param {String} 		targetDiv 			包含所有图表的最外层Div
 * @param {function} 	func 				回调函数
 * @param {Boolean} 	isEditDashboard 	是否可编辑
 */
function initDashboard(id, targetDiv, func, isEditDashboard){
	GMS.loading();
	$.ajax({
		url : SUBSYSTEM_APP_NAME+"dashboards/"+id+"/showWidget",
		type : "post",
		success : function (data) {
			 $("#"+targetDiv).html(data);
			 getGlobalParams({id : id}, M0DULE_TYPE_DASHBOARD, isEditDashboard, func);
			 GMS.success();
		}
	});
}
/**
 * @description 加载仪表盘模板图表 
 * @param {String} paramsObj  模板名称对象
 * @param {String} targetDiv 图表目标
 * @param {function} func 回调函数
 * @param {Boolean} isEditDashboard 是否可编辑
 */
function initDashboardTemplate(paramsObj, targetDiv, func, isEditDashboard){
	GMS.loading();
	var param = {};
	if(typeof(paramsObj) == "string"){
		param = {name : paramsObj};
	}else{
		param = paramsObj;
	}
	$.ajax({
		url : APP_NAME+"dashboardTemplate/showWidget",
		type : "post",
		data : param,
		success : function (data) {
			var $targetDiv = $("#"+targetDiv);
			$targetDiv.html(data);
			getGlobalParams(param, "dashboardtemplate", isEditDashboard, func);
			
			//设置值，用于模板合并时刷新------见176行
			$("#templateTarget").val(targetDiv);
			$.data($targetDiv[0], "callback", func);
			$.data($targetDiv[0], "searchParams", paramsObj);
			GMS.success();
		}
	});
}
/**
 * @description 重新加载仪表盘
 * @param module_type
 * @param id
 */
function reloadDashboard(module_type,id){
	if(module_type == M0DULE_TYPE_DASHBOARD){ //仪表盘
    	var selectId = $("#dashboardshow").find("option:selected").attr("value");
    	id = (selectId == undefined ? id : selectId);
    	if(id != ""){
    		initDashboard(id,"dashboardWidgetTarget",search, true);
    	}
    }else{
    	//获取到设置的值 ------见155行
    	var targetDiv = $("#templateTarget").val();
		var $targetDiv = $("#"+targetDiv);
    	var callback = $.data($targetDiv[0], "callback");
    	var searchParams = $.data($targetDiv[0], "searchParams");
    	initDashboardTemplate(searchParams, targetDiv, callback, true);//仪表盘模板
    }
}

/**
 * @description
 * 大屏的时候，获得各个dom结构的rem值
 * 用来计算适合大屏的单个widget长宽比。
 */
var pageArgs = {
	pageHightBase : 40,
	widgetMarginY : 0,//1.6 fDashboard 中已经计算了margin之类的值，所以这里无需考虑，下面的0.8同理
	widgetMarginX : 0,//0.8
	specialChart : 0.8 + 5,
	yArgs: {
		bodyPaddingY : 1.6,
		tvHeaderY : 3,
		inContainerPaddingY : 1,
		inContainerMarginY : 0,
		widgetinfoTabMarginY : 0.5,
		sortTableDivPaddingY : 0.75
	},
	xArgs: {
		bodyPaddingX : 1.6,
		inContainerPaddingX : 0.8
	}
};
pageArgs.ySum = (function(){
	var _ySum = 0;
	for (var key in pageArgs.yArgs) {
		_ySum += pageArgs.yArgs[key];
	}
	return _ySum;
})();
pageArgs.xSum = (function(){
	var _xSum = 0;
	for (var key in pageArgs.xArgs) {
		_xSum += pageArgs.xArgs[key];
	}
	return _xSum;
})();

/**
 * @description 获得当前屏幕的长宽比
 * window.resize的时候，要动态获取。
 */
function getScreenRatio(){
	return document.body.clientWidth/document.body.clientHeight;
}
/**
 * @description 获得TV模式下Widget的长宽比 以Y轴值为参考
 * @param screenRatio 		屏幕宽高比
 * @param column			列数
 * @param hasSpecialChart	是否有specialChart
 * @return number			Widget的高宽比
 */
function getHighRatio(screenRatio,column,hasSpecialChart) {
	var specialChart = hasSpecialChart ? 1 : 0;
	var height = (pageArgs.pageHightBase - pageArgs.ySum - pageArgs.widgetMarginY * 2 - specialChart * pageArgs.specialChart) / 2;
	var width = (pageArgs.pageHightBase * screenRatio - pageArgs.xSum - pageArgs.widgetMarginX * column) / column;
	return height / width;
}
/**
 * @description 加载图表
 */
function renderWidget(){
	var $specialChart = $("#special_chart");
	var hasSpecialChart = false;
	var widgetCols = 0;//控制tv模式显示2行(不含special chart)
	dashboardOpts = returnExtendOpts();
	var widgetColsRemain = 2 * dashboardOpts.columns;//控制tv模式显示2行(不含special chart)
	bindRatioSliderClick(dashboardOpts);
	bindChangeColumn();
	var $sortableId = $("#"+sortableId);
	$sortableId.empty().disableSelection();
	for (var i = 0; i < widgetArr.length; i++) {
		if(widgetArr[i].monitor != null){
			if(widgetArr[i].monitor.display_type != "plotValueText"){
				if(isTVModel && (widgetColsRemain < widgetArr[i].colspan * widgetArr[i].rowspan
					|| dashboardOpts.columns < widgetArr[i].colspan)){
					widgetArr.splice(i,1);
					i--;
					continue;
				}
				appendWidget(widgetArr[i], GLOBAL_PARAMS.id, GLOBAL_PARAMS.module_type, GLOBAL_PARAMS.isEditDashboard);
				var _tmp = (i ? Math.ceil(widgetCols/dashboardOpts.columns): 1) * dashboardOpts.columns - widgetCols;
				if(_tmp >= widgetArr[i].colspan){
					_tmp = 0;
				}
				widgetColsRemain -= (widgetArr[i].colspan * widgetArr[i].rowspan + _tmp);
				widgetCols += (widgetArr[i].colspan * widgetArr[i].rowspan + _tmp);
			}else{
				$specialChart.show();
				hasSpecialChart = true;
				bindDelelteSpecialChartEvent(widgetArr[i], GLOBAL_PARAMS.id, GLOBAL_PARAMS.module_type);
			}
		}
	}
	if(isTVModel){
		dashboardOpts.highRatio = getHighRatio(getScreenRatio(),dashboardOpts.columns,hasSpecialChart);
	}
    if(GLOBAL_PARAMS.isEditDashboard){//编辑仪表盘时才需要处理表单的数据
    	customDefWidgetHandle();
    	if(GLOBAL_PARAMS.module_type == M0DULE_TYPE_DASHBOARD){
        	dashboardHandle();
        }else{
        	dashboardTemplateHandle();
        }
    }
    var options = $sortableId.fDashboard(dashboardOpts);
    resetWidgetWidth(options);
    //关闭导航菜单以及改变浏览器大小时重新计算widget的宽度
    $(document).on("containerResize",function(){
    	dashboardChartResize(dashboardOpts);
    });
    $(window).unbind("resize").resize(function(e){
    	if(e.target == window){
			if(isTVModel){
				setRootFontSize();
				dashboardOpts.highRatio = getHighRatio(getScreenRatio(),dashboardOpts.columns,hasSpecialChart);
			}
    		dashboardChartResize(dashboardOpts);
    	}
    });
}
/**
 * @description 当存在滚动条并且包含special_chart时， 重设一下widget的宽度，
 * 		        解决special_chart和下面的widget不对齐的问题
 * @param options
 */
function resetWidgetWidth(options){
	var container = document.getElementById("container");
	var fix = container.offsetWidth - container.clientWidth;
	if (fix > 0 && !options.haveScroll){
		var sortableObj = $("#" + sortableId);
		sortableObj.css("width", (sortableObj.width() - fix) + "px");
		sortableObj.find(".widget_s").each(function() {
			var p = $(this).css("width");
			$(this).css("width", (subPx(p) - (fix / options.columns)) + "px");
		});
	}
}
/**
 * @description 绑定修改列事件
 */
function bindChangeColumn(){
	var $displayColumn = $("#displayColumn");
	var $displayColumn_chosen = $("#displayColumn_chosen");
	if($displayColumn_chosen.length > 0){
		$displayColumn.chosen("destroy");
	}
	$displayColumn.chosen({no_results_text: "没有匹配项", allow_single_deselect: false, disable_search: true});
	$displayColumn.val(GLOBAL_PARAMS.columns);
	$displayColumn.trigger("chosen:updated");

	$displayColumn.die('change').live('change',function(){
		$(this).trigger("chosen:updated");
		var columns = $displayColumn.find("option:selected").val();
		GMS.loading();
		$.ajax({
        	url : SUBSYSTEM_APP_NAME+"dashboards/"+GLOBAL_PARAMS.id+"/setColumns",
        	type : "post",
        	data : {
        		columns : columns,
                module_type : GLOBAL_PARAMS.module_type
            },
            success : function (data) {
                if (data.success) {
                	dashboardChartResize(returnExtendOpts(true, columns));
                    GMS.success("设置成功");
                }else {
                    GMS.error("设置失败");
                }
            }
         });
	});
}
/**
 * @description 绑定高宽比事件
 * dashboardOpts {Object} dashboardOpts
 */
function bindRatioSliderClick(dashboardOpts){
	$("#high-ratio-slider").slider({
        range : "min",
        min : minRatioMolecule,
        max : defaultRatioDenominator,
        value : GLOBAL_PARAMS.widget_ratio,
        slide : function (event, ui) {
        },
        stop:function (event, ui) {
        	GMS.loading("加载中...");
            $.ajax({
            	url : SUBSYSTEM_APP_NAME+"dashboards/"+GLOBAL_PARAMS.id+"/setHighRatio",
            	type : "post",
            	data : {
                    ratio:ui.value + "/" + defaultRatioDenominator,
                    module_type : GLOBAL_PARAMS.module_type
                },
                success : function (data) {
                    if (data.success) {
                        var options = $.extend(dashboardOpts, {highRatio:eval(ui.value + "/" + defaultRatioDenominator)});
                        var $sortableId = $("#"+sortableId);
						$sortableId.fDashboard(options);
						$sortableId.find(".widget_s").each(function () {
                            var $chart = $(this).children("div.chart");
                            var chartObj = getWidgetInfoById($(this).attr("id")).chart;
                            if(chartObj != null){
                            	chartObj.setSize(subPx($chart.css("width")), subPx($chart.css("height")));
                            }
                        });
                        GLOBAL_PARAMS.widget_ratio = eval(ui.value + "/" + defaultRatioDenominator) * 16;
                        GMS.success("高宽比保存成功");
                    }
                    else {
                        GMS.error("高宽比保存失败");
                    }
                }
             });
        }
    });
}

/**
 * SpecialChart删除事件绑定
 * @param {Object} widgetinfo
 * @param {String} id
 * @param {String} module_type
 */
function bindDelelteSpecialChartEvent(widgetinfo, id, module_type){
	var $deleteSpecialChartBtn = $("#delete_special_chart");
	if(GLOBAL_PARAMS.isEditDashboard){
		$deleteSpecialChartBtn.show();
	}
	$deleteSpecialChartBtn.bind("click",function(){
		showConfirm({
			confirmTitle:"删除确认",
			confirmText:"确定要删除这个图表吗？",
			confirmBtnText:"确定",
			cancelBtnText:"取消",
			confirmCallback:function() {
				deleteWidget(widgetinfo, GLOBAL_PARAMS.id, module_type, true);
			},
			cancelCallback:function() {
			}
		});
	});
}
/**
 * @description 重新设置chart的size
 * @param {Object} dashboardOpts
 */
function dashboardChartResize(dashboardOpts){
	var $sortableId = $("#"+sortableId);
	var p = $sortableId.parent().css("width");
	$sortableId.css("width", subPx(p)+"px");
	$sortableId.fDashboard(dashboardOpts);
	$sortableId.find(".widget_s").each(function(){
		var $chart = $(this).children("div.chart");
		var newWidth = parseInt(subPx($chart.css("width")));
		var chart = getWidgetInfoById($(this).attr("id")).chart;
		if(chart != null){
			chart.legend.update({width : newWidth/2});
			chart.setSize(newWidth, parseInt(subPx($chart.css("height"))));
		}
	});
}
/**
 * @description 初始化已经添加的widget选项栏
 * @param {Array} widgetInfos
 * @param {String} module_type
 * @returns {Array}
 */
function returnWidgetArray(widgetInfos,module_type){
	var widgetArr = [];
	if(widgetInfos != null && widgetInfos.length > 0){
		for (var i = 0; i < widgetInfos.length; i++) {
			var obj = {};
			obj.infoId = widgetInfos[i].infoId;
			obj.title = widgetInfos[i].title;
			if(module_type == M0DULE_TYPE_DASHBOARD){
				if(widgetInfos[i].stream_id){
					obj.stream_id = widgetInfos[i].stream_id;
					obj.streamNames = widgetInfos[i].streamNames;
				}
			}
			obj.colspan = widgetInfos[i].colspan;
			obj.rowspan = widgetInfos[i].rowspan;
			obj.monitor = widgetInfos[i].monitor;
			widgetArr.push(obj);
	    }
	}
    return widgetArr;
}

/**
 * @description 处理下拉框分组
 * @param {Array} array_app 应用类型
 * @param {Array} array_net 网络类型
 * @param {Array} array_node 节点类型
 */
function addOptionGroup(array_app, array_net,array_node) {
	var $widgetType = $("#widget_type");
	$widgetType.empty();
	var html = "";
	if(array_app != null && array_app.length > 0){
		html += "<OPTGROUP LABEL='应用类型' id='1'>";
		html += returnOptionStr(array_app);
		html += "</OPTGROUP>";
	}
	if(array_net != null && array_net.length > 0){
		html += "<OPTGROUP LABEL='网络类型' id='2'>";
		html += returnOptionStr(array_net);
		html += "</OPTGROUP>";
	}
	if(array_node != null && array_node.length > 0){
		html += "<OPTGROUP LABEL='节点类型' id='3'>";
		html += returnOptionStr(array_node);
		html += "</OPTGROUP>";
	}
	$widgetType.append(html);
	$widgetType.trigger("chosen:updated");
}

/**
 * @description 处理下拉框选项
 * @param {Array} arrayObj
 * @returns {String}
 */
function returnOptionStr(arrayObj){
	var optionStr ="";
	for (var i = 0; i < arrayObj.length; i++) {
		optionStr += '<option class="chosen-chart-type-contianer '+ chartType[allWidgetMonitors[i].display_type];
		if(allWidgetMonitors[i].display_type == "plotMutiLine" && allWidgetMonitors[i].monitorConditions.length >1){
			optionStr += " double-icon-line-chart";
    	}
		optionStr += '" value="' + arrayObj[i].widget_id + '" display_type="'+
		arrayObj[i].display_type +'" display_text="' + arrayObj[i].title + '">' + arrayObj[i].title+"</option>";
	}
	return optionStr;
}

/**
 * @description 对应仪表盘模板页面的处理
 */
function dashboardTemplateHandle(){
	var array_app = [], array_net = [], array_node = [];
	for (var i = 0; i < allWidgetMonitors.length; i++) {
		 if (allWidgetMonitors[i].type == 1){
			 array_net.push(allWidgetMonitors[i]);//网络
		 }else if (allWidgetMonitors[i].type == 2){
			 array_node.push(allWidgetMonitors[i]);//节点
		 }else{
			 array_app.push(allWidgetMonitors[i]);//应用
		 }
     }
	 addOptionGroup(array_app, array_net,array_node);
     $("#widget_type").change(function () {
         $("#widget_type").trigger("chosen:updated");
     });
     $("#addWidgetModal").bind("click", function () {
    	 resetState();
    	 disabledOption();
     });
}

/**
 * @description 对应仪表盘页面的处理
 */
function dashboardHandle(){
	var selectStreamArray = [];
	var $widgetStreamIds = $("#widget_streamIds");
	$widgetStreamIds.on("chosen:showing_dropdown",function () {
		selectStreamArray = $(this).val();
	});
	$widgetStreamIds.unbind("change").bind("change",function () {
		setStreamOptionState("widget_streamIds");
		var selectArray = $widgetStreamIds.find("option:selected");
		if(selectArray && selectArray.length > 10){
			setMetricStreamIds(selectStreamArray,"widget_streamIds");
			validateCheckForm.showErrorOfQtip($(this).next(), "添加失败，每次最多选择10个流");
		} else {
			$(this).next().qtip('destroy');//删除上次错误信息
		}
		$(this).trigger("chosen:updated");
    });
	var selectWidgetArray = [];
	var $widgetType = $("#widget_type");
	$widgetType.on("chosen:showing_dropdown",function () {
		selectWidgetArray = $(this).val();
	});
	$widgetType.unbind("change").change(function () {
		var selectArray = $widgetType.find("option:selected");
		if(selectArray && selectArray.length > 10){
			$(this).val(selectWidgetArray);
			validateCheckForm.showErrorOfQtip($(this).next(), "添加失败，每次最多选择10个图表");
		} else {
			$(this).next().qtip('destroy');//删除上次错误信息
		}
		$(this).trigger("chosen:updated");
    });

    $("#addWidgetModal").unbind("click").bind("click", function () {
    	resetState();
    });
}

/**
 * @description 设置流option的状态，解决由于流可以属于多个业务路后同一个流能选择多次的问题
 * @param selectId
 */
function setStreamOptionState(selectId) {
	var selectArray = $("#"+ selectId +" option:selected");
	var selectValueArray = $("#"+ selectId).val();
	if(selectArray && selectArray.length > 0){
		selectArray.each(function() {
			var selectValue = $(this).val();
			var selectGroup = $(this).parent();
			var selectGroupLabel = $(selectGroup).attr("label");
			$("#"+ selectId +" optgroup > option").each(function(){
				var option = $(this);
				var group = $(this).parent();
				var groupLabel = $(group).attr("label");
				if(groupLabel != selectGroupLabel && option.val() == selectValue){
					option.attr("disabled","disabled");
				}
				if($.inArray(option.val(), selectValueArray) == -1){
					option.removeAttr("disabled");
				}
			});
		});
	}else {
		$("#"+ selectId +" optgroup > option").each(function(){
			$(this).removeAttr("disabled");
		});
	}
}

/**
 * 重置添加图表弹出框状态
 */
function resetState(){
	var $systemDefLi = $("#system_def_li");
	$systemDefLi.parent().show();
	$systemDefLi.addClass("active");
	$("#system_def").addClass("active");
	$("#custom_def_li").removeClass("active");
	$("#custom_def").removeClass("active");
	$("#lenged_def").removeClass("active");
	$("#myModalLabel").text("添加图表");
	resetWidgetForm();
}

/**
 * @description 设置WidgetMonitor
 * @param streamType  流类型
 */
function setWidgetMonitors(streamType){
	var $widgetType = $("#widget_type");
	$widgetType.empty();
	if(streamType == "" || streamType == null){
		streamType = 0;
	}
	for(var i=0; i<allWidgetMonitors.length; i++) {
        if (allWidgetMonitors[i].type == streamType) {
        	var str = '<option class="chosen-chart-type-contianer '+ chartType[allWidgetMonitors[i].display_type];
        	if(allWidgetMonitors[i].display_type == "plotMutiLine" && allWidgetMonitors[i].monitorConditions.length >1){
        		str += " double-icon-line-chart ";
        	}
        	str += '" value="' + allWidgetMonitors[i].widget_id + '">' + allWidgetMonitors[i].title;
			$widgetType.append(str);
        }
    }
	$widgetType.trigger("chosen:updated");
}

/**
 * @description 自定义图表 表单处理
 */
function customDefWidgetHandle(){
	var $metricStreamIds = $("#metric_streamIds");
	var selectObj = $metricStreamIds.find("option:selected");
	var stream_id = null, stream_type = 0;
	if(selectObj && selectObj.length > 0){
		stream_id = selectObj.val();
		stream_type = selectObj.attr("data");
	}
	if(GLOBAL_PARAMS.templateType != "" && GLOBAL_PARAMS.templateType != null){//根据模板类型展示对应的指标
		stream_type = (GLOBAL_PARAMS.templateType == "2" ? "0" : GLOBAL_PARAMS.templateType);
	}
	$("#filter_condition").ezhelper({
		"showAutoComplete":true,
		"showHelperArea": false,
		stream_id : stream_id,
		stream_type : stream_type
	});
	$metricStreamIds.unbind("change").bind("change",function () {
		setStreamOptionState("metric_streamIds");
		var target_metric = $("#metric").val();
		var metric = $("#metric_source").val();
        setMetricSource(target_metric, metric);
        setCaculateType();
        $(this).trigger("chosen:updated");
        var val = $(this).val();
        var type = $(this).find("option:selected").attr("data");
        $("#filter_condition").ezhelper("loadDataFromServer", {stream_id : val, stream_type : type});
    });
	$("input[name='display_type']").unbind("change").bind("change",function () {
		$(this).attr("checked","checked");
		setCaculateType();
	});
	$("#metric_source").unbind("change").bind("change",function () {
		$(this).trigger("chosen:updated");
	});
	$("#metric").unbind("change").bind("change",function () {
		setCaculateType();
		$(this).trigger("chosen:updated");
	});
	$("#type").unbind("change").bind("change",function () {
		$(this).trigger("chosen:updated");
	});
}

/**
 * @description 设置指标数据
 * @param {String} selectTargetMetric
 * @param {String} selectMetric
 */
function setMetricSource(selectTargetMetric, selectMetric){
	var $metric = $("#metric");		//指标的第一个select
	var $metricSource = $("#metric_source");//数据select
	$metric.empty();
	$metricSource.empty();
	if(GLOBAL_PARAMS.module_type == M0DULE_TYPE_DASHBOARD){
		for(var m = allMetricSources.length; m--;  m<=0){
			if(allMetricSources[m] && allMetricSources[m].id == null){
				allMetricSources.splice(m, 1);
			}
		}
		var streamIds = $("#metric_streamIds").val();
		if(streamIds != null && streamIds.length > 0){
			getMetricsByStreamId(streamIds, selectTargetMetric, selectMetric);
		}
	}
    for(var i=0; i < allMetricSources.length; i++) {
    	if(allMetricSources[i] != null){
    		if(GLOBAL_PARAMS.module_type == M0DULE_TYPE_DASHBOARD){
        		if (allMetricSources[i].type == 0 || allMetricSources[i].type == "2") {
        			appendTargetMetricOption(allMetricSources[i], selectTargetMetric, selectMetric);
        			appendMetricOption(allMetricSources[i], selectMetric);
                }
        	}else{
        		appendTargetMetricOption(allMetricSources[i], selectTargetMetric, selectMetric);
        		appendMetricOption(allMetricSources[i], selectMetric);
        	}
    	}
    }
	$metric.trigger("chosen:updated");
	$metricSource.trigger("chosen:updated");
}

/**
 * @description append Options
 * @param {Object} metricObj
 * @param {String} selectTargetMetric
 * @param {String} selectMetric
 */
function appendTargetMetricOption(metricObj, selectTargetMetric, selectMetric){
	var selected = false;
	if(selectTargetMetric == null) {
		selectTargetMetric = selectMetric;
	}
	if(metricObj != null && metricObj.metric == selectTargetMetric){
		selected = true;
	}
	if(metricObj.data_type == "number"){
		$("#metric").append('<option value="' + metricObj.metric + '" '+(selected==true?"selected=selected":"")
						   +' data_type="'+metric.data_type +'" unit="'+metricObj.unit+'">'+ metricObj.title);
	}
}
/**
 * @description append Options
 * @param {Object} metricObj
 * @param {String} selectMetric
 */
function appendMetricOption(metricObj, selectMetric){
	var selected = false;
	if(metricObj != null && metricObj.metric == selectMetric){
		selected = true;
	}
	if(metricObj.data_type == "string" || metricObj.metric.indexOf(".") > 0){
		$("#metric_source").append('<option value="' + metricObj.metric + '" '+(selected==true?"selected=selected":"")
								  +' data_type="'+metricObj.data_type +'" unit="'+metricObj.unit+'">'+ metricObj.title);
	}
}

/**
 * @description 查询某个流中的特殊指标
 * @param streamIds 流id
 * @param {String} selectTargetMetric
 * @param selectMetric 选中的指标
 */
function getMetricsByStreamId(streamIds, selectTargetMetric, selectMetric){
	$.ajax({
    	url : SUBSYSTEM_APP_NAME+"dashboards/getMetricsByStreamId",
    	type : "post",
    	data : {
    		streamIds : streamIds
    	},
        success : function (data) {
        	if(data.success){
        		var metricArray = data.obj;
        		if(metricArray && metricArray.length > 0){
					for (var i = 0; i < metricArray.length; i++) {
						//因为这2个指标在metric表中已存在，流里面也存在，导致重复
						var temp = metricArray[i].metric;
						if(temp == "_ret_code.RC" || temp == "_trans_ref.TT"){
							continue;
						}
    					allMetricSources.push(metricArray[i]);
    					appendTargetMetricOption(metricArray[i], selectTargetMetric, selectMetric);
    	        		appendMetricOption(metricArray[i], selectMetric);
    				}
    				$("#metric").trigger("chosen:updated");
    			    $("#metric_source").trigger("chosen:updated");
    			}
        	}
        }
	});
}
/**
 * @description 返回typeArray或某个计算方式
 * @param bool
 * @param caculation
 * @param metric	选中的指标
 */
function getTypeArrayOrText(bool, caculation, metric) {
	var typeArray;
	if (metric == "_all_bytes") {
		typeArray = [["total_second", "按秒平均"], ["count", "总数"], ["total", "合计"], ["mean", "按次平均"],
			["count_minute", "按分钟平均"], ["count_second", "按秒平均"], ["total_minute", "按分钟平均"],
			["max", "最大值"], ["min", "最小值"]];
	} else {
		typeArray = [["count", "总数"], ["total", "合计"], ["mean", "按次平均"],
			["count_minute", "按分钟平均"], ["count_second", "按秒平均"],
			["total_minute", "按分钟平均"], ["total_second", "按秒平均"],
			["max", "最大值"], ["min", "最小值"]];
	}
	if(bool){
		return typeArray;
	}else{
		for (var i = 0; i < typeArray.length; i++) {
			if(typeArray[i][0] == caculation){
				return typeArray[i][1];
			}
		}
	}
}
/**
 * @description 根据不同情况返回对应的计算类型选项
 * @param metric
 * @param type
 * @param isTopN 是pie、column、bar图时typeArry改变
 * @returns {String}
 */
function getCaculateOptions(metric,type,isTopN){
	var metricArray = [],array = [];
	var typeArray = getTypeArrayOrText(true, null, metric);
	if(isTopN){
		typeArray = [["count","总数"],["total","合计"],["mean","按笔平均"]];
	}
	for(var k=0; k<allMetricSources.length; k++) {
		if (allMetricSources[k] !=null && allMetricSources[k].metric == metric) {
			metricArray = allMetricSources[k].calculations;//指标支持的计算类型
			break;
        }
    }
	for(var t = 0; t<typeArray.length; t++) {
		for(var j = 0; j<metricArray.length; j++) {
		    if(typeArray[t][0] == metricArray[j]){
		    	array.push(typeArray[t]);
		    }
		}
	}
	if(array.length == 0){
		array.push(typeArray[0]);
	}
	var optionStr = "";
	for (var i = 0; i < array.length; i++) {
		var subunit = "";
		if(array[i][0] == "count_minute" || array[i][0] == "total_minute"){
			subunit = "m";
		}
		if(array[i][0] == "count_second" || array[i][0] == "total_second"){
			subunit = "s";
		}
		optionStr += "<option subunit='"+subunit+"' value='"+array[i][0]+"' "+
			(type==array[i][0]?'selected=selected':'')+">"+array[i][1]+"</option>";
	}
	return optionStr;
}

/**
 * @description 设置计算方式和数据的显示隐藏
 * @param selectType
 */
function setCaculateType(selectType){
	var metric = $("#metric").find("option:selected").val();
	var display_type = $("input[name='display_type']:checked").val();
	var $type = $("#type");
	var type = $type.find("option:selected").val();
	if(selectType){
		type = selectType;
	}
	$type.empty();
	if(display_type == "plotArea" || display_type == "plotMutiLine"){
		$type.append(getCaculateOptions(metric,type,false));
		$(".js-series-color").show();
		$(".dataRangeDiv").hide();
	}else{
		$type.append(getCaculateOptions(metric,type,true));
		$(".js-series-color").hide();
		$(".dataRangeDiv").show();
	}
	if(metric != "_success_rate" &&  metric != "_response_rate" &&  metric != "_busi_success_rate"){
		$type.attr("disabled",false);
		$type.chosen({no_results_text:"没有匹配项", allow_single_deselect:false,disable_search: true});
	}else{
		$type.attr("disabled",true);
	}
	$type.trigger("chosen:updated");
}

/**
 * @description 返回系统图表处理参数
 */
function returnSystemDefParam(module_type){
    var streamId =  null;
    if(module_type == M0DULE_TYPE_DASHBOARD){//如果是仪表盘中新增
    	streamId = $("#widget_streamIds").val();
    }
	return {
    	monitorIds : $("#widget_type").val(),
		streamIds : (module_type==M0DULE_TYPE_DASHBOARD) ? streamId:""
	};
}

/**
 * @description 返回自定义图表处理参数
 */
function returnCustomDefParam(module_type){
	var $metric = $("#metric");						//指标
	var $type = $("#type");							//指标后面的select
	var $seriesColor = $("#seriesColor");
	var $metricStreamIds = $("#metric_streamIds");	//流
	var metric_value = $metric.val();
	var type = $type.val();
	var $display_type = $("input[name='display_type']:checked"); //展现方式
	var visible = $(".dataRangeDiv").is(":visible");//数据和数据范围是否可见
	var streamId = $metricStreamIds.val();
	var selectedColor = $seriesColor.val();			//线条颜色
	var firstColor = $seriesColor.find("option:first").val();
	var monitorCondition = {};
	var metric_source = null;
	//标题
	var title = $("#metricTitleInput").val();
	if($.trim(title).length < 1) {
		title = $metric.find(":selected").text();
	}

	if(visible){
		var $dataRange = $("#data_range");			//数据范围
		monitorCondition.topN = $dataRange.val();
		metric_source = $("#metric_source").find("option:selected").val();//数据
		var order = $dataRange.find("option:selected").attr("order");
		if(order == "reverse"){
			monitorCondition.orderType = order+"_"+type;
		}else{
			monitorCondition.orderType = type;
		}
	}
	var label = $metric.find("option:selected").text();
	if($type.attr("disabled") == undefined){
		var typeText = $type.find("option:selected").text();
		label = label + (typeText == null ? "" : typeText);
	}
	monitorCondition.label = label; //指标标题
	var unit = $metric.find("option:selected").attr("unit");
	var subunit = $type.find("option:selected").attr("subunit"); //分 、秒
	var array = type.split("_");
	monitorCondition.type = array[0]; //计算方式
	if(array.length > 1){
		monitorCondition.average = array[1];
		if(unit != null && unit != ""){
			unit = unit + "/" + subunit;
		}
	}
	monitorCondition.unit = (unit != null ? unit : ""); //单位
	if(visible){
		monitorCondition.metric = metric_source;
		monitorCondition.target_metric = metric_value;
	}else{
		monitorCondition.metric = metric_value;
	}
	var $filterCondition = $("#filter_condition");
	if($filterCondition.val() != null && $filterCondition.val() != ""){
		monitorCondition.condition = $filterCondition.val();
	}
	if((module_type==M0DULE_TYPE_DASHBOARD) && (streamId != "" && streamId != null)){
		monitorCondition.streamId = streamId;
	}
	if(monitorCondition.metric == "_success_count"  || monitorCondition.target_metric == "_success_count"){
		monitorCondition.successtype = 1;
	}
	if(monitorCondition.metric == "_response_count"  || monitorCondition.target_metric =="_response_count"){
		monitorCondition.responsetype = 1;
	}
	if($(".js-series-color").is(":visible") && selectedColor && selectedColor != firstColor){
		monitorCondition.seriesColor = selectedColor;
	}

	var monitorConditionArray = [];
	monitorConditionArray.push(monitorCondition);

	var widgetMonitor = {};
	widgetMonitor.calculate_type = $display_type.attr("calculate_type");
	widgetMonitor.display_type = $display_type.val();
	widgetMonitor.title = $.trim(title)==""?"未命名":$.trim(title);//标题;
	widgetMonitor.monitorConditions = monitorConditionArray;
	var streamNames = "";
	$metricStreamIds.find("optgroup > option:selected").each(function(){
		if(streamNames.length > 0){
			streamNames += ",";
		}
		streamNames += $(this)[0].label;
	});
	return {
		streamIds : (module_type==M0DULE_TYPE_DASHBOARD)?streamId:null,
		streamNames : (module_type==M0DULE_TYPE_DASHBOARD)?streamNames:"",
		monitorid : $("#monitorId").val(),
		widgetInfoId : $("#widgetInfoId").val(),
		monitorJson : JSON.stringify(widgetMonitor)
	};
}

/**
 * @description 初始化弹出框各Tab页
 */
function resetWidgetForm(){
    //系统图表Tab页面
    var $widgetStreamIds = $("#widget_streamIds");//流
    $widgetStreamIds.val("");
    $widgetStreamIds.find("optgroup > option").each(function () {
        $(this).removeAttr("disabled");
    });
    if ($widgetStreamIds.length > 0) {
        setWidgetMonitors();
        disabledOption();
    }
    $("#widget_type").val("");			//指标

    //自定义图表Tab页面
    $("#widgetInfoId").val("");		//input hidden
    $("#monitorId").val("");			//input hidden
    $("#metricTitleInput").val(""); 	//标题
    $("#metric_streamIds").val(""); 	//流
    $("#filter_condition").val("");	//过滤条件
    $("#data_range").val("");			//数据范围
    $("#metric_source").val("");       //数据来源

    $("input[name='display_type']:first").attr("checked", "checked");//展现方式
    var $type = $("#type");				//指标第二个select
    var type_chosen = $("#type_chosen");
    if (type_chosen.length > 0) {
        $type.chosen('destroy');
        $type.hide();
    }
    setMetricSource();
    setCaculateType();
    $type.find("option:first").attr("selected", true);
    var $seriesColor = $("#seriesColor");
    $seriesColor.simplecolorpicker('selectColor', $seriesColor.find("option:first").val());
    $(".chzn-select-widget, .chzn-select-widget-stream, .chzn-select-data-range").trigger("chosen:updated");
}

/**
 * 系统图表Tab页：验证4个特殊指标的图表(即specialChart)只能添加一个
 */
function disabledOption(){
	var $widgetType = $("#widget_type");
	var widgetTypeOptions = $widgetType.find("option");
	if(GLOBAL_PARAMS.module_type != M0DULE_TYPE_DASHBOARD){
		widgetTypeOptions = $widgetType.find("optgroup > option");
	}
	widgetTypeOptions.each(function(){
		var option = $(this);
		if(option.attr("value") == "node_count_latency_success_response"){
			if($("#special_chart").is(":visible")){
				option.attr("disabled","disabled");
			}else{
				option.removeAttr("disabled");
			}
			return true;
	   }
	});
	$widgetType.trigger("chosen:updated");
}

/**
 * @description 新增图表
 * @param {String} module_type 	仪表盘或仪表盘模板
 * @param {String} id			仪表盘id
 */
function addWidget(module_type,id) {
	if($("#lenged_def").hasClass("active")){ //当前是否为编辑label
		if(!editWidgetLabel(module_type)){
			return false;
		}
	}else{
		var defaultParam = { colspan:1, rowspan:1, module_type:module_type};
		var selectDashboardId = $("#dashboardshow").find("option:selected").attr("value");
		if(selectDashboardId){
	    	id = selectDashboardId;
	    }
	    if($("#system_def").hasClass("active")){
	    	if(module_type == M0DULE_TYPE_DASHBOARD){
				var $widgetStreamIds = $("#widget_streamIds");
				var widgetStreamIds = $widgetStreamIds.val();
				$widgetStreamIds.next().qtip('destroy');//删除上次错误信息
		    	if( widgetStreamIds== "" || widgetStreamIds == null){
					validateCheckForm.showErrorOfQtip($widgetStreamIds.next(), "请选择流，不超过10个");
		    		return false;
		    	}
	    	}
			var $widgetType = $("#widget_type");
			var widgetType = $widgetType.val();
			$widgetType.next().qtip('destroy');//删除上次错误信息
	    	if(widgetType == "" || widgetType == null){
				validateCheckForm.showErrorOfQtip($widgetType.next(), "请选择指标，不超过10个");
	    		return false;
	    	}
	    	var param = $.extend(defaultParam, returnSystemDefParam(module_type));//系统图表参数
	    	postParam(id,param,"addSystemWidget");
	    }else{
	    	var titleObj = $("#metricTitleInput");
			titleObj.qtip('destroy');//删除上次错误信息
	        if($.trim(titleObj.val()).length > 30){
				validateCheckForm.showErrorOfQtip(titleObj, "添加失败，最大长度30");
	        	titleObj.focus();
	            return false;
	        }
	        if(module_type == M0DULE_TYPE_DASHBOARD){
				var $metricStreamIds = $("#metric_streamIds");
				var metricStreamIds = $metricStreamIds.val();
				$metricStreamIds.qtip('destroy');//删除上次错误信息
		    	if(metricStreamIds == "" || metricStreamIds == null){
					validateCheckForm.showErrorOfQtip($metricStreamIds.next(), "请选择流");
		    		return false;
		    	}
	    	}
	        //验证过滤器
			var $filterCondition = $("#filter_condition");
			var isValid = $filterCondition.ezhelper("checkQueryValid", $filterCondition.val());
			if(!isValid){
				return false;
			}
	    	var param_ = $.extend(defaultParam, returnCustomDefParam(module_type));//自定义图表参数
	    	postParam(id,param_,"addCustomWidget");
	    }
	}
}
/**
 * @description 发送请求
 * @param id		仪表盘id
 * @param param		图表相关参数
 * @param type 		自定义图表/系统图表
 */
function postParam(id,param,type){
    GMS.loading();
    $.ajax({
    	url :  SUBSYSTEM_APP_NAME+"dashboards/"+ id +"/"+type,
    	type : "post",
    	data : param,
        success : function (data) {
        	if(data.success){
        		var widgetInfos = data.obj.widgetInfos;
	        	if(data.obj.isEditWidget){
	        		editWidgetCallback(widgetInfos[0], id, param.module_type);
	        	}else{
					for (var wi = 0; wi < widgetInfos.length; wi++) {
	     			   addWidgetCallback(widgetInfos[wi], id, param.module_type);
	     			}
	        	}
	        	GMS.success();
        	}else{
                GMS.error();
                return false;
        	}
        }
    });
}
/**
 * @description 新增图表回调函数
 * @param widgetinfo	图表信息
 * @param id			仪表盘id
 * @param module_type	仪表盘/仪表盘模板
 */
function addWidgetCallback(widgetinfo, id, module_type){
	widgetArr.push(widgetinfo);
	var display_type = widgetinfo.monitor.display_type;
	if(display_type != "plotValueText"){
		appendWidget(widgetinfo,id,module_type,true);
	    var options = $.extend(dashboardOpts, {isEditDashboard : true, columns : GLOBAL_PARAMS.columns});
	    $("#"+sortableId).fDashboard(options);
	}else{
		$("#special_chart, #delete_special_chart").show();
		bindDelelteSpecialChartEvent(widgetinfo, id, module_type);
	}
	var searchParam = (module_type == M0DULE_TYPE_DASHBOARD ? getParam() : GLOBAL_PARAMS.templateSearchParam);
    if(display_type == "plotValueText"){
    	getValueText(searchParam, widgetinfo);
    }else if(display_type == "plotList"){
    	getList(searchParam, widgetinfo);
    }else{
    	getChart(searchParam, widgetinfo);
    }
}
/**
 * @description 根据仪表盘是否可编辑更新菜单
 * @param widgetinfo		单个图表信息
 * @param id				仪表盘ID
 * @param module_type		仪表盘或者模板
 * @param isEditDashboard	仪表盘是否处于可编辑状态
 */
function updateWidgetMenu(widgetinfo, id, module_type, isEditDashboard){
	var $widget = $("#"+widgetinfo.infoId);
	var editSpan = generateDropDownMenu(getExtendOptions(getWidgetOptions(widgetinfo, isEditDashboard)));
	$widget.find(".chart-menu").remove();
	$widget.find("div.widget-title").after(editSpan);
	bindMenuEvents(widgetinfo, id ,module_type, isEditDashboard);
}
/**
 *@description 编辑自定义图表
 * @param widgetinfo	单个图表信息
 * @param id			仪表盘ID
 * @param module_type	仪表盘或者模板
 */
function editWidgetCallback(widgetinfo,id,module_type){
	//修改标题 标题为指标@流
	var spanTile = $("#"+widgetinfo.infoId+" div:first-child > .title-sp");
	var text = widgetinfo.monitor.monitorConditions[0].label;
	var title = text + "@" +widgetinfo.streamNames;
	$(spanTile).attr("title",title).html(widgetinfo.title.escapeHTML());
	//重置菜单
	updateWidgetMenu(widgetinfo, id, module_type, true);
	for (var wi = 0; wi < widgetArr.length; wi++) {
        if (widgetArr[wi].infoId == widgetinfo.infoId){
        	widgetArr[wi] = widgetinfo;
        	var searchParam = (module_type == M0DULE_TYPE_DASHBOARD ? getParam() : GLOBAL_PARAMS.templateSearchParam);
        	if(widgetArr[wi].monitor.display_type == "plotList"){
				getList(searchParam, widgetArr[wi]);
			}else{
				$("#g"+widgetinfo.infoId).removeClass("ue-mtable-container").addClass("chart");//处理由表格改为chart时的样式问题
				getChart(searchParam, widgetArr[wi]);
		    }
        	break;
        }
    }
}
/**
 * @description 编辑图表的label
 * @param module_type
 */
function editWidgetLabel(module_type){
	var widget_id = $("#monitorId").val();
	var infoId = $("#widgetInfoId").val();
	var conditionArray = [];
	var bool = true, msg = "", labelObj = null;
	$.each($("#label_edit_table").find("> tbody > tr"),function(){
		var condition = {};
		var tds = $(this).find("td");
		labelObj = $(tds[2]).find("input");
		if($.trim(labelObj.val()) == ""){
			msg = "不能为空!";
			labelObj.val("");
			return bool = false;
		}
		if($.trim(labelObj.val()).length > 30){
			msg = "标签名称长度"+$.trim(labelObj.val()).length+",超出限制!最大长度30!";
			return bool = false;
		}
		condition.label = $.trim(labelObj.val());
		conditionArray.push(condition);
	});
	labelObj.qtip('destroy');//删除上次错误信息
	if(!bool){
		validateCheckForm.showErrorOfQtip(labelObj, "请填写标签名称，不超过30字符");
		labelObj.focus();
	}else{
		var widgetMonitor = {};
		widgetMonitor.monitorConditions = conditionArray;
		$.ajax({
			url : SUBSYSTEM_APP_NAME+"dashboards/editWidgetLabel",
	    	type : "post",
	    	data : {
	    		widget_id : widget_id,
	    		conditionsJson : JSON.stringify(widgetMonitor)
	        },
	        success : function (data) {
	            if (data.success) {
	            	var widgetinfo = getWidgetInfoById(infoId);
	            	if(data.obj != null){
	            		widgetinfo.monitor = data.obj;
	            	}
	            	widgetinfo.chart = null;
	            	var searchParam = (module_type == M0DULE_TYPE_DASHBOARD ? getParam() : GLOBAL_PARAMS.templateSearchParam);
	            	getChart(searchParam, widgetinfo);
	            	GMS.success("编辑成功");
	            } else {
	            	GMS.error();
	            }
	        }
	    });
	}
	return bool;
}

/**
 * @description 图表resize时更新图表
 * @param {Object} $item		单个widgetDiv
 * @param {String} type			resize
 * @param {String} id			仪表盘id
 * @param {String} module_type 仪表盘或仪表盘模板
 */
function updateWidget($item, type,id,module_type) {
    if (type == "resize") {
        $.ajax({
        	url : SUBSYSTEM_APP_NAME+"dashboards/"+id+"/updateWidget",
        	type : "post",
        	data : {
                colspan:$item.attr("colspan"),
                rowspan:$item.attr("rowspan"),
                infoid:$item.attr("id"),
                module_type:module_type
            },
            success : function (data) {
                if (data.success) {
                	var widgetinfo = getWidgetInfoById($item.attr("id"));
                	if(widgetinfo && widgetinfo.chart){
                		var chart = widgetinfo.chart;
                		chart.legend.update({width : chart.chartWidth/2});
                	}
                	widgetinfo.colspan = $item.attr("colspan");
                	widgetinfo.rowspan = $item.attr("rowspan");
                    GMS.success("更新widget成功");
                } else {
                    GMS.error("更新widget失败");
                }
            }
        });
    }
}

/**
 * @description 删除图表
 * @param {Object} widgetInfo
 * @param {String} id
 * @param {String} module_type 仪表盘或仪表盘模板
 * @param {boolean} bool
 */
function deleteWidget(widgetInfo,id,module_type, bool) {
    GMS.loading("删除图表");
    $.ajax({
		url : SUBSYSTEM_APP_NAME+"dashboards/"+id+"/delWidget",
		type : "post",
		data : {
	        infoid:widgetInfo.infoId,
	        module_type : module_type
	    },
		success : function (data) {
	        if (data.success) {
	            widgetArr.splice(jQuery.inArray(widgetInfo,widgetArr), 1);// 在选中的widget中移出当前widget
	            if(bool){
	            	$("#special_chart").hide();
	            }else{
	            	$("#" + widgetInfo.infoId).remove();
	            }
	            GMS.success("删除图表成功");
	        }else {
	            GMS.error("删除图表失败");
	        }
	    }
	});
}

/**
 * @description 图表排序
 * @param {String} id
 * @param {String} module_type 仪表盘或仪表盘模板
 */
function sortWidget(id,module_type) {
    GMS.loading("排序中");
    var saveArray = [];
    $("#"+sortableId).find(".widget_s").each(function () {
        saveArray.push($(this).attr("id"));
    });
    $.ajax({
    	url : SUBSYSTEM_APP_NAME+"dashboards/"+id+"/sortWidget",
    	type : "post",
    	data : {
              sortarry:saveArray,
              module_type : module_type
        },
        success : function (data) {
            if (data.success) {
                GMS.success("已保存排序信息");
            }else {
                GMS.error("排序失败");
            }
        }
    });
}

/**
 * @description 图表合并
 * @param {String} id
 * @param {String} module_type 仪表盘或仪表盘模板
 * @param {String} sourceWidgetInfoId 源widget ID
 * @param {String} targetWidgetInfoId 目标widget ID
 */
function mergerWidget(id,module_type,sourceWidgetInfoId,targetWidgetInfoId){
	$.ajax({
    	url : SUBSYSTEM_APP_NAME+"dashboards/"+id+"/mergerWidget",
    	type : "post",
    	data : {
    		sourceWidgetInfoId:sourceWidgetInfoId,
    		targetWidgetInfoId:targetWidgetInfoId,
            module_type : module_type
        },
        success : function (data) {
        	reloadDashboard(module_type,id);
            if (data.success) {
                GMS.success("合并成功");
            }else {
                GMS.error(data.msg==undefined?"合并失败":data.msg);
            }
        }
    });
}
/**
 * @description 仪表盘/仪表盘模板 编辑工具条
 */
function setToolBar(parent){
	$(".float-tools-bar").draggable({
		cursor: "move",
		handle: ".hold-bar",
		axis : "x"
	});

	$(".float-tools-bar > * > a").live("click",function(){
		if($(this).find("i").hasClass("icon-plus")){
			return;
		}
		var tools_bar = $(".float-tools-bar");
		var tools_area = $(".tools-area");

		var _container = $(this).parents(parent);
		var cont_padding_r = _container.css("padding-right").replace("px","") - 0;
		var cont_padding_l = _container.css("padding-left").replace("px","") - 0;
		var cont_width = _container.width() + cont_padding_r + cont_padding_l;
		var tools_width = tools_bar.width();
		var tools_top = tools_bar.css("top");
		var tools_left = tools_bar.css("left");
		if(tools_left != "auto"){
			var _left = tools_left.replace("px","");
			var _right = cont_width - tools_width - 2 - _left;
			tools_bar.removeAttr("style");
			tools_bar.attr("style","top:"+ tools_top +"; width:"+ tools_width +"px; right:"+ _right +"px;");
		}

		if($(this).find("i").hasClass("icon-ok")){
			tools_bar.removeClass("open");
			tools_area.stop().animate({
				'width': '0px'
			});
			tools_bar.stop().animate({
				'width': '40px'
			});
			return;
		}
		if($(this).find("i").hasClass("icon-wrench")){
			tools_bar.addClass("open");
			tools_area.stop().animate({
				'width': '270px'
			});
			tools_bar.stop().animate({
				'width': '310px'
			});
		}
	});
}

/**
 * @description 按id获取widgetInfo
 * @param id
 * @returns
 */
function getWidgetInfoById(id) {
	for (var wi = 0; wi < widgetArr.length; wi++) {
        if (widgetArr[wi].infoId == id)
            return widgetArr[wi];
    }
    return undefined;
}
/**
 * @description 按widget_id获取widgetInfo
 * @param widget_id
 * @returns
 */
function getWidgetInfoByWidgetId(widget_id) {
	if(widget_id != null && widget_id != ""){
		for (var wi = 0; wi < widgetArr.length; wi++) {
	        if (widgetArr[wi].monitor.widget_id == widget_id)
	            return widgetArr[wi];
	    }
	}
    return undefined;
}

/**
 * @description 获取4个指标值
 * @param param
 * @param widgetinfo
 */
function getValueText(param, widgetinfo){
    if(param instanceof Object){  //通过JS OBJECT传递参数
	   	param.widget_id = widgetinfo.monitor.widget_id;
	   	if(widgetinfo.stream_id){
	   		param.stream_id = widgetinfo.stream_id;
	   	}
    }
    $.ajax({
    	url  : SUBSYSTEM_APP_NAME + "visuals/widgetProcess",
    	type : "post",
    	data : param,
        success : function (res) {
	       	if(res.success){
	       		if(res.data && res.data.length > 0){
	       			$("#_transCount").text(res.data[0].transCount);
	       			$("#_latencyMsec").text(res.data[0].latencyMsec.toFixed(2));
	       			$("#_successRate").text(res.data[0].successRate);
	       			$("#_responseRate").text(res.data[0].responseRate);
	       		}
	       	}
	    }
     });
}

/**
 * @description 获取最慢SQL数据列表
 * @param param			参数
 * @param widgetinfo	单个图表信息
 */
function getSlowSqlList(param, widgetinfo) {
	var $widgetDiv = $("#" + widgetinfo.infoId);
	$widgetDiv.addClass("onload-list").removeClass("no-data-list search-error-list");
	if(param instanceof Object){  //通过JS OBJECT传递参数
		param.widget_id = widgetinfo.monitor.widget_id;
		if(widgetinfo.stream_id){
			param.stream_id = widgetinfo.stream_id;
		}
	}
	$.ajax({
		url  : SUBSYSTEM_APP_NAME + "visuals/widgetProcess",
		type : "post",
		data : param,
		success : function (res) {
			if(res.success){
				if(res.data && res.data.length > 0){
					fillSlowSqlList(res.data, widgetinfo);
				}else{
					$widgetDiv.find(".js-slow-sql-table").empty();
					$widgetDiv.addClass("no-data-list");
				}
			}else{
				$widgetDiv.find(".js-slow-sql-table").empty();
				$widgetDiv.addClass("search-error-list");
			}
			$widgetDiv.removeClass("onload-list");
		}
	});
}

/**
 * @description 填充sql List
 * @param dataArray
 * @param {Object} widgetinfo
 */
function fillSlowSqlList(dataArray, widgetinfo){
	var $widgetDiv = $("#" + widgetinfo.infoId);
	var element = $widgetDiv.find(".js-slow-sql-table");
	if(element.length == 0){
		$widgetDiv.append("<div id='g"+widgetinfo.infoId+"' " +
			"class='ue-mtable-container js-slow-sql-table'></div>");
	}
	var slowSqlTable = $widgetDiv.find(".js-slow-sql-table");
	var newList = null;
	if(slowSqlTable.find("table").length == 0){
		newList = $("#slowSqlTableList").clone();
		newList.attr("id", "slowSqlTableList_" + widgetinfo.infoId);
	}else{
		newList = slowSqlTable.find("table");
	}
	newList.find("tbody").remove();

	var trs = "";
	for (var i = 0; i < dataArray.length; i++) {
		var slowSqlObj = dataArray[i];
		var title = slowSqlObj.SQL.replaceAll("\'", "");
		trs += "<tr><td title=\'"+ title +"\'>" + slowSqlObj.SQL + "</td>";
		trs += "<td>" + (slowSqlObj.DBUser == null ? "--" : slowSqlObj.DBUser) + "</td>";
		trs += "<td>" + (slowSqlObj.DB == null ? "--" : slowSqlObj.DB) + "</td>";
		trs += "<td>" + slowSqlObj._latency_msec.toFixed(2)+" ms</td>";
		trs += "</tr>";
	}
	newList.append("<tbody>"+trs+"</tbody>");
	slowSqlTable.append(newList.show());
}

/**
 * @description 获取数据列表
 * @param param			参数
 * @param widgetinfo	单个图表信息
 * @param sortFlag		类型为List点击thead时排序用
 */
function getList(param, widgetinfo, sortFlag){
	if(!sortFlag){
		$("#g"+ widgetinfo.infoId).remove();
	}
	var $widgetDiv = $("#" + widgetinfo.infoId);
	$widgetDiv.addClass("onload-list").removeClass("no-data-list search-error-list");
    if(param instanceof Object){  //通过JS OBJECT传递参数
	   	param.widget_id = widgetinfo.monitor.widget_id;
	   	if(widgetinfo.stream_id){
	   		param.stream_id = widgetinfo.stream_id;
	   	}
    }
    var tableObj = $widgetDiv.find(".js-table-chart > table");
    if(tableObj && tableObj.length > 0){
    	param.order =  tableObj.find(".sort-icon.active").attr("order");
    	param.orderType = tableObj.find(".sort-icon.active").attr("type");
	}
	$.ajax({
    	url  : SUBSYSTEM_APP_NAME + "visuals/widgetProcess",
    	type : "post",
    	data : param,
        success : function (res) {
	       	if(res.success){
	       		if(res.data && res.data.length > 0){
	       			fillList(res.data, widgetinfo, param);
	       		}else{
					$widgetDiv.find(".js-table-chart").empty();
					$widgetDiv.addClass("no-data-list");
	       		}
	       	}else{
				$widgetDiv.find(".js-table-chart").empty();
				$widgetDiv.addClass("search-error-list");
	       	}
			$widgetDiv.removeClass("onload-list");
	    }
     });
}
/**
 * @description 填充List
 * @param dataArray
 * @param {Object} widgetinfo
 * @param {Object} param
 */
function fillList(dataArray, widgetinfo, param){
	var metric = widgetinfo.monitor.monitorConditions[0].metric;
	var target_metric = widgetinfo.monitor.monitorConditions[0].target_metric;
	var $widgetDiv = $("#" + widgetinfo.infoId);
	var element = $widgetDiv.find(".js-table-chart");
	if(element.length == 0){
		$widgetDiv.append("<div id='g"+widgetinfo.infoId+"' " +
		"class='ue-mtable-container js-table-chart'></div>");
	}
	var tableChart = $widgetDiv.find(".js-table-chart");
	var newList = null;
	if(tableChart.find("table").length == 0){
		newList = $("#tableListChart").clone();
		newList.attr("id", "tableListChart_" + widgetinfo.infoId);
		//排序
		newList.find(".sort-th").toggle(function() {
			newList.find(".sort-icon.up, .sort-icon.down").removeClass("active");
			$(this).find(".sort-icon.down").addClass("active");
			getList(param, widgetinfo, true);
		}, function() {
			newList.find(".sort-icon.up, .sort-icon.down").removeClass("active");
			$(this).find(".sort-icon.up").addClass("active");
			getList(param, widgetinfo, true);
		});
	}else{
		newList = tableChart.find("table");
	}
	var head = newList.find("thead > tr > th");
	var targetHeatText = appendHead(target_metric);
	$(head[0]).find(".js-table-head").text(appendHead(metric));
	$(head[1]).find(".js-table-head").text(targetHeatText).attr("title", targetHeatText);
	newList.find("tbody").remove();

	var trs = "";
	for (var i = 0; i < dataArray.length; i++) {
		var termSensitive = dataArray[i].termSensitive;
		var termObj = dataArray[i].term;
		var contentText = "", contentTitle = "";
		if(termSensitive ){
			contentTitle = termSensitive;
			contentText = termSensitive;
		}else if(typeof termObj == "object") {//对象
			contentTitle = termObj.value;
			contentText = termObj.value_rename;
		}else{
			contentTitle =  termObj;
			contentText =  termObj;
		}
		trs += "<tr><td title='"+contentTitle +"'>"+contentText+"</td>";
		var num;
		if((/^[0-9]*[1-9][0-9]*$/).test(dataArray[i].value)){
			num = dataArray[i].value;
		}else{
			num = dataArray[i].value.toFixed(2);
		}
		trs += "<td title='"+ num +"'>"+num+"</td>";
		trs += "<td>"+dataArray[i].percentage+" %</td>";
		trs += "<td>"+(dataArray[i].successRate == null ? "--" : dataArray[i].successRate)+" %</td>";
		trs += "<td>"+(dataArray[i].responseRate == null ? "--" : dataArray[i].responseRate)+" %</td>";
		trs += "<td>"+dataArray[i].latencyMean.toFixed(2)+" ms</td>";
		trs += "</tr>";
	}
	newList.append("<tbody>"+trs+"</tbody>");
	tableChart.append(newList.show());
}
/**
 * @description 返回表头
 * @param {String} metric
 */
function appendHead(metric){
	var splitArray = metric.split(".");
	if(splitArray.length >1){
		if(metric == "_trans_ref.TT"){
			return "交易类型";
		}
        if(metric == "_ret_code.RC"){
            return "返回代码";
        }
		if(splitArray[0] == "_ret_code"){
			metric = "返回代码." + splitArray[1];
		}
		if(splitArray[0] == "_ret_code_x"){
			metric = "返回参数." + splitArray[1];
		}
		if(splitArray[0] == "_trans_ref"){
			metric = "交易参数." + splitArray[1];
		}
		return metric;
	}else{
		var th = "";
		for (var i = 0; i < allMetricSources.length; i++) {
			if(allMetricSources[i] != null && allMetricSources[i].metric == metric){
				th = allMetricSources[i].title;
				break;
			}
		}
		return th=="" ? metric : th;
	}
}
/**
 * @description 填充chart
 * @param {Object} widgetinfo
 * @param {Object} json
 */
function fillChart(widgetinfo, json) {
	if(widgetinfo.monitor != null){
		var unit = widgetinfo.monitor.monitorConditions[0].unit;
		json.unit = unit == null?"":" "+unit;
		json.calculate_type = widgetinfo.monitor.calculate_type;
	    widgetinfo.chart = drawByType(json, widgetinfo.monitor.display_type, "g" + widgetinfo.infoId, widgetinfo.chart);
	}
}

/**
 * @description 获取图表
 * @param {Object} param  图表查询参数
 * @param {Object} widgetinfo
 */
function getChart(param, widgetinfo) {
	var $infoId = $("#g" + widgetinfo.infoId);
	$infoId.removeClass("no-data search-error");
	if(!$infoId.attr("style")){ //自定义图表将List改为Chart类型后设置高度
		var height = $("#" + widgetinfo.infoId).height();
		$infoId.attr("style","height:"+ height + "px");
	}
     if (widgetinfo.chart == null) {
         fillChart(widgetinfo, {"data":[]});
     }
     if (widgetinfo.chart != null) {
    	 widgetinfo.chart.showLoading();
    	 if(param && param.addPoint != false){ //判断在切换SI时图表不使用自动加点
    		 autoAddPointParam(param, widgetinfo);
    	 }else{
    		 widgetinfo.chart.isAddPoint = false;
    	 }
    	 var json = JSON.stringify(param);
    	 var newParam = jQuery.extend(true, {}, JSON.parse(json)); //复制一份参数
    	 widgetinfo.chart.conditions.queryObj = newParam;  		   //将参数放入chart中
         var url = SUBSYSTEM_APP_NAME + "visuals/widgetProcess";
         if(param instanceof Object){  //通过JS OBJECT传递参数
        	 newParam.widget_id = widgetinfo.monitor.widget_id;
        	 if(widgetinfo.stream_id){
        		 newParam.stream_id = widgetinfo.stream_id;
        	 }
         }
         $.ajax({
         	url :  url,
         	type : "post",
         	data : newParam,
            success : function (data) {
            	if(data.success){
            		json = data;
                    fillChart(widgetinfo, json);
            	}else{
            		widgetinfo.chart.conditions.queryObj = null;
            		$("#g" + widgetinfo.infoId).addClass("search-error");
            	}
            	widgetinfo.chart.hideLoading();
            }
          });
     }
}

/**
 * @description 自动加点条件判断
 * @param param 参数
 * @param widgetinfo
 */
function autoAddPointParam(param, widgetinfo){
	var calculate_type = widgetinfo.monitor.calculate_type;
	var queryObj = widgetinfo.chart.conditions.queryObj;
	var series = widgetinfo.chart.series;
	var bool = true, isAddPoint = false;
	if(calculate_type != "graphic_muti_line" && calculate_type != "graphic_special_muti_line"
			&& calculate_type != "src_tcp_count-distogram"){
		bool = false;	  //不属于折线图、区域图以及x轴是日期类型的柱状图没有加点需求
	}
	if(series == null || series.length == 0){
		bool = false;	  //图表无数据时没有加点需求
	}else{
		if(series[0].data && series[0].data.length == 0){
			bool = false;
		}
		var conditionLength = widgetinfo.monitor.monitorConditions.length;
		if(conditionLength < series.length){
			bool = false; //当图标原始条件数小于实际数据个数时不能加点(如交易类型分布等动态生成condition的图)
		}
	}
	if(bool && queryObj != undefined){
		var max = 0;
		for (var i = 0; i < series.length; i++) {//按series中最小的时间作为max，处理基线的时间与普通数据线的时间不一致的问题
			var seriesData = series[i].data;
			if(seriesData && seriesData.length >0){
				var x = (seriesData[seriesData.length-1].x)/1000;
				if(max == 0 || max > x){
					max = x;
				}
			}
		}
		if((param.currentSelectRange != undefined && param.currentSelectRange != "自定义") &&
				(param.currentSelectRange == queryObj.currentSelectRange) &&
					(param.interval == queryObj.interval) && (param.from <= queryObj.to)){
			param.preFrom = (max < param.from) ? param.from : max;
			isAddPoint = true;
		}else{
			param.preFrom = null;
		}
	}else{
		param.preFrom = null;
	}
	widgetinfo.chart.isAddPoint = isAddPoint;
}
/**
 * @description 更新仪表盘数据
 * @param {Object} param 查询条件
 */
function updateDashboardData(param) {
	GLOBAL_PARAMS.templateSearchParam = param;
	if(widgetArr && widgetArr.length > 0){
		for (var widgetIndex = 0; widgetIndex < widgetArr.length; widgetIndex++) {
			if(widgetArr[widgetIndex].monitor){
				if(widgetArr[widgetIndex].monitor.display_type == "plotValueText"){
					getValueText(param, widgetArr[widgetIndex]);
				}else if(widgetArr[widgetIndex].monitor.calculate_type == "graphic_slow_sql_top_list"){
					getSlowSqlList(param, widgetArr[widgetIndex]);
				}else if(widgetArr[widgetIndex].monitor.display_type == "plotList"){
					getList(param, widgetArr[widgetIndex]);
				}else{
			    	getChart(param, widgetArr[widgetIndex]);
			    }
		    }
	     }
	}
}

/**
 * @description 返回options
 * @param widgetinfo		单个图表信息
 * @param isEditDashboard	仪表盘是否处于可编辑状态
 */
function getWidgetOptions(widgetinfo,isEditDashboard){
	var opts;
	opts = {
	        close_text:"删除",
	        max_able : true,
	        edit_able : false,
	        stream_name:widgetinfo.streamNames,
	        monitorid:widgetinfo.monitor.widget_id,
	        monitorType:widgetinfo.monitor.type,
	        widgetid:widgetinfo.infoId,
	        colspan:widgetinfo.colspan,
	        rowspan:widgetinfo.rowspan,
	        display_type:widgetinfo.monitor.display_type,
	        title:widgetinfo.title,
	        close_able : isEditDashboard == true,
	        range_able : true,
	        exportLinkId : "export_"+widgetinfo.infoId,
	        label: widgetinfo.monitor.monitorConditions[0].label  //指标名称
	    };
	return opts;
}

/**
 * @description 根据id添加一个widget
 * @param {Object} widgetinfo
 * @param {String} id
 * @param {String} module_type
 * @param {Boolean} isEditDashboard
 */
function appendWidget(widgetinfo,id,module_type,isEditDashboard) {
	var opts = getWidgetOptions(widgetinfo,isEditDashboard);
    $("#"+sortableId).append(generateWidget(opts));
    //title为指标@流
    var text = opts.label;
	var title = text + (opts.stream_name == null ? "" : "@" + opts.stream_name);
    $("#"+opts.widgetid+" div:first-child > .title-sp").attr("title",title).html(opts.title.escapeHTML());
    widgetinfo.chart = null;
    bindMenuEvents(widgetinfo,id,module_type,isEditDashboard);
}

/**
 * @description 绑定图表右侧菜单事件处理
 * @param widgetinfo		单个图表信息
 * @param id				仪表盘ID
 * @param module_type		仪表盘或者模板
 * @param isEditDashboard	仪表盘是否处于可编辑状态
 */
function bindMenuEvents(widgetinfo, id, module_type, isEditDashboard){
	var $widget = $("#" + widgetinfo.infoId);
	var $chartMenu = $widget.find("div.chart-menu");
	//弹出图表
	$chartMenu.find("a.single-widget-btn").die('click').live("click", function (event) {
		singleWidgetClick(widgetinfo, event.ctrlKey);
	});
	//绑定仪表盘钻取事件
    $chartMenu.find("a.dimension-btn").bind("click", function (event) {
    	dimensionBtnClick(widgetinfo.chart, widgetinfo.stream_id, module_type, event.ctrlKey);
    });
    //还原时间范围
	$chartMenu.find("a.js-reset-btn").die('click').live("click", function () {
		resetBtnClick($(this), widgetinfo.chart);
    });
	 //定位所选时间
	$chartMenu.find("a.js-use-selection-range").die('click').live("click", function () {
		useSelectionRangeClick($(this), widgetinfo.chart);
	});
    //绑定编辑事件
    $('#edit_' + widgetinfo.monitor.widget_id).die('click').live('click', function () {
    	$("#system_def_li").parent().hide();
    	$("#system_def").removeClass("active");
    	$("#myModalLabel").text("编辑图表");
    	if(widgetinfo.monitor.monitorConditions.length > 1){ //处理合并后的图表
    		$("#custom_def").removeClass("active");
    		$("#lenged_def").addClass("active");
    		loadMonitorConditions(widgetinfo,module_type);
    	}else{
    		$("#custom_def").addClass("active");
    		$("#lenged_def").removeClass("active");
        	loadWidgetMonitor(widgetinfo);
    	}
    });
    //绑定删除事件
    $('#c' + widgetinfo.infoId).die('click').live('click', function () {
    	showConfirm({
			confirmTitle:"删除确认",
			confirmText:"确定要删除这个图表吗？",
			confirmBtnText:"确定",
			cancelBtnText:"取消",
			confirmCallback:function() {
				deleteWidget(widgetinfo, GLOBAL_PARAMS.id, module_type);
			},
			cancelCallback:function() {
			}
		});
    });
    //编辑title
	$widget.find("span.title-sp").die('dblclick').live("dblclick",function(){
    	if(isEditDashboard){
			var item = $(this);
			var titileArray = item.attr("title").split("@");
			var widgetTitle = item.find(".js-widget-title");
			if(widgetTitle.length <= 0){
				var style = "'margin-bottom: 0px;height: 18px; width:90%; line-height:18px;margin-top: -2px;'";
				item.html("<input style="+ style + " type='text' class='input-large js-widget-title' value='" + item.text() + "'>");
			}
			item.find(".js-widget-title").focus();
			item.find(".js-widget-title").unbind("keyup").bind("keyup",function(e) {
				if(e.keyCode == 50){
					var titleObj = item.find('.js-widget-title');
					var text = titleObj.val();
					text = text + (widgetinfo.streamNames != undefined ? widgetinfo.streamNames : '');
					titleObj.val(text);
				}
                if(e.keyCode == 13){
                	updateWidgetTitle(GLOBAL_PARAMS.id, item, titileArray, module_type);
				}
            });
			item.find(".js-widget-title").bind("blur",function(){
				updateWidgetTitle(GLOBAL_PARAMS.id, item, titileArray, module_type);
            });
    	}
    });
    //绑定导出事件(已失效)
    $("#export_"+widgetinfo.infoId).die('click').live("click",function(){
    	widgetinfo.chart.exportChart({
			type: 'image/jpeg',
			url : CHART_EXPORT_URL
		});
    });
}
/**
 * @description 打开单个图表
 * @param widgetinfo 图表对象
 * @param ctrlKey
 */
function singleWidgetClick(widgetinfo, ctrlKey){
	var $dateTime = $("#date-time");
	var selectedRange = $dateTime.daterangepicker("getSelectedRange");
	if (null === selectedRange || "" == selectedRange || "自定义" == selectedRange) {
		selectedRange = "";
	}
	var rangesType = $dateTime.daterangepicker("getRangesType");
	var name = widgetinfo.title;//图表title值
	var url = SUBSYSTEM_APP_NAME+"dashboards/singleWidget?widget_name="+encodeURIComponent(encodeURIComponent(name));
	var title = widgetinfo.monitor.monitorConditions[0].label + (widgetinfo.streamNames == null ? "" : "@" + widgetinfo.streamNames); //图表title
	url += "&widget_title=" + encodeURIComponent(encodeURIComponent(title)); 
	var conditions = widgetinfo.chart.conditions;
	if(conditions && conditions.queryObj){
		delete conditions.queryObj.currentSelectRange;
		url += "&" + $.param(conditions.queryObj);
	}else{
		var min = Math.floor($dateTime.daterangepicker("getStartDate").getTime() / 1000);
        var max = Math.floor($dateTime.daterangepicker('getEndDate').getTime() / 1000);
        url += "&from=" + min + "&to=" + max + "&interval=" + GLOBAL_INTERVAL;
	}
	if (null != selectedRange && "" != selectedRange) {
		url += "&currentSelectRange=" + encodeURIComponent(encodeURIComponent(selectedRange));
	}
	if(rangesType != null && rangesType != ""){
		url += "&rangestype=" + rangesType;
	}
	openWindow(url, ctrlKey);
}
/**
 * @description 绑定仪表盘和仪表盘模板钻取的事件
 * @param {Object} chart
 * @param {String} stream_id
 * @param {String} module_type
 */
function dimensionBtnClick(chart, stream_id, module_type, ctrlKey){
    // 如果在相隔两秒的间隔内，max要保证在下一秒
	var max = (Math.floor(chart.xAxis[0].getExtremes().max / 1000 / GLOBAL_INTERVAL) + 1) * GLOBAL_INTERVAL;
    var min = (Math.floor(chart.xAxis[0].getExtremes().min / 1000 / GLOBAL_INTERVAL) + 1) * GLOBAL_INTERVAL;
    if(isNaN(max) || isNaN(min)){
    	var now = Math.floor(new Date().getTime()/1000);
    	max = now-60;
    	min = now;
    }
    var url = SUBSYSTEM_APP_NAME + "dimension/messageanalysis?";
    var conditions = chart.conditions;
    var series = chart.series;
    var queryObj = conditions.queryObj;
	if(module_type== M0DULE_TYPE_DASHBOARD){//仪表盘使用时
		var streamId_ = getStreamIdsBySeries(series);
		var interval = $("#timeScale").val();
        url += "interval=" + interval +"&from=" + min + "&to=" + max
        	   +"&stream_id="+ (streamId_=="" ? stream_id : streamId_);
        var querystring = getQueryStringBySeries(series);
        if(querystring != "" && querystring != null){
        	url += "&querystring=" + querystring;
        }
        url += getMetricNameBySeries(series, conditions);
	}else{
		url += "from=" + max+"&to="+ min;
		var streamId = "";
		if(conditions.widget_type != 2){ //处理节点类型的图表
			streamId = getStreamIdsBySeries(series);
			streamId = (streamId == "" ? conditions.streamId : streamId);
		}else{
			if(queryObj.stream_id_additional !=null && queryObj.stream_id_additional.length > 0){
				streamId = queryObj.stream_id_additional;
			}
		}
		if(streamId != null){
			url += "&stream_id=" + streamId;
		}else{
			url += "&stream_type=0";
		}
		url = getDrillDownConditions(conditions, url, getQueryStringBySeries(series), null);
		url += getMetricNameBySeries(series, conditions);
	}
    openWindow(url, ctrlKey);
}
/**
 * @description 恢复图表
 * @param _this 点击的按钮对象
 * @param chart 图表对象
 */
function resetBtnClick(_this, chart){
	if (!_this.hasClass("disabled")) {
        chart.zoomOut();
        var yAxisArray = chart.yAxis;
        for(var i=0; i<yAxisArray.length; i++){
        	chart.yAxis[i].setExtremes(yAxisArray[i].dataMin);//解决有正负Y轴的图在Zoom后还原不正常的问题
        }
        _this.addClass("disabled");
        _this.siblings("a.js-use-selection-range").addClass("disabled");
   }
}
/**
 * @description 使用图表选中的时间
 * @param _this 点击的按钮对象
 * @param chart 图表对象
 */
function useSelectionRangeClick(_this, chart){
	if (!_this.hasClass("disabled")) {
		 _this.addClass("disabled");
	     _this.siblings("a.js-reset-btn").addClass("disabled");
		 var min = chart.xAxis[0].getExtremes().min;
		 var max = chart.xAxis[0].getExtremes().max;
	     jQuery.event.trigger("ezupdatetime", [new Date(min), new Date(max)]);
	}
}

/**
 * @description 更新title
 * @param {String} id 仪表盘或仪表盘模板Id
 * @param {Object} item  title-sp span对象
 * @param {Array} titileArray 标题数组 [0]标题 [1]@流名称
 * @param {String} module_type 模块
 */
function updateWidgetTitle(id, item, titileArray, module_type){
	var titleObj = item.find(".js-widget-title");
	var titleVal = $.trim(titleObj.val()), bool = true, msg = "";
	if(titleVal == ""){
		msg = "标题不能为空!";
		titleObj.val("").focus();
		bool = false;
	}
	if(titleVal.length > 50){
		msg = "标签名称长度"+titleVal.length+",超出限制!最大长度50!";
		titleObj.focus();
		bool = false;
	}
	if(!bool){
		GMS.error(msg, 3000);
		return bool;
	}

	var selectId = $("#dashboardshow").find("option:selected").attr("value");
    if(selectId){
    	id = selectId;
    }
    var infoId = item.parents(".widget_s").attr("id");

    //title为指标@流
	var hoverTip = getWidgetInfoById(infoId).monitor.monitorConditions[0].label + (titileArray[1] != undefined ? "@" + titileArray[1] : "");
	item.attr("title", hoverTip).text(titleVal);
	item.find(".js-widget-title").remove();

	$.ajax({
    	url : SUBSYSTEM_APP_NAME+"dashboards/"+id+"/updateWidget",
    	type : "post",
    	data : {
            title : titleVal,
            infoid : infoId,
            colspan : 0,
            rowspan : 0,
            module_type : module_type
        },
        success : function (data) {
        	if (data.success) {
        		var widgetinfo = getWidgetInfoById(infoId);
        		if(widgetinfo && widgetinfo.monitor && widgetinfo.monitor.type == 3){//自定图表
        			widgetinfo.monitor.title = titleVal;
        		}
                GMS.success("标题更新成功");
            } else {
                GMS.error("标题更新失败");
            }
        }
     });
}

/**
 * @description 加载monitor_condition 编辑label
 * @param {String} widgetinfo
 * @param {String} module_type
 */
function loadMonitorConditions(widgetinfo,module_type){
	if(widgetinfo != null){
		$("#monitorId").val(widgetinfo.monitor.widget_id);
		$("#widgetInfoId").val(widgetinfo.infoId);
		var condtionArray = widgetinfo.monitor.monitorConditions;
		if(condtionArray != null && condtionArray.length > 0){
			$("#label_edit_table > tbody").empty();
			var html = "";
			for(var i in condtionArray){
		  		if(module_type == M0DULE_TYPE_DASHBOARD){
		  			var streamId = (condtionArray[i].streamId==null?"":condtionArray[i].streamId);
	    			var streamName = "";
	    			$("#metric_streamIds").find("optgroup > option").each(function(i){
	    				var option = $(this);
	    				var val = option.attr("value");
	    				if(val == streamId){
	    					streamName = option.text();
	    				}else{
	    					for(var j in streamId){
	    						if(val == streamId[j] && streamName.indexOf(option.text()) < 0){
	    							if(streamName.length > 0){
	    								streamName += ",";
	    							}
	    	    					streamName += option.text();
	    	    				}
	    					}
	    				}
	    			});
		  			html+="<tr><td style='width:200px;'>"+ streamName.escapeHTML() +"</td>";
		  		}else{
		  			html+="<tr><td style='display:none;'></td>";
		  		}
	  			html += "<td style='width:220px;'>"+ (condtionArray[i].condition == null ? "" : condtionArray[i].condition) +"</td>";
	  			html += "<td><input type='text' style='width:220px;' value='"+condtionArray[i].label+"' ></td></tr>";
			}
			$("#label_edit_table > tbody").append(html);
		}
    } else {
        GMS.error();
    }
}

/**
 * @description 编辑图表，加载图表数据
 * @param widgetinfo
 */
function loadWidgetMonitor(widgetinfo){
    var monitor = widgetinfo.monitor;
    var monitorCondition = monitor.monitorConditions[0];
    var streamId = (widgetinfo.stream_id == null?null:widgetinfo.stream_id);
    	streamId = (streamId == null ? monitorCondition.streamId : streamId);
    $("#widgetInfoId").val(widgetinfo.infoId);
    $("#monitorId").val(monitor.widget_id);
    $("#metricTitleInput").val(monitor.title); //标题
    if(monitorCondition.seriesColor){
    	$("#seriesColor").simplecolorpicker('selectColor', monitorCondition.seriesColor); //颜色
    }
    //设置流ID
	setMetricStreamIds(streamId,"metric_streamIds");

    $("#filter_condition").val(monitorCondition.condition);//过滤条件
    setMetricSource(monitorCondition.target_metric,monitorCondition.metric);
	if(monitorCondition.target_metric){
		$("#metric").val(monitorCondition.target_metric);//指标
	}else{
		$("#metric").val(monitorCondition.metric);//指标
	}
    $("input[type='radio'][value='"+monitor.display_type+"']").attr("checked","checked");//展示方式
    var type = monitorCondition.type;
    if(monitorCondition.average != null){
    	type += "_"+monitorCondition.average;
    }
    setCaculateType(type);
    if(monitor.display_type != "plotArea" && monitor.display_type != "plotMutiLine"){
		$("#metric_source").val(monitorCondition.metric);
		var orderTypeArray = monitorCondition.orderType.split("_");
		if(orderTypeArray[0] == "reverse"){
			$("#data_range option[value='"+monitorCondition.topN+"'][order='"+orderTypeArray[0]+"']").attr("selected", true);
		}else{
			$("#data_range option[value='"+monitorCondition.topN+"'][order='asc']").attr("selected", true);
		}
	}
    $(".chzn-select-widget,.chzn-select-widget-stream, .chzn-select-data-range").trigger("chosen:updated");
}
/**
 * 导出图表按钮点击事件
 * @param saveType	1:PDF	2:WORD
 */
function exportChart(saveType) {
	exportChartDetail(saveType);
}
/**
 * 获得需要导出的图表信息
 */
function getExportChart() {
	var svgs = {};
	svgs.svgs = [];
	for (var i = 0, k = 0; i < widgetArr.length; i++) {
		var temp = widgetArr[i];
		if(temp.chart){//列表和specialChart没有chart属性
			svgs.svgs[k++] = {
				widget: temp.chart.getSVG(),
				title: temp.title,
				style: {
					width:temp.chart.chartWidth,
					height:temp.chart.chartHeight
				}
			};
		}
	}
	svgs.url = SUBSYSTEM_APP_NAME + "svgdownload/download";
	svgs.title = $("#dashboardshow").find("option:selected").text().trim();
	return svgs;
}
/**
 * 导出图表
 * @param saveType	1:PDF	2:WORD
 */
function exportChartDetail(saveType){
	var svgs = getExportChart();
	var chartArrayLen = svgs.svgs.length;//可导出的图表信息
	if(!chartArrayLen){
		GMS.error("没有可以导出的图表",3000);
		return false;
	}
	var reg = new RegExp("(fill|stroke)=\"rgba\\((\\d+,\\s*\\d+,\\s*\\d+),\\s*([\\d|\\.]+)\\)\"","g");
	var reg1 = new RegExp("(fill):rgba\\((\\d+,\\s*\\d+,\\s*\\d+),\\s*([\\d|\\.]+)\\)","g");
	var reg2 = new RegExp("rgba\\((\\d+,\\s*\\d+,\\s*\\d+),\\s*([\\d|\\.]+)\\)","g");
	var $form = $("#exportForm");
	var $svglen = $("#svglen");
	var $title = $("#title");
	$svglen.val(svgs.svgs.length);
	$title.val(svgs.title);
	for (var i = 0; i < chartArrayLen; i++) {
		$("<input class='js-add-input' type=\"hidden\" name=\"svg" + i + "\" />")
			.val(svgs.svgs[i].widget.replace(reg, '$1="rgb($2)" $1-opacity="$3"')
				.replace(reg1, '$1:rgb($2);$1-opacity:$3')
				.replace(reg2, 'rgb($1)')).appendTo($form);
		$("<input class='js-add-input' type=\"hidden\" name=\"svg" + i + "width\" />")
			.val(svgs.svgs[i].style.width).appendTo($form);
		$("<input class='js-add-input' type=\"hidden\" name=\"svg" + i + "height\" />")
			.val(svgs.svgs[i].style.height).appendTo($form);
		$("<input class='js-add-input' type=\"hidden\" name=\"svg" + i + "title\" />")
			.val(svgs.svgs[i].title).appendTo($form);
	}
	var url = svgs.url + "?svgtype=" + saveType;
	$form.prop("action", url).submit();
	$form.find(".js-add-input").remove();//清空上次添加的内容,以备下次导出
	$svglen.val("");
	$title.val("");
}
/**
 * $selector.val("值")
 * 因为同个流可以属于不同的业务路径下
 * 所以不能直接用上述方式直接设置值，不然会造成设置多个相同的值。
 * @param streamId	select所需要设置的值
 * @param selectId	select对应的ID
 */
function setMetricStreamIds(streamId, selectId) {
	var $select = $("#" + selectId);
	$select.find("optgroup > option").each(function () {//先清除所有之前选中的流
		$(this).removeAttr("selected");
	});
	for (var i in streamId) {
		$select.find("optgroup > option").each(function () {
			var option = $(this);
			if (option.val() == streamId[i]) {
				option.attr("selected", "selected");
				return false; //找到一个后直接返回，处理一个流同时属于多个业务路径的问题
			}
		});
	}
	setStreamOptionState(selectId);
}