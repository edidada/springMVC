/**
 * @description high chart option 定义
 * @author SHEN
 * @date 2013-11-01
 */
/***********************************/

/**
 * 转换图表Y轴单位
 * @param num
 * @param flag
 * @returns
 */
function ez_formatter(num,flag){
	flag++;
	var u_s = "";
	var _num = num/1000;
	if(_num >= 1){
		return ez_formatter(_num,flag);
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
		};
		return num + u_s;
	};			
}

/**
 * @description 返回图表全局的option
 * @param {String} unit 单位
 */
function getGolobalOptions(unit){
	var options = {
			chart : {
				marginTop: (isTVModel ? 3 * rootFontSize : 60),
				marginBottom: (isTVModel ? 2 * rootFontSize : 40),
				marginLeft : (isTVModel ? 2.75 * rootFontSize : 55),
				marginRight : (isTVModel ? 1.25 * rootFontSize : 25)
			},
			yAxis : [ {
				title: {
					text: unit,
					align : 'high',
					rotation : 360,
					y : -(isTVModel ? 0.75 * rootFontSize : 15),
					offset : 0,
					margin : (isTVModel ? 5 * rootFontSize : 100)
                },
				min : 0,
				minRange: 1,
				allowDecimals : true,
				gridLineWidth : 1,
				labels : {
					formatter : function() {
						return ez_formatter(Math.abs(this.value), 0);
					}
				}
			}]
	};
	return options;
}

/***
 * 返回时间类型的X轴
 * @returns {___anonymous892_1659}
 */
function getDateTimeXAxis(){
	return {
		type : 'datetime',
		title : {
			enabled : false
		},
		startOnTick : false,
		endOnTick : false,
		labels : {
			y : 18,
			formatter : function() {
				var returnHtml = "";
				var day = Highcharts.dateFormat("%Y.%b.%e", this.value);
				var time = Highcharts.dateFormat(this.dateTimeLabelFormat, this.value);
				if (this.isFirst && this.dateTimeLabelFormat.substr(0, 5) == "%H:%M"){
					returnHtml =  (time.substr(0,1)=='0'?time.substr(1,time.length):time)+"<br/>"+day;
				}else if(this.dateTimeLabelFormat == "%b/%e"){
					returnHtml =  "0:00<br/>"+day;
				}else{
					returnHtml = (time.substr(0,1)=='0'?time.substr(1,time.length):time);
				}
				return "<span style='z-index:-1;position:relative;'>" + returnHtml + "</span>";
			}
		}
	};
}

/**
 * @description 获取legend options
 * @param renderTo
 * @param showLegend
 * @returns {___anonymous2635_3160}
 */
function getLegendOptions(renderTo, showLegend){
	var width = $("#"+renderTo).width();
	var legend = {
        enabled: (showLegend != undefined ? showLegend : true),
        floating: true,
        align: "right",
        verticalAlign: "top",
        rtl : true,
        width : width/2,
        borderWidth : 0,
        x: -15,
        y: 0,
        borderRadius: 0,
        padding: 5,
        labelFormatter: function(){
			var _txt = "<span class='legend-label' style='max-width:"+ width/2 +"px;color:"+ TEXT_COLOR_LEVEL["3"] +";' title='"+ this.name.escapeHTML() +"'>";
			return _txt + this.name.escapeHTML() + "</span>";
		},
		useHTML: true
    };
	return legend;
}

/**
 * @description 返回line,area default options
 * @author SHEN
 * @param {String} renderTo
 * @param {String} unit 单位
 * @param {String} type 图表类型
 * @param {boolean} showLegend
 * @param {function} range_callback
 * @returns {Object}
 */
function getDefaultLineOptions(renderTo,unit,type,showLegend,range_callback){
	var defaultMutiLineOptions = {
			chart : {
				renderTo : renderTo,
				animation : false,
				zoomType : 'x',
				showAxes : true,
				type : type,
				events : {
					selection : function(event) {
						$("#" + renderTo).siblings("div.chart-menu").find(
							"a.js-reset-btn,a.js-use-selection-range").removeClass("disabled");
						if(range_callback != undefined && event.xAxis != undefined){
							range_callback(event.xAxis[0].min, event.xAxis[0].max);
						}
					}
				},
				resetZoomButton : {
					theme : {
						display : "none"
					}
				}
			},
			legend : getLegendOptions(renderTo, showLegend),
			xAxis : getDateTimeXAxis(),
			tooltip : {
				shared : true,
				crosshairs : true,
				xDateFormat : '%Y-%m-%d %H:%M:%S',
				useHTML : true,
				formatter: function() {
	                return formatterToolTip(this,unit);
	            }
			},
			series : []	
	};
	return $.extend(true,getGolobalOptions(unit),defaultMutiLineOptions);
}

/**
 * 格式化toolTip
 * @param obj {Object}
 * @param unit 单位
 * @returns {String}
 */
function formatterToolTip(obj,unit) {
    var tip = Highcharts.dateFormat(obj.dateTimeLabelFormat, obj.x);
    var html = "<span style='text-align:center;display:block;'>"+tip+"</span>";
    $.each(obj.points, function(i, point) {
    	var valueSuffix = point.series.tooltipOptions.valueSuffix;
    	var low = point.point.low, high = point.point.high;
    	var y = "";
    	if(point.y != undefined && point.y != null){
    		y = Highcharts.numberFormat(Math.abs(point.y), 2, '.', ',');
    	}
    	if(i>0){
    		html += "<br/>";
    	}
    	if(point.series.dataIsChanged && y != null){//数据被改变
    		y = getDataBack(y);
    	}
    	var text = formatterSeriesName(point.series.name);
    	html += '<span style="color:'+point.series.color+'">'+ text +': </span>';
    	if(low && high){
    		html += '<b>'+ low+" - "+high;
    	}else{
    		html += '<b>'+ y;
    	}
    	html += (valueSuffix != null ? valueSuffix : unit) +'</b>';
    });
    return html;
}

/**
 * @description 恢复被改变的数据
 * @param n
 * @returns
 */
function getDataBack(n){
	if(n <= 50){
		n = n/50 * 90;
	}else{
		n = (n-50)/50 * (100-90) + 90;
	}
	var intVal = parseFloat(n);
	if((n-intVal)> 0.9){
		return Math.round(n * 100) / 100;
	}else{
		return Math.floor(n * 100) / 100;
	}
}
/**
 * @description 处理series name的长度
 * @param {String} name 
 */
function formatterSeriesName(name){
	if(name == null || name == undefined){
		return;
	}
	var text = name;
	//tool tip 显示字符30太长，修改短一点。
	var MAX_LENGTH = 12;
	if(text.length > MAX_LENGTH){
		text = name.substr(name.lastIndexOf("/") + 1);
		if(text != null && text != ""){
			var index = text.lastIndexOf("?");
			text = text.substr(0, index > 0 ? index : text.length);
		}else{
			text = name;
		}
		text = text.substr(0, MAX_LENGTH) + '…';//截取 MAX_LENGTH 个字符
	}
	return text.escapeHTML();
}

/**
 * @description 返回默认的plot options 
 * @param {Boolean} haveEvent 
 * @param {Boolean} isLine 
 * @returns {___anonymous1915_2447}
 */
function getDefaultLinePlotOptions(haveEvent, isLine){
	var defaultPlotOptions = {
		lineWidth : 2,
		turboThreshold : 5000,
		shadow : false,
		states : {
			hover : {
				lineWidth : 2
			}
		},
		marker : {
			enabled : false,
			// enabled : isLine ? true : false,
			radius : 5,
			fillColor : null,  // inherit from series
			lineWidth : 2,
			lineColor : BG_COLOR_LEVEL["1"], 
			states : {
				hover : {
					enabled : true,
					radius : 4,
					fillColor : '#FFFFFF',
					lineColor : null,
					lineWidth : 2
				}
			}
		},
		cursor : canDrillDown ? "pointer" : null
	};
	var eventObj = {
		events : {
			click : function(event) {
				drilldown(null,event);
			}
		}
	};
	return $.extend(defaultPlotOptions,haveEvent?eventObj:null);
}

/**
 * @description 返回多线图options
 * @author SHEN
 * @param {String} renderTo
 * @param {String} unit 单位
 * @param {boolean} showLegend
 * @param {function} range_callback
 * @returns {Object}
 */
function getMutiLineOptions(renderTo,unit,showLegend, range_callback){
	var opts = {
			fillOpacity : 0.55,
			lineColor : null
    };
	return $.extend(getDefaultLineOptions(renderTo,unit,'line',showLegend,range_callback),{
		plotOptions : {
			line : getDefaultLinePlotOptions(true, true),
			area : $.extend(getDefaultLinePlotOptions(true, false), opts)
		}
	});
}

/**
 * @description 返回多线堆积图options
 * @author SHEN
 * @param {String} renderTo
 * @param {String} unit 单位
 * @param {boolean} isStack
 * @returns {Object}
 */
function getMutiStackOptions(renderTo,unit,isStack,showLegend,range_callback){
	var opts = {
			fillOpacity : 0.55,
			lineColor : null
    };
	if(isStack){
		opts.stacking = 'normal';
	}
	return $.extend(getDefaultLineOptions(renderTo,unit,'area',showLegend,range_callback),{
		plotOptions : {
			line : getDefaultLinePlotOptions(true, true),
			area : $.extend(getDefaultLinePlotOptions(true, false), opts)
		}
	});
}

/**
 * @description 返回area range图options
 * @author SHEN
 * @param {String} renderTo
 * @param {String} unit 单位
 * @returns {Object}
 */
function getArearangeOptions(renderTo,unit){
	return $.extend(getDefaultLineOptions(renderTo,unit,'arearange'),{
		tooltip : {
			shared : true,
			crosshairs : true,
			xDateFormat : '%Y-%m-%d %H:%M:%S',
			valueDecimals :  2,
			useHTML : true,
			formatter : function (){
			    return formatterToolTip(this,unit);
			}
		},
		plotOptions : {
			line : getDefaultLinePlotOptions(false),
			arearange : {
				events : {
					click : function(event) {
						drilldown(null,event);
					}
				}
			}
		}
	});
}

/**
 * @description 返回bar,column default options
 * @author SHEN
 * @param {String} renderTo
 * @param {String} unit 单位
 * @param {String} type 图表类型
 * @param {Number} rotation 
 * @returns {Object}
 */
function getDefaultBarOptions(renderTo,unit,type,rotation){
	var defaultBarOptions = {
			chart : {
				renderTo : renderTo,
				animation : false,
				type : type,
				showAxes : true
			},
			xAxis : {
				categories : [],
				labels : {
					align : 'center',
					useHTML : true,
					formatter : function() {
						var charWidth = this.chart.chartWidth-80;
						var categoriesLength = this.axis.categories.length;
						var width = charWidth / categoriesLength - 8;
						return '<span style="width:' + width
							+ 'px" class="column-label-format" title="'
							+ this.value + '">' + this.value + '</span>';
					}
				}
			},
			legend : {
				enabled : false
			},
			tooltip : {
                shared : true,
				formatter : function() {
					var text = formatterSeriesName(this.x);
					return '<b>' + text + ': ' + Highcharts.numberFormat(this.y, 2, '.', ',') + unit;
				}
			},
			series : [ {
				data : [],
				dataLabels : {
					enabled : false,
					rotation : rotation,
					color : '#FFFFFF',
					align : 'right',
					x : -3,
					y : 10,
					formatter : function() {
						return this.y;
					},
					style : {
						fontSize : '11px'
					}
				}
			} ]
		};
	return $.extend(true,getGolobalOptions(),defaultBarOptions);
}

/**
 * @description 返回bar,column plot options
 * @returns {___anonymous5316_5495}
 */
function getColumnPlotOption(){
	return {
			borderColor : "",
			cursor : 'pointer',
			pointPadding : 0.08,
			point : {
				events : {
					click : function() {
						drilldown(this,null);
					}
				}
			}
	};
}

/**
 * @description 返回柱状图options
 * @author SHEN
 * @param {String} renderTo
 * @param {String} unit 单位
 * @param {Boolean} xAxisIsDateTime X轴是否为日期
 * @returns {Object}
 */
function getColumnOptions(renderTo,unit,xAxisIsDateTime){
	var columnOption = $.extend(getDefaultBarOptions(renderTo,unit,'column',-90),{
		plotOptions : {
			column : getColumnPlotOption()
		}
	});
	if(xAxisIsDateTime){
		columnOption = $.extend(getDefaultBarOptions(renderTo,unit,'column',-90),{
			xAxis : getDateTimeXAxis(),
			legend : getLegendOptions(renderTo, true),
			tooltip: {
				shared : true,
				xDateFormat : '%Y-%m-%d %H:%M:%S',
				useHTML : true,
				formatter: function() {
	                return formatterToolTip(this,unit);
	            }
	        },
			series : null,
			plotOptions : {
				column : getColumnPlotOption()
			}
		});
	}
	return columnOption;
}

/**
 * @description 返回stack柱状图options
 * @author SHEN
 * @param {String} renderTo
 * @param {String} unit 单位
 * @returns {Object}
 */
function getColumnStackOptions(renderTo,unit){
	var barOption = $.extend(getDefaultBarOptions(renderTo,unit,'column',-90),{
		xAxis : getDateTimeXAxis(),
		tooltip: {
			shared : true,
			xDateFormat : '%Y-%m-%d %H:%M:%S',
			useHTML : true,
			formatter: function() {
                return formatterToolTip(this,unit);
            }
        },
		series : null
	});
	var plotOption = $.extend(getColumnPlotOption(),{stacking: 'normal',pointWidth: null});
	return $.extend(barOption,{plotOptions : {column : plotOption}});
}

/**
 * @description 返回bar图options
 * @param {String} renderTo
 * @param {String} unit
 * @returns {Object}
 */
function getBarOptions(renderTo,unit){
	var barOption = $.extend(true,getDefaultBarOptions(renderTo,unit,'bar',1),{
		xAxis : {
			labels : {
				align : 'right',
				formatter : function() {
					var labelWidth = ((this.chart.chartWidth - 70)/5).toFixed(2);
					return '<span style="max-width:' + labelWidth
						+ 'px" class="column-label-format" title="'
						+ this.value + '">' + this.value + '</span>';
				}
			}
		}
	});
	return $.extend(barOption,{
		plotOptions : {
			bar : getColumnPlotOption()
		}
	});
}

/**
 * @description 返回饼图options
 * @author SHEN
 * @param {String} renderTo
 * @param {String} unit 单位
 * @returns {Object}
 */
function getPieOptions(renderTo, unit){
	var pie_options = {
		chart : {
			renderTo : renderTo,
			animation : false,
			plotBackgroundColor : null,
			plotBorderWidth : null,
			plotShadow : false,
			marginTop : 25
		},
		tooltip : {
			formatter : function() {
				return '<span style="color:'+this.point.color+'">'+ this.point.name + '</span>: '+ 
					   '<b>'+ Highcharts.numberFormat(this.y, 2, '.', ',') + unit+ '</b> ';
			}
		},
		plotOptions : {
			pie : {
				allowPointSelect : true,
				cursor : 'pointer',
				dataLabels : {
					enabled : true,
					connectorColor : '#ccc',
					style : {
						"fontWeight" : "normal",
						"textShadow": ""
					},
					formatter : function() {
						var text = formatterSeriesName(this.point.name);
						return '<b style="font-size:20px;color:'+this.point.color+'">'
								+ this.percentage.toFixed(2)+ ' %</b>'
								+'<br/><span style="color:'+this.point.color+';overflow:hidden">'+ text + '</span>';
					}
				},
				point : {
					events : {
						click : function() {
							if (this.name != "other") {
								drilldown(this,null);
							}
						}
					}
				}
			}
		},
		series : [ {
			type : 'pie',
			name : null,
			data : []
		} ]
	};
	return pie_options;
}

/**
 * @description 返回告警柱状图options
 * @author Diao
 * @param {String} renderTo
 * @returns {Object}
 */
function getAlarmChartOptions(renderTo) {
	var alarmgraph_options = {
		chart : {
			renderTo : renderTo
		},
		title : {
			text : null
		},
		xAxis : getDateTimeXAxis(),
		yAxis : [],//需要自己设置
		tooltip : {
			crosshairs : true,
			shared : true,
			borderColor : "#058DC7",
			xDateFormat : '%Y-%m-%d %H:%M:%S'
		},
		legend : {
			enabled : false
		},
		plotOptions : {},//需要自己设置
		series : []//需要自己设置
	};
	return alarmgraph_options;
}

/**
 * @description 返回吞吐量告警图options
 * @author SHEN
 * @param {String}
 *            renderTo
 * @returns {Object}
 */
function getAlarmGraphOptions(renderTo){
	var alarmgraph_options = {
		chart : {
			zoomType : 'x',
			renderTo : renderTo,
			events : {
				selection : function(event) {
					$("#" + renderTo).siblings("div.chart-menu").find(
							"a.js-reset-btn,a.js-use-selection-range").removeClass("disabled");
				}
			},
			marginTop: 50,
			resetZoomButton : {
				theme : {
					display : "none"
				}
			}
		},
		xAxis : {
			type : 'datetime',
			title : {
				text : null
			},
			labels : {
				style : {
					fontSize : '11px',
					color : '#333333'
				}
			}
		},
		yAxis : [ {
			min : 0,
			minRange: 100,
			title : {
				text : null
			},
			labels : {
				style : {
					color : '#4572A7'
				}
			}
		}, {
			title : {
				text : null,
				style : {
					color : '#ED561B'
				}
			},
			labels : {
				formatter : function() {
					return this.value;
				},
				style : {
					color : '#ED561B'
				}
			},
			allowDecimals : false,
			opposite : true
		} ],
		tooltip : {
			crosshairs : true,
			shared : true,
			valueSuffix : ' 个',
			xDateFormat : '%Y-%b-%e %H:%M:%S'
		},
		legend : {
			enabled : false
		},
		plotOptions : {
			series : {
				allowPointSelect : false
			},
			column : {
				cursor : canDrillDown ? "pointer" : null,
				pointPadding : 0.4,
				events : {
					click : function(event) {
						// drilldown(null,event);
						var streamID = null;
						if(typeof(stream_id) != "undefined")
							streamID = stream_id;

						var interval = $("#timeScale").val();
						var to = parseInt((event.point.x+interval*1000)/1000);
						var end_time = Math.floor($("#date-time").daterangepicker("getEndDate").getTime() / 1000);
						if(end_time < parseInt(event.point.x+interval*1000)/1000) {
							to = end_time;
						}
						getAlarmList(parseInt(event.point.x/1000), to, [0,1,2,3], streamID, 1);
					}
				}
			},
			area : {
				fillOpacity : 0.1,
				/*
				 * fillColor:{ linearGradient:{ x1:0, y1:0, x2:0, y2:1}, stops:[
				 * [0, Highcharts.getOptions().colors[0]], [1,
				 * Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')] ] },
				 */
				lineWidth : 1,
				lineColor : '#058DC7',
				marker : {
					enabled : false,
					states : {
						hover : {
							enabled : true,
							radius : 4,
							fillColor : '#FFFFFF',
							lineWidth : 2,
							lineColor : '#058DC7'
						}
					}
				},
				shadow : false,
				states : {
					hover : {
						lineWidth : 2
					}
				},
				threshold : null,
				cursor : canDrillDown ? "pointer" : null,
				events : {
					click : function(event) {
						drilldown(null,event);
					}
				}
			}
		},
		series : [ {
			type : 'area',
			name : '吞吐量',
			data : []
		}, {
			name : '告警',
			color : '#FA5833',
			type : 'column',
			yAxis : 1,
			data : [],
			borderWidth : 0,
			shadow : false,
			// cursor: 'pointer',
			// allowPointSelect: true,
			states : {
				hover : {
					brightness : 0.2
				}
			// select: {
			// color:"#FFFFFF",
			// borderColor:"#FA5833",
			// borderWidth:3,
			// }
			}
		} ]
	};
	return alarmgraph_options;
}

/**
 * 下钻到messageanalysis页面 需要全局变量canDrillDown存在才可以使用
 * 
 * @param obj:柱状图和饼状图钻取时传入
 * @param event:其他图表钻取时传入
 */
function drilldown(obj,event) {
	if (canDrillDown) {
		var url = SUBSYSTEM_APP_NAME + "dimension/messageanalysis";
		if(obj!=null){
			var widget_id = obj.series.chart.conditions.widget_id;
			if(widget_id && widget_id =="app-alarm-severity-count"){  
				// 处理告警统计图点击跳转到告警列表
				url =  SUBSYSTEM_APP_NAME+"alarms"+getRangeUrl()+"&init_severity="+obj.category;
				if(obj.streamId!=null){
					url += "&relationStreamIds=" + obj.streamId;
				}
			}else{
				//处理柱状图和饼状图钻取条件
				var conditions = obj.series.chart.conditions;
				var isDatetimeAxis = obj.series.chart.xAxis[0].isDatetimeAxis;
				if(isDatetimeAxis){ //X轴为时间类型的情况处理
					url += "?from=" + obj.x / 1000;
					url += "&to="+ (obj.x / 1000 + parseInt(conditions.queryObj.interval));
				}else{
					url += getRangeUrl(); 
				}
				if(obj.streamId != null){
					url += "&stream_id=" + obj.streamId;
				}else{
					url += "&stream_id=" + conditions.streamId;
				}
				if(conditions.metric_name != undefined){
					url += "&metric_name=" + conditions.metric_name;
				}
				if(conditions.calculation != undefined){
					url += "&calculation=" + conditions.calculation;
				}
				if(conditions.queryObj){
					url = getDrillDownConditions(conditions, url, obj.queryString, obj);
				}else{
					return;
				}
			}
		}else{
			var pointX = event.point.x, conditions = event.point.series.chart.conditions;
			var queryObj = conditions.queryObj;
			var seriesArray = new Array();
			seriesArray.push(event.point.series);
			var streamId = "";
			if(conditions.widget_type != 2){ //非节点类型图表
				streamId = getStreamIdsBySeries(seriesArray);
				streamId = (streamId == "" ? conditions.streamId : streamId);
			}else{
				if(queryObj.stream_id_additional != null && queryObj.stream_id_additional.length > 0){
					streamId = queryObj.stream_id_additional;
    			}
			}
			if(typeof (showRange) == "function") {
				showRange(pointX / 1000+ GLOBAL_INTERVAL , pointX / 1000);
				return;
			}else {
				var interval = queryObj.interval;
				if(interval == undefined){
					interval = GLOBAL_INTERVAL;
				}
				// var from = pointX / 1000, to = (pointX / 1000 + parseInt(interval));
				//查询前后5个粒度时间
				var from = (pointX / 1000 - parseInt(interval) * 5), to = (pointX / 1000 + parseInt(interval) * 5);
				if(event.point.series && event.point.series.isbaseline){ //基线钻取时需要把开始时间减一分钟，不然查不出数据
					from = from - GLOBAL_INTERVAL;
				}
				url += "?from=" + from;
				url += "&to=" + to;
				if(streamId != "" && streamId !=null){
					url += "&stream_id=" + streamId;
				}
				url += getMetricNameBySeries(seriesArray, conditions);
				url = getDrillDownConditions(conditions, url, getQueryStringBySeries(seriesArray),null);
			}
		}
		openWindow(url, true);
	}
}
/**
 * @description 统一获取钻取需要的条件
 * @param conditions 查询条件js对象
 * @param url 
 * @param querystring  monitorCondition中带的查询条件
 * @param obj
 * @returns
 */
function getDrillDownConditions(conditions,url,querystring,obj){
	var queryObj = conditions.queryObj;
	var interval = queryObj.interval;
	if(interval == undefined){
		interval = GLOBAL_INTERVAL;
	}
	url += "&interval=" + parseInt(interval);
	if((querystring != null && querystring !="") && (queryObj.querystring != null && queryObj.querystring != "")){
		url += "&querystring=("+ encodeURIComponent(querystring)+") AND ("+encodeURIComponent(queryObj.querystring)+")";
	}else if(querystring != null && querystring !=""){
		url += "&querystring="+encodeURIComponent(querystring);
	}else if(queryObj.querystring != null && queryObj.querystring != ""){
		url += "&querystring="+encodeURIComponent(queryObj.querystring);
	}
	
	var paramObj = new Object();
	if(queryObj.conds != null){
		paramObj.conds = queryObj.conds;
		if(conditions.widget_type == 2){  //节点类型图表转换条件，对应后台查询操作
			var _dst_ip = paramObj.conds._dst_ip;
			var _dport = paramObj.conds._dport;
			if(null != _dst_ip  && "" != _dst_ip){
				paramObj.conds._src_ip = _dst_ip;
				delete paramObj.conds._dst_ip;
			}
			if(_dport != null && "" != _dport){
				paramObj.conds._sport = _dport;
				delete paramObj.conds._dport;
			}
		} 
	}
	if(obj != null){
		if(queryObj.filters == null){
			paramObj.filters ={};
		} 
		var key = obj.drilldown;
		var value = obj.drilldownValue;
		if(key){
			var keyArr = key.split(".");
			if(keyArr.length>1){
				paramObj.filters[keyArr[0]+"."+keyArr[1]] = value;
			}else{
				paramObj.filters[key] = value;
			}
		}
	}else{
		if(queryObj.filters != null && queryObj.filters.length > 0){
			paramObj.filters = queryObj.filters;
		}
	}
	url += "&" + $.param(paramObj);
	return url;
}

/**
 * 柱状图和饼状图钻取时获取起始时间
 * @returns {String}
 */
function getRangeUrl() {
	var fromDate = $('.datetime').daterangepicker("getStartDate");
	var toDate = $('.datetime').daterangepicker('getEndDate');

	var param = "?from=" + Math.floor(fromDate.getTime() / 1000) + "&to="
			+ Math.floor(toDate.getTime() / 1000);
	return param;
}

/**
 * @description 取得series对应的流
 * @param chartSeries
 */
function getStreamIdsBySeries(chartSeries){
	var streamId = "";
	$.each(chartSeries,function(i,s){//处理图表合并后不同的series对应不同的流的问题
		if(s.visible && s.streamId){
			if(streamId.indexOf(s.streamId)<0){
				if (streamId.length > 0) {
					streamId += ",";
				}
				streamId += s.streamId;
			}
		}
	});
	return streamId;
}
/**
 * @description 取得series上对应的queryString
 * @param chartSeries
 */
function getQueryStringBySeries(chartSeries){
	for(var i=0; i<chartSeries.length; i++){
		var s = chartSeries[i];
		if(s.visible){
			return (s.querystring != undefined ? s.querystring : "");
		}
	}
}
/**
 * @description 取得series上对应的metric_name和calculation
 * @param chartSeries
 * @param conditions
 */
function getMetricNameBySeries(chartSeries, conditions){
	var url = "";
	for(var i=0; i<chartSeries.length; i++){
		var s = chartSeries[i];
		if(s.visible && s.metric_name){
			if(s.metric_name != null && s.metric_name != ""){
				url += "&metric_name=" + s.metric_name;
			}
			if(s.calculation != null && s.calculation != ""){
				url += "&calculation=" + s.calculation;
			}
			if(s.average != null && s.average != ""){
				url += "&average=" + s.average;
			}
			if(s.successType != null && s.successType != ""){
				url += "&successType=" + s.successType;
			}
			if(s.responseType != null && s.responseType != ""){
				url += "&responseType=" + s.responseType;
			}
			if(s.isbaseline != null && s.isbaseline != ""){
				url += "&isbaseline=" + s.isbaseline;
			}
		}
		if(url != "" && url.length > 0){
			return url;
		}
	}
	if(url == "" || url.length ==0){//当series中没有metric时从condition中取
		if(conditions.metric_name != null && conditions.metric_name != ""){
			url += "&metric_name=" + conditions.metric_name;
		}
		if(conditions.calculation != null && conditions.calculation != ""){
			url += "&calculation=" + conditions.calculation;
		}
		if(conditions.average != null && conditions.average != ""){
			url += "&average=" + conditions.average;
		}
	}
	return url;
}