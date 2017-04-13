/**
 * highCharts全局设定
 */
var highChartsGlobalOptions = {
	chart : {
		backgroundColor: "rgba(255,255,255,0)",
		style: {
			fontFamily: '"Lucida Grande", "Lucida Sans Unicode", Helvetica, Arial, Microsoft yahei,sans-serif'
		}
	},
	exporting :{
		enabled : false
	},
	loading:{
		style:{
			position: 'absolute',
			backgroundColor: 'rgba(0,0,0,0)',
			opacity: 1,
			textAlign: 'center'
		}
	},
	lang : {
		months : [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11',
				'12' ],
		shortMonths : [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
				'11', '12' ],
		weekdays : [ '星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六' ],
		loading : '<img src="' + APP_NAME + 'resources/images/loading.gif"/>',
		rangeSelectorZoom: ""
	},
	colors:['#24bef2','#1ec772','#fc264a',
            '#f5ba25','#ef5374','#16c3b3','#B5CA92','#A47D7C','#d85e3d','#38d49f'],
//	colors:['#4f9bf1','#ef5374','#be5fd7',
//            '#DB843D','#92A8CD','#F36044','#A47D7C','#B5CA92','#16c3b3','#d85e3d','#38d49f'],
	title : {
		align : "left",
        text : "",
        margin: 35,
        useHTML : true
	},
	legend : {
		itemStyle: {
			fontFamily : 'Verdana, sans-serif',
			fontWeight : 'normal',
			color : SELECTED_THEME == "black" ? COLOR_THEME[SELECTED_THEME].textColor[3] : "" //主题为黑色，legend颜色改为白色
		}
	},
	tooltip :{
		hideDelay: 0
	},
	xAxis : {
		lineColor : TEXT_COLOR_LEVEL["3"],
		gridLineColor: TEXT_COLOR_LEVEL["4"],
		minorGridLineColor: TEXT_COLOR_LEVEL["3"],
		tickColor: TEXT_COLOR_LEVEL["3"],
		tickLength : 5,
		labels: {
			style : {
				fontSize : (isTVModel ? 0.55 * rootFontSize : '11') + "px",
				color : TEXT_COLOR_LEVEL["3"]
			}
		},
		dateTimeLabelFormats : {
			millisecond : '%H:%M:%S',
			second : '%H:%M:%S',
			minute : '%H:%M',
			hour : '%H:%M',
			day : '%b/%e',
			week : '%b/%e',
			month : '%y/%b',
			year : '%Y'
		}
	},
    yAxis: {
    	lineColor : TEXT_COLOR_LEVEL["3"],
		minorGridLineColor: TEXT_COLOR_LEVEL["4"],
    	gridLineColor : TEXT_COLOR_LEVEL["4"],
		labels: {
		     style: {
		    	 fontSize: (isTVModel ? 0.55 * rootFontSize : '11') + "px",
		         color:TEXT_COLOR_LEVEL["3"]
		     }
		  },
		title: {
		   style: {
			   fontSize: (isTVModel ? 0.5 * rootFontSize : '12') + "px",
			   color: TEXT_COLOR_LEVEL["3"],
			   fontWeight: 'normal'
		   }
		}
    },
	global : {
		useUTC : false
	},
	credits : {
		enabled : false
	}
};

function ezDrawLegendSymbol(legend, item){
	item.legendSymbol = this.chart.renderer.rect(
		0,
		legend.baseline -  7 + (isTVModel ? (rootFontSize - 20) * 0.25 : 0),
		isTVModel ? 0.3 * rootFontSize : 6,
		isTVModel ? 0.3 * rootFontSize : 6,
		0
	).attr({
		zIndex: 3
	}).add(item.legendGroup);	
}

function HighChartsGlobalSetting() {
	Highcharts.seriesTypes['area'].prototype.drawLegendSymbol = ezDrawLegendSymbol;
	Highcharts.seriesTypes['line'].prototype.drawLegendSymbol = ezDrawLegendSymbol;
	Highcharts.seriesTypes['pie'].prototype.drawLegendSymbol = ezDrawLegendSymbol;
	Highcharts.seriesTypes['column'].prototype.drawLegendSymbol = ezDrawLegendSymbol;
	Highcharts.seriesTypes['bar'].prototype.drawLegendSymbol = ezDrawLegendSymbol;
	Highcharts.seriesTypes['spline'].prototype.drawLegendSymbol = ezDrawLegendSymbol;
	Highcharts.seriesTypes['areaspline'].prototype.drawLegendSymbol = ezDrawLegendSymbol;

	Highcharts.setOptions(highChartsGlobalOptions);
	//更新legend
	Highcharts.Legend.prototype.update = function (options) {
        this.options = Highcharts.merge(this.options, options);
        if(this.chart){
        	this.chart.isDirtyLegend = true;
            this.chart.isDirtyBox = true;
            this.chart.redraw();
        }
    };
}

function adaptiveData(data, chart)
{
	// 判断，是否当前的数据series中，只有一个点
	var flag = true;
	for (var i = 0; i < data.length; i++)
	{
		if(chart != null){
			var series = chart.series.length == 0 ? null : chart.series[i];
			if(series && series.data.length == 1){
				flag = true;
			}
			if(chart.isAddPoint){ //自动加点时不处理
				flag = false;
			}
		}
		// 遍历所有series
		if (flag && (data[i].data != null && data[i].data.length == 1))
		{
			var changedData = [{x:data[i].data[0][0], y:data[i].data[0][1], marker:{enabled:true}}];
			data[i].data = changedData;
		}	
	}
	return data;
}

/**
 * 添加指标
 * @param data
 * @param chart
 * @param changeAxisFontSize 是否要改变x,y轴的文字大小
 * @returns
 */
function addDataWithAddedyAxis(data, chart, changeAxisFontSize) {
	if (data != null) {
		data = adaptiveData(data, chart);
		if (chart.series.length == 0) { // 第一次添加数据
			setSeriesAndyAxis(data,chart,changeAxisFontSize);
			chart.redraw();
		} else{					        // 在已经存在数据的chart上面更新数据
			if(chart.isAddPoint){	    // 自动加点
				$.each(data, function(i, value) {
					var r = value.data;
					var	seriesObj = chart.series[i];
					var seriesData = seriesObj.data;
					if(seriesData.length > 1){
						for (index in r) {
							var x = seriesData[seriesData.length-1].x;
							if(r[index][0] != x && r[index][0] > x){ //判断point不被重复添加
								seriesObj.addPoint([r[index][0], r[index][1]], true, true);
							}else if(r[index][0] == x){
								seriesData[seriesData.length-1].update([r[index][0], r[index][1]], true);
								seriesData[seriesData.length-1].dataIsChanged = false;
							}
						 }
					}else{
						if(r && r.length >0){
							seriesObj.setData(r, true);
						}
					}
					setyChartPropertys(value,chart,i);
				});
				chart.redraw();
			}else{
				if(data!= null && data.length < chart.series.length){//当数据个数小于chart的series个数时(处理交易类型分布、响应率分布等动态生成condition的图)
					for(var i = chart.series.length; i >= data.length; i--){
						if(chart.series[i]){
							chart.series[i].remove();//删除掉大于实际数据个数的series
						}
					}
				}
				chart.zoomOut();
				$(".widget_s").find("div.chart-menu").find("a.js-reset-btn,a.js-use-selection-range").addClass("disabled");
				setSeriesAndyAxis(data, chart, changeAxisFontSize);
				chart.legend.update({width : chart.chartWidth/2});
				chart.redraw();
			}
		}
	}
	return chart;
}

/**
 * @description 返回动态添加的Series和Y轴
 * @param {Array} data 数据
 * @param {Object} chart 
 * @param {boolean} changeAxisFontSize 是否要改变x,y轴的文字大小
 */
function setSeriesAndyAxis(data,chart,changeAxisFontSize){
	var haveLeftyAxis = false;
	$.each(chart.yAxis, function(i, yAxis){
		if(yAxis.side == 3){
			haveLeftyAxis = true; 	//是否包含左边的Y轴
		}
	});
	$.each(data, function(i, l) {
		var y = (l.yAxis == undefined ? 0 : l.yAxis);
		if(y && y > 0){
			if(chart.yAxis[y] == null){
				var newyAxis = newAxis(y, l.unit);
				if(!haveLeftyAxis){ //不包含左边的Y轴时添加为左边Y轴
					newyAxis = getGolobalOptions(l.unit).yAxis[0];
				}else{
					$.each(chart.axes, function(i, e) {
				        e.isDirty = true; 
				    });
					if(chart.margin){
						chart.margin[1] = y * ((changeAxisFontSize != null)? 55 : 50);  //多Y轴时调整图表右侧边距
					}else{
						chart.optionsMarginRight = y * ((changeAxisFontSize != null)? 55 : 50);;
					}
				}
				chart.addAxis(newyAxis);
			}
		}
		var changed = chart.yAxis[y].dataIsChanged;
		chart.yAxis[y].update({id : y, index : y, title : { text : l.unit }}); //修改Y轴的id与数据对应
		chart.yAxis[y].dataIsChanged = changed;
		if(changeAxisFontSize != null){		//修改x,y轴labels的size
			chart.yAxis[y].options.labels.style.fontSize = changeAxisFontSize;
			chart.xAxis[0].options.labels.style.fontSize = changeAxisFontSize;
			if(chart.yAxis[y].userOptions.labels){
				chart.yAxis[y].userOptions.labels.style = {fontSize:changeAxisFontSize};
			}
			if(chart.xAxis[0].userOptions.labels){
				chart.xAxis[0].userOptions.labels.style = {fontSize:changeAxisFontSize};
			}
			chart.yAxis[y].options.showLastLabel = true;
			chart.yAxis[y].userOptions.showLastLabel = true;
		}
		var seriesObj = chart.series[i];
		if(seriesObj != null && seriesObj != undefined){
			if(seriesObj.name == l.name){
				seriesObj.setData(l.data, true);
			}else{
				seriesObj.update(l, true); //处理编辑图表时series改变的问题
			}
			seriesObj.isUpdateAllData = true;  //当前chart在更新全部数据
		}else{
			chart.addSeries(l, true);
		}
		setyChartPropertys(l,chart,i);
	});
}

/**
 * 动态设置chart的属性
 * @param l
 * @param chart
 * @param index
 */
function setyChartPropertys(l, chart, index){
	handleSuccessResponseRate(l, chart, index); //处理成功率和响应率
	var negativeValue = 0;  //negativeValue：小于0的最小值
	if(l.data && l.data.length>0){
		for(var i=0; i<l.data.length; i++){
			var yValue = 0;
			if(l.data.length > 1 || chart.isAddPoint){//处理单个点和多个点不同的数据格式
				yValue = l.data[i][1];
			}else{
				yValue = l.data[i].y;
			}
			if(yValue < 0 && yValue < negativeValue){
				negativeValue = yValue;	 	 //取得数据中小于0的最小值
			}
		}
	}
	if(chart != null){
		var y = (l.yAxis == undefined ? 0 : l.yAxis);
		var yAxisMin = chart.yAxis[y].min;
		if((negativeValue !=0 && yAxisMin != undefined) && negativeValue < yAxisMin){
			chart.yAxis[y].setExtremes(negativeValue); //根据返回的数据动态设置Y轴的最小值
		}
		if(l.streamId){
			chart.series[index].streamId = l.streamId;  //设置series对应的流
		}
		if(l.querystring){
			chart.series[index].querystring = l.querystring; //查询条件
		}
		if(l.metric_name){
			chart.series[index].metric_name = l.metric_name;//指标
		}
		if(l.calculation){
			chart.series[index].calculation = l.calculation;//计算方式
		}
		if(l.average){
			chart.series[index].average = l.average;		//平均方式
		}
		if(l.isbaseline){
			chart.series[index].isbaseline = l.isbaseline;  //基线
		}
		if(l.successType != null && l.successType != undefined){ //成功类型
			chart.series[index].successType = l.successType; 
		}
		if(l.responseType != null && l.responseType != undefined){//响应类型
			chart.series[index].responseType = l.responseType;
		}
	}
}

/**
 * @description 处理成功率和响应率
 * @param l 数据
 * @param chart
 * @param index
 */
function handleSuccessResponseRate(l, chart, index){
	var metric = chart.series[index].metric_name;
    var y = (l.yAxis == undefined ? 0 : l.yAxis);
    var newOptions = {};
	if(l.metric_name == "_response_rate" || l.metric_name == "_success_rate" || l.metric_name == "_busi_success_rate"
			|| metric == "_response_rate" || metric == "_success_rate" || metric == "_busi_success_rate"){//判断成功率或响应率Y轴显示问题
		var isChanged = setValue(l, chart); //数据是否被改变
		newOptions.title = chart.yAxis[y].options.title;
		newOptions.id = chart.yAxis[y].options.id;
		newOptions.index = chart.yAxis[y].options.index;
		newOptions.showLastLabel = true;
		newOptions.max = 100;
		if(isChanged){//改变Y轴的状态
			newOptions.tickPositions = [0, 50, 100];
			newOptions.labels = {
				formatter : function() {
					if(this.value == 50){
						this.value = 90;
					}
					return this.value;
				}
			};
		}
		var yOptions = $.extend(chart.yAxis[y].userOptions, newOptions);
		chart.yAxis[y].update(yOptions);
		chart.yAxis[y].dataIsChanged = isChanged;
	}else{
        newOptions = chart.yAxis[y].userOptions;
        var dataIsChanged = chart.yAxis[y].dataIsChanged;
        if(dataIsChanged){
            delete newOptions.max;
            delete newOptions.tickPositions;
            newOptions.labels = {
                formatter : function() {
                    return ez_formatter(Math.abs(this.value), 0);
                }
            };
            chart.yAxis[y].update(newOptions);
        }
        chart.yAxis[y].dataIsChanged = false;
    }

}
/**
 * @description 设置转换的值
 * @param l 数据
 * @param chart
 */
function setValue(l, chart){
	var maxValue = 0;
	for(var i=0; i<l.data.length; i++){
		var n = l.data[i][1];
		if(n != null){
			maxValue = (maxValue == 0) ? n : maxValue;
			if(maxValue < n){					
				maxValue = n;		 //取得数据中的最大值
			}
		}
	}
	var yIndex = (l.yAxis == undefined ? 0 : l.yAxis);
	if(maxValue > 90 || chart.yAxis[yIndex].dataIsChanged){//最大值大于90
		var seriesArray = chart.yAxis[yIndex].series;
		for(var i = 0; i < seriesArray.length; i++){
			var seriesObj = seriesArray[i];
			for(var j=0; j < seriesObj.data.length; j++){
				var data = seriesObj.data[j];
				if(seriesObj.isUpdateAllData){ //如果当前series的数据被全部更新则之前对数据的修改失效
					data.dataIsChanged = false; 
				}
				if(data.dataIsChanged){
					continue;
				}
				var n = data.y;
				if(n != null && n != undefined){
					if(n <= 90){
						n = n/90 * 50;
					}else{
						n = (n-90)/(100 - 90) * 50 + 50;
					}
					data.y = n;
					data.dataIsChanged = true;
				}
			}
			seriesObj.dataIsChanged = true;
			seriesObj.isUpdateAllData = false; //数据被改后将更改状态改变，否则会二次修改
		}
		return true;
	}
	return false;
}

/**
 * @description 返回y轴对象
 * @param yAxis
 * @param unit
 * @returns {yAxis}
 */
function newAxis(yAxis, unit){
	var yAxis = {
        id: yAxis,
        title: {
            text: unit,
			align : 'high',
			rotation : 360,
			y : -15,
			offset : 20,
			margin : 100
        },
        min : 0,
		minRange: 1,
        opposite: true,
        showLastLabel : false,
		labels : {
			formatter : function() {
				return ez_formatter(Math.abs(this.value), 0);
			}
		}
    };
	return yAxis;
}

/**
 * 判断图表是否存在真实的数据
 * @param data
 * @param chart 自动加点时不判段
 * @returns {Boolean}
 */
function haveRealData(data, chart){
	if(chart != null && chart.isAddPoint){//自动加点时不处理
		return true;
	}
	var flag = false;
	if(data != null && data.length > 0){
		$.each(data,function(i,l){
			var dataArray = l.data;
			if(dataArray && dataArray.length > 0){
				flag = true;
				var count = 0;
				for(var i in dataArray){
					var val = dataArray[i].y;
					if(val == null){
						val = dataArray[i][1];
					}
					if(val == null){ 
						count ++;
					}
				}
				if(count == dataArray.length){ //判断值全部为null的情况
					flag = false;
				}
				return !flag; //如果有一个序列的值不为空就跳出循环
			}
		});
	}
	return flag;
}
/**
 * 多线图
 * @param chart
 * @param data
 * @param renderTo 
 * @param unit 图表单位
 * @param showLegend是否显示legend
 * @param range_callback 图表上的selection事件处理
 * @param changeAxisFontSize 是否要改变x,y轴的文字大小
 * @returns
 */
function plotMutiLine_HC(chart, data, renderTo,unit, showLegend, range_callback, changeAxisFontSize) {
	if (chart == null) {
		var options = getMutiLineOptions(renderTo,unit,showLegend,range_callback);
		data = adaptiveData(data);
		options.series = data;
		chart = new Highcharts.Chart(options);
	} else {
		if(haveRealData(data, chart)){
			setChartHasData(renderTo);
			chart = addDataWithAddedyAxis(data, chart, changeAxisFontSize);
		}else{
			setChartNoData(renderTo, chart);
		}
	}
	return chart;
}

/**
 * 多线堆积图
 * 曲线与x轴有颜色填充
 * @param chart
 * @param data
 * @param renderTo
 * @param unit
 * @param isStack 是否需要堆积
 * @param changeAxisFontSize 是否要改变x,y轴的文字大小
 * @returns
 */
function plotMutiStackLine(chart, data, renderTo,unit,isStack, showLegend, range_callback, changeAxisFontSize) {
	if (chart == null) {
		var options = getMutiStackOptions(renderTo,unit,isStack, showLegend, range_callback);
		data = adaptiveData(data);
		options.series = data;
		chart = new Highcharts.Chart(options);
	} else {
		if(haveRealData(data, chart)){
			setChartHasData(renderTo);
			chart = addDataWithAddedyAxis(data, chart, changeAxisFontSize);
		}else{
			setChartNoData(renderTo, chart);
		}
	}
	return chart;
}

/**
 * 柱状图
 * @param chart
 * @param data
 * @param renderTo
 * @param unit
 * @param calculate_type
 * @returns
 */
function plotColumn_HC(chart, data, renderTo, unit, calculate_type) {
	var xAxisIsDateTime = false;
	if(calculate_type != null && calculate_type == "src_tcp_count-distogram"){ //判断TCP并发连接数X轴为日期类型的情况
		xAxisIsDateTime = true;
		unit = "个";
	}
	var options = getColumnOptions(renderTo, unit, xAxisIsDateTime);
	if (chart == null) {
		if (data != null && !xAxisIsDateTime) {
			options.xAxis.categories = data.xData;
			options.series[0].data = data.yData;
		}
		chart = new Highcharts.Chart(options);
	} else {
		if(calculate_type != null && calculate_type == "src_tcp_count-distogram"){
			setChartHasData(renderTo);
			$.each(data,function(i,l){
				var r = l.data;
				var seriesObj = chart.series[i];
				if(chart.isAddPoint && seriesObj.data.length > 1){ //自动加点
					for (index in r) {
						var seriesData = seriesObj.data;
						var x = seriesData[seriesData.length-1].x;
						if(r[index][0] != x && r[index][0] > x){ //判断point不被重复添加
							seriesObj.addPoint([r[index][0], r[index][1]], true, true);
						}else{
							seriesData[seriesData.length-1].y = r[index][1];
						}
					}
				}else{
					if(seriesObj != null){
						seriesObj.setData(l.data, false);
					}else{
						chart.addSeries(l);
					}
				}
			});
			chart.redraw();
		}else{
			if (data != null && ((data.xData != null && data.xData.length > 0) && data.xData[0] != "n/a")) {
				setChartHasData(renderTo);
				chart.series[0].setData(data.yData, false);
				chart.xAxis[0].setCategories(data.xData, false);
				chart.redraw();
			}else{
				setChartNoData(renderTo, chart);
			}
		}
	}
	return chart;
}

/**
 * stack柱状图
 * @param chart
 * @param data
 * @param renderTo
 * @returns
 */
function plotColumnStack_HC(chart, data, renderTo,unit) {
	if (chart == null) {
		var options = getColumnStackOptions(renderTo,unit);
		chart = new Highcharts.Chart(options);
	} else {
		if (haveRealData(data)) {
			setChartHasData(renderTo);
			$.each(data,function(i,l){
				if(chart.series[i] != null){
					chart.series[i].setData(l.data, false);
				}else{
					chart.addSeries(l);
				}
			});
			chart.redraw();
		}else{
			setChartNoData(renderTo, chart);
		}
	}
	return chart;
}


/**
 * bar图
 * @param chart
 * @param data
 * @param renderTo
 * @returns
 */
function plotBar_HC(chart, data, renderTo,unit) {
	if(chart == null){
		var options = getBarOptions(renderTo,unit);
		chart = new Highcharts.Chart(options);
	}else{
		if(data != null && ((data.xData != null && data.xData.length > 0) && data.xData[0] != "n/a")) {
			setChartHasData(renderTo);
			$.each(chart.axes, function(i, e) {
		        e.isDirty = true; 
		    });
			if(chart.margin){
				chart.margin[3] = null; //有数据时重置chart的左边距
			}else{
				chart.optionsMarginLeft = null;
			}
			chart.xAxis[0].setCategories(data.xData);
			chart.series[0].setData(data.yData, false);
			chart.redraw();
		}else{
			setChartNoData(renderTo, chart);
		}
	}
	return chart;
}

/**
 * 饼图
 * @param chart
 * @param data
 * @param renderTo
 * @returns
 */
function plotPie_HC(chart, data, renderTo,unit) {
	if (chart == null) {
		var options = getPieOptions(renderTo,unit);
		options.series[0].data = data;
		chart = new Highcharts.Chart(options);
	} else {
		if (data != null && (data[0] !=null && data[0].name != "n/a")) {
			setChartHasData(renderTo);
			chart.series[0].setData(data);
		}else{
			setChartNoData(renderTo, chart);
		}
	}
	return chart;
}

/**
 * AreaRange图
 * @param chart
 * @param data
 * @param renderTo
 * @param unit
 * @returns
 */
function plotArearange_HC(chart, data, renderTo,unit) {
	var options = getArearangeOptions(renderTo,unit);
	if (chart == null) {
		data = adaptiveData(data);
		options.series = data;
		chart = new Highcharts.Chart(options);
	} else {
		if(haveRealData(data)){
			setChartHasData(renderTo);
			chart = addDataWithAddedyAxis(data, chart);
		}else{
			setChartNoData(renderTo, chart);
		}
	}
	return chart;
}

/**
 * 吞吐量和告警的图
 * 
 * @param chart
 * @param data
 * @param renderTo
 */
function plotAlarmgraph_HC(chart, data, renderTo) {
	if (chart == null) {
		var options = getAlarmGraphOptions(renderTo);
		if (data.trans_count != undefined && data.alarm_count != undefined) {
			options.series[0].data = data.trans_count;
			options.series[1].data = data.alarm_count;
		}
		chart = new Highcharts.Chart(options);
	} else {
		setChartHasData(renderTo);
		var newdata = adaptiveData(data.trans_count);
		chart.series[0].setData(newdata[0].data, false);
		chart.series[1].setData(data.alarm_count, false);
		chart.redraw();
	}
	return chart;
}

/**
 * 设置图表有数据样式
 * @param renderTo
 */
function setChartHasData(renderTo){
	$("#"+renderTo).removeClass("no-data");
	$("#"+renderTo).addClass("has-data");
}

/**
 * 设置图表无数据样式
 * @param renderTo
 */
function setChartNoData(renderTo, chart){
	$("#"+renderTo).removeClass("has-data");
	$("#"+renderTo).addClass("no-data");
	for(var i=0; i<chart.series.length; i++){
		var series = chart.series[i];
		if(series){
			series.update({"data":[],"name":" "}, true);
		}
	}
}

/**
 * 重新打包数据，用来适应柱状图的下转
 * @param json
 */
function wrapBarDrillDown(json) {
	if (json.data.length != 0) {
		for (index in json.data.yData) {
			var tempY = json.data.yData[index];
			var xValue = json.data.xData[index];
			var drillDownVlaue = null;
			if(json.data.realData && json.data.realData.length > 0){
				drillDownVlaue = json.data.realData[index];
				if(json.data.xData && json.data.xData.length == 0){
					json.data.xData = json.data.realData;
				}
			}
			json.data.yData[index] = {
				y : tempY,
				drilldown : json.metric,
				streamId : json.streamId,
				queryString : json.queryString,
				drilldownValue : drillDownVlaue == null ? xValue : drillDownVlaue
			};
		}
	}
}

/**
 * 重新打包数据，用来适应stack柱状图的钻取
 * @param json
 */
function wrapColumnStackDrillDown(json) {
	if (json.data.length != 0) {
		for (index in json.data) {
			var newDataArray = new Array();
			var seriesData = json.data[index].data;
			var drillDownValue = json.data[index].drillDownValue;
			for(var i=0; i<seriesData.length; i++){
				var dataArray = seriesData[i];
				var point = {
						x : dataArray[0],
						y : dataArray[1],
						drilldown : json.metric,
						streamId : json.streamId,
						queryString : json.queryString,
						drilldownValue : drillDownValue
				};
				newDataArray.push(point);
			}
			json.data[index].data = newDataArray;
		}
	}
}

/**
 * 根据pie图的特殊格式添加drilldown值
 * 
 * @param json
 */
function wrapPieDrillDown(json) {
	if (json.data.length != 0) {
		for (index in json.data) {
			var tempData = json.data[index];
			json.data[index] = {
				name : tempData[2]==null?tempData[0]:tempData[2],
				y : tempData[1],
				drilldown : json.metric,
				drilldownValue : tempData[0],
				queryString : json.queryString,
				streamId : json.streamId
			};
		}
	}
}

/**
 * 根据display_type选择对应的绘图函数
 * @param json
 * @param display_type
 * @param renderTo
 * @param chart
 * @returns
 */
function drawByType(json, display_type, renderTo, chart) {
	var unit = (json.unit==undefined)?"":json.unit;
	$('#' + renderTo).attr("streamId", json.streamId);
	switch (display_type) {
	case "plotStack":
		chart = plotMutiStackLine(chart, json.data, renderTo, unit, true, json.show_legend, json.range_callback, json.changeAxisFontSize);
		break;
	case "plotArea":
		chart = plotMutiStackLine(chart, json.data, renderTo, unit, false, json.show_legend, json.range_callback, json.changeAxisFontSize);
		break;
	case "plotMutiLine":
		chart = plotMutiLine_HC(chart, json.data, renderTo,unit, json.show_legend, json.range_callback, json.changeAxisFontSize);
		break;
	case "plotPie":
		wrapPieDrillDown(json);
		chart = plotPie_HC(chart, json.data, renderTo,unit);
		break;
	case "plotColumn":
		wrapBarDrillDown(json);
		chart = plotColumn_HC(chart, json.data, renderTo, unit, json.calculate_type);
		break;
	case "plotBar":
		wrapBarDrillDown(json);
		chart = plotBar_HC(chart, json.data, renderTo,unit);
		break;
	case "alarmGraph":
		chart = plotAlarmgraph_HC(chart, json.data, renderTo);
		break;
	case "plotArearange":
		chart = plotArearange_HC(chart, json.data, renderTo, unit);
		break;
	case "plotColumnStack":
		wrapColumnStackDrillDown(json);
		chart = plotColumnStack_HC(chart, json.data, renderTo,unit);
		break;
	}
	if(chart.conditions == undefined || !chart.isAddPoint){
		chart.conditions = (chart.conditions == undefined)? new Object() : chart.conditions;
		chart.conditions.streamId = json.streamId;
		chart.conditions.widget_id = json.widgetid;
		chart.conditions.metric_name = json.metric_name;
		chart.conditions.calculation = json.calculation;
		chart.conditions.average = json.average;
		chart.conditions.widget_type = json.widget_type;
	}
	return chart;
}

/**
 * @description 返回options
 * @param opts
 */
function getExtendOptions(opts){
	var defaults = {
			close_text : "关闭",
			max_able : false,
			close_able : true,
			export_able : true,
			range_able : true,
			reset_able : true,
			add_able : false,
			widget_css : "",
			widget_title_css : "",
			monitorid : "monitorid",
			add_able_monitors : [],
			widgetid : "widgetid",
			stream_name : null,
			chartid : "",
			colspan : 1,
			rowspan : 1,
			display_type : "plotMutiLine",
			title : "title"
		};
	return $.extend(defaults, opts);
}

/**
 * @description 生成下拉菜单
 * @param options
 */
function generateDropDownMenu(options){
	if (options.display_type != "plotMutiLine"
			&& options.display_type != "plotStack"
			&& options.display_type != "plotArea"
			&& options.display_type != "alarmGraph") {
		options.range_able = false;
		options.reset_able = false;
	}
	if(options.display_type == "plotList"){
		options.max_able = false;
	}
	if(options.close_able && options.monitorType == 3){
		options.edit_able = true;
	}
	var editable = false;
	if (options.max_able || options.range_able || options.reset_able
			|| options.edit_able || options.close_able) {
		editable = true;
	}
	if(SUBSYSTEM_APP_NAME.indexOf("ebank") > 0){
		options.max_able = false;
	}
	var editSpan = editable ? '<div class="float-btns layout-right layout-top vertical chart-menu">'
			+ ((!options.close_able && options.max_able) ? '<a title="弹出" class="single-widget-btn"><i class="icon-new-tab"></i></a></li>' :'')
			+ ((!options.close_able && options.range_able && canDrillDown) ? '<a title="多维分析" class="dimension-btn"><i class="icon-area-chart"></i></a></li>': '')
			+ ((!options.close_able && options.reset_able) ? '<a title="还原时间范围" class="js-reset-btn disabled"><i class="icon-repeat"></i></a>': '')
			+ ((!options.close_able && options.reset_able) ? '<a title="定位所选时间" class="js-use-selection-range disabled"><i class="icon-screenshot"></i></a>': '')
			+ (options.edit_able  ? '<a title="编辑图表" id="edit_'+ options.monitorid + '" tabindex="-1" data-toggle="modal" href="#myModal"><i class="icon-pencil"></i></a>' : '')
			+ (options.close_able ? '<a title="删除图表" id="c'+ options.widgetid + '"><i class="icon-trash"></i></a>' : '')
			+ '</div>' : '';
	return editSpan;
}
/**
 * 生成一个widget
 */
function generateWidget(opts) {
	var options = getExtendOptions(opts);
	var editSpan = generateDropDownMenu(options);
	var generatedWidget = '<div class="widget_s float-btns-container ' + options.widget_css
			+ '" monitorid="' + options.monitorid + '" id="' + options.widgetid
			+ '" colspan="' + options.colspan + '" rowspan="' + options.rowspan
			+ '">' + '<div class="widget-title"><span class="title-sp '
			+ options.widget_title_css + '">'
			+ '</span></div>'+ editSpan;
	switch (options.display_type) {
	case "plotMutiLine":
	case "plotStack":
	case "plotArea":
	case "plotStackYBytes":
	case "plotColumn":
	case "plotColumnStack":
	case "plotPie":
	case "plotBar":
	case "alarmGraph":
	case "plotArearange":
		generatedWidget += '<div id="'
				+ (options.chartid == '' ? 'g' + options.widgetid
						: options.chartid) + '" class="chart"></div>';
		break;
	}
	generatedWidget += '</div>';
	return generatedWidget;
}

(function ($) {
	HighChartsGlobalSetting();
    $.fn.fwidget = function (opts) {
        var chart = null;
        var defaults = {
            initData:[], // 初始化chart时放入的数据
            close_text:"关闭", // 关闭按钮的文字
            close_able:false, // 是否能关闭
            export_able:false, // 是否支持导出
            range_able:false, // 是否支持区间查询
            reset_able:true,
            add_able:false,
            range_function:null, // 区间查询执行的方法（会传入两个参数，max和min 都是毫秒数）
            widget_css:"", // 整个widget的自定义的样式
            widget_title_css:"", // widget的title的样式
            monitorid:"monitorid", // 可选
            add_able_monitors:[], // 可添加的指标
            chartid:"chartid", // chart所在div的id 同一页面的不同chart的这个id必须唯一
            display_type:"plotMutiLine", // chart类型
            title:"title", // 标题
            ajax_type:"post", // 获取chart实用的请求类型，默认为post
            ajax_url: SUBSYSTEM_APP_NAME + "visuals/widgetProcess", // 获取chart的url
            ajax_data:"", // 获取chart使用的参数等
            init_fetch:true, // 初始化chart的时候是否执行一次请求
            show_alarm_line:false, //显示告警伐值线
            ajax_success:function () {
            }, // ajax请求成功并成功制图后的回调函数
            ajax_error:function () {
            }
        };

		this.options = $.extend(defaults, opts);
		this.options.widget_css = "singleWidget " + this.options.widget_css;
		$(this).html(generateWidget(this.options));
		var $title = $(this).find("div.widget-title");
		var $content = $(this).find("div.chart");
		if ($content != undefined) {
			$content.css("height", (parseInt($(this).css("height"))
					//- parseInt($title.css("height"))
					//- parseInt($title.css("padding-top"))
					//- parseInt($title.css("padding-bottom"))
					- parseInt($content.css("margin-top")) - parseInt($content
					.css("margin-bottom")))
					+ "px");
		}
		this.options.data = this.options.initData;

		chart = drawByType(this.options, this.options.display_type,
				this.options.chartid, chart);

		$content.find("a.reset-btn").bind("click", function() {
			if (!$(this).hasClass("disabled")) {
				chart.zoomOut();
				$(this).addClass("disabled");
			}
		});

		if (this.options.range_able && this.options.range_function != null) {
			var range_function = this.options.range_function;
			$content
					.find("a.dimension-btn")
					.bind(
							"click",
							function() {
								if ($(this).hasClass("disable"))
									return;
								else {
									// 如果在相隔两秒的间隔内，max要保证在下一秒
									var max = (Math.floor(chart.xAxis[0]
											.getExtremes().max / 1000 / GLOBAL_INTERVAL) + 1) * GLOBAL_INTERVAL;
									var min = Math.floor(chart.xAxis[0]
											.getExtremes().min / 1000 / GLOBAL_INTERVAL + 1) * GLOBAL_INTERVAL;
									if (isNaN(max) || isNaN(min))
										return false;
									else
										range_function(max, min);
								}
							});
		}

		this.getChart = function() {
			return chart;
		};

		this.drawChart = function(data, isDynamic) {
			var chartid = this.options.chartid;
			chart.showLoading();
			if (isDynamic != undefined && isDynamic == true) {
				$.each(data.data, function(key, value) {
					var r = value.data;
					for (index in r) {
						chart.series[key].addPoint(
								[ r[index][0], r[index][1] ], true, true);
					}
				});
			} else {
				chart = drawByType(data, data.display_type, chartid, chart);
			}
			chart.hideLoading();
		};
		/**
		 * 查询并画出chart
		 * 
		 * @param ajaxOpts
		 */
		this.queryAndDraw = function(ajaxOpts) {
			var defaultOpts = {
				isDynamic : false,
				type : this.options.ajax_type,
				url : this.options.ajax_url,
				data : this.options.ajax_data,
				success : this.options.ajax_success,
				error : this.options.ajax_error,
				changeAxisFontSize : this.options.changeAxisFontSize,
				calculate_type : this.options.calculate_type
			};
			var chartid = this.options.chartid;
			var options = $.extend(defaultOpts, ajaxOpts);
			$("#" + chartid).removeClass("search-error no-data");
			chart.conditions = new Object();
			chart.conditions.queryObj = options.data;
			chart.showLoading();
			$.ajax({
				type : options.type,
				url : options.url,
				data : options.data,
				success : function(data) {
					if (options.isDynamic) {
						if (data.display_type == "alarmGraph") {
							$.each(data.data.trans_count[0].data, function() {
								chart.series[0].addPoint(this, false, true);
							});
							$.each(data.data.alarm_count, function() {
								chart.series[1].addPoint(this, false, true);
							});
						} else {
							$.each(data.data, function(key, value) {
								var r = value.data;
								for (index in r) {
									chart.series[key].addPoint([ r[index][0],
											r[index][1] ], false, true);
								}
							});
						}
						chart.redraw();
					} else {
						if(data.success){
							data.changeAxisFontSize = options.changeAxisFontSize;
							data.calculate_type = options.calculate_type;
							chart = drawByType(data, data.display_type, chartid, chart);
							options.success(chart);
						}else{
							options.success();
							chart.conditions = null;
							$("#" + chartid).addClass("search-error");
						}
					}
					chart.hideLoading();
				},
				error : function() {
					chart.hideLoading();
					options.error();
				}
			});
		};

		if (this.options.init_fetch)
			this.queryAndDraw();
		return this;
	};
})(jQuery);