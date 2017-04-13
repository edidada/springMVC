// 获取px为单位的长度的数值
var subPx = function(str) {
	if (str == undefined || str == "")
		return 0;
	return str.substr(0, str.indexOf("px"));
};

/**
 * @description 检查图表类型，判断图表是否支持合并
 * @param {String} sourceId
 * @param {String} targetId
 */
function checkWidgetType(sourceId, targetId){
	if(sourceId != null && targetId != null){
		var bool = false;
		var sourceWidget = getWidgetInfoById(sourceId) != null ? getWidgetInfoById(sourceId).monitor : null; 
		var targetWidget = getWidgetInfoById(targetId) != null ? getWidgetInfoById(targetId).monitor : null; 
		if(sourceWidget != null && targetWidget != null){
			var CALCULATE_TYPE = "graphic_muti_line,graphic_special_muti_line"; 
			var swdtype = sourceWidget.calculate_type;
			var twdtype = targetWidget.calculate_type;
			if((sourceWidget.type != 2 && targetWidget.type != 2) &&  //节点类型图表不允许合并
					(CALCULATE_TYPE.indexOf(swdtype) >= 0 && CALCULATE_TYPE.indexOf(twdtype) >= 0)){
				bool = true;
			}
		}
		return bool;
	}
}

function setHaveScroll(options) {
    var container = document.getElementById("container");
    var fix = container.offsetWidth - container.clientWidth;
    options.haveScroll = fix > 0;
}

(function($) {
	$.fn.fDashboard = function(opts) {
		var defaults = {
			item : "div.item",
			titlespan : "div.ftitle",
			contentspan : "div.fcontent",
			refresh : false, // 是否刷新，忽略colspan和rowspan
			columns : 2, // 列数
			highRatio : 9 / 16, // 高宽比
			moveHandler : "div.ftitle", // 鼠标放在哪里可以移动
			resizeCallback : false,
			sortcallback : false,
			mergerWidgetCallback : false,
			merged : true, //默认支持合并
			setHeight : null, //默认不设置高度
			helperCss : "ui-state-highlight"
		};
		var options = $.extend(defaults, opts);

		// 获取目标内部区域的实际长或者宽
		var getInner = function(dom, size, type) {
			var innerSize;
			if (type == "w") {
				innerSize = size - subPx($(dom).css("margin-left"))
						- subPx($(dom).css("margin-right"))
						- subPx($(dom).css("padding-left"))
						- subPx($(dom).css("padding-right"))
						- subPx($(dom).css("border-left-width"))
						- subPx($(dom).css("border-right-width"));
			} else {
				innerSize = size - subPx($(dom).css("margin-top"))
						- subPx($(dom).css("margin-bottom"))
						- subPx($(dom).css("padding-top"))
						- subPx($(dom).css("padding-bottom"))
						- subPx($(dom).css("border-top-width"))
						- subPx($(dom).css("border-bottom-width"));
			}
			return innerSize;
		};

		// 更改容器的宽度的百分比为确定值
		$(this).css("width", $(this).css("width"));

		var widgetWidth = parseInt(subPx($(this).css("width")) / options.columns);
		var widgetHeight = parseInt(widgetWidth * options.highRatio);
		$(this).children(":not(div.fclear)").each(function(){
			var colspan = $(this).attr("colspan") == undefined ? 1 : $(this).attr("colspan");
			var rowspan = $(this).attr("rowspan") == undefined ? 1 : $(this).attr("rowspan");
			if (options.refresh) {
				colspan = 1;
				rowspan = 1;
			}else {
				if (colspan <= 0){
					colspan = 1;
				}else if (colspan > options.columns){
					colspan = options.columns;
				}
				if (rowspan <= 0){
					rowspan = 1;
				}
			}
			var newWidth = getInner(this, widgetWidth,"w")+ (colspan - 1) * widgetWidth;
			$(this).css({"width" : newWidth+ "px"});
			if(options.setHeight == null){
				var newHeight = getInner(this, widgetHeight,"h")+ (rowspan - 1) * widgetHeight;
				$(this).css({"height" : newHeight + "px"});
			}else{
				$(this).css({"height" : options.setHeight});
			}
			
			if(options.isEditDashboard){
				$(this).resizable({
					grid : [ widgetWidth, widgetHeight ],
					ghost : true,
					autoHide : true,
					maxWidth : widgetWidth * options.columns,
					minWidth : widgetWidth,
					minHeight : widgetHeight,
					helper : options.helperCss
				});
			}else{
				$(this).resizable();
				$(this).resizable("destroy");
			}

			// var $title = $(this).children(options.titlespan);
			var $content = $(this).children(options.contentspan);
			if ($content != undefined) {
				var contentHeight = (subPx($(this).css("height"))
//								- subPx($title.css("height"))
//								- subPx($title.css("padding-top"))
//								- subPx($title.css("padding-bottom"))
				- subPx($content.css("margin-top"))
				- subPx($content.css("margin-bottom")))+ "px";
				$content.css("height", contentHeight);
			}
			
			if(options.isEditDashboard){
				$(this).unbind("resizestop").bind("resizestop", 
						function() {
							var width = subPx($(this).css("width"))
									  - subPx($content.css("margin-right"))
									  - subPx($content.css("margin-left"));
							var height = subPx($(this).css("height"))
//									   - subPx($title.css("height"))
//									   - subPx($title.css("padding-top"))
//									   - subPx($title.css("padding-bottom"))
									   - subPx($content.css("margin-top"))
									   - subPx($content.css("margin-bottom"));
							$content.css("height", height + "px");
							$(this).attr("colspan",Math.round(width/widgetWidth));
							$(this).attr("rowspan",Math.round(height/widgetHeight));
							if (options.resizeCallback != false) {
								options.resizeCallback($(this));
							}
					});
			}
            setHaveScroll(options); //设置是否有滚动条
		});
		if(options.isEditDashboard){
			var sortting = false;
			var sourceWidgetItem,targetWidgetItem;
			$(this).sortable(
				{
					cursor : "move",
					forcePlaceholderSize : true,
					forceHelperSize : true,
					opacity : 0.6,
//					revert : true,
					scroll : false,
					tolerance : "intersect",
					item : options.items,
					start : function(event,ui){
						if(options.merged){
							ui.item.addClass('onmove');
							sortting = true;
							sourceWidgetItem = $(ui.item);
						}
					},
					stop : function(){
						if(options.sortcallback != false) options.sortcallback();
					},
					handle : $(options.moveHandler) == undefined ? false : options.moveHandler
			});
			
			if(options.merged){
			    var widgetS = $(".widget_s");
                widgetS.mouseenter(function(){
					if($(this).hasClass("onmove") || !sortting){
						return;
					}
					var sourceId = sourceWidgetItem.attr("id");
					var targetId = $(this).attr("id");
					if(checkWidgetType(sourceId,targetId)){
						$(this).addClass("addcolor");
						targetWidgetItem = $(this);
					}
				});

                widgetS.mouseleave(function(){
					$(this).removeClass("addcolor");
				});
				
				$("body").live("mouseup",function(){
					if(sortting){
					    var onmove = $(".onmove");
						if(targetWidgetItem && targetWidgetItem.hasClass("addcolor")){
							options.mergerWidgetCallback(sourceWidgetItem.attr("id"),targetWidgetItem.attr("id"));
							targetWidgetItem.removeClass("addcolor");
                            onmove.hide();
						}
                        onmove.removeClass('onmove');
						sortting = false;
					}
				});
			}
			$(this).find(".widget-title").removeClass("noedit");
		}else{
			$(this).sortable();
			$(this).sortable("destroy");
			$(this).find(".widget-title").addClass("noedit");//去掉鼠标样式
		}
		$(this).find("div.fclear").remove();
		$(this).append("<div class='fclear' style='clear:both'></div>");

		var divWidgets = $("div.widget_s");
        divWidgets.find("span.ui-icon-closethick:first").hide();
        divWidgets.mouseover(function(){
			  $(this).find("span.ui-icon-closethick:first").show();
		}).mouseout(function(){
			$(this).find("span.ui-icon-closethick:first").hide();
		});
		return options;
	};
})(jQuery);