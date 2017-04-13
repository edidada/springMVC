/**
* @version: 0.2
* @author: E_Bo
* @date: 2014-09-22
* @work with jQuery
*/
/*
* 页面尺寸发生变化后，未调整元素的位置
*/

(function ($,undefined){
	
	var EzFlowDrawer = function(element,options){
		
		var hasOptions = typeof options == 'object';
		
		this.items = [];
		this.s_at = 0;  //开始位置
		this.e_at = 0;  //结束位置
 
        this.maxSizeMap = {};
        //CITIC var data_message = [{v_key:"_trans_ref",v_sub_key:"TT"},{v_key:"_ret_code",v_sub_key:"RC"},_latency_msec]
        //需要展现的数据项目,示例：["ret_code_x", {v_key: "_trans_ref", v_sub_key : "ITEMID,SQLID"}]
		//var data_message = ["_trans_ref","_ret_code","_ret_code_x"];
        var data_message = [
            {v_key: "_trans_ref", v_sub_key: "TT"},
            {v_key: "_ret_code", v_sub_key: "RC"},
            "_latency_msec"
        ];
		this.element = $(element);
		
		if(hasOptions){ 
			if (options.items.length != 0) {
                this.items = options.items;
            }
            if(options.maxSizeMap){
                this.maxSizeMap = options.maxSizeMap;
            }
		}
 
		if(this.items.length == 0){
			console.log("源数据为空");
			return;
		}
		
		//计算起止点
		var _min = this.items[0]._start_at_ms*1000;
		var _max = this.items[0]._start_at_ms*1000 + this.items[0]._latency_msec;
		
		$(this.items).each(function(index, element) {
			if(element._start_at_ms*1000 < _min){
				_min = element._start_at_ms*1000;
			}
			if((element._start_at_ms*1000 + element._latency_msec) > _max){
				_max = element._start_at_ms*1000 + element._latency_msec;
			}
        });
		
		this.s_at = _min;
		this.e_at = _max;
		
		this.bgContainer = $("<div class='flow-bg-container'></div>");
		this.middleContainer = $("<div class='flow-middle-container'></div>");
		
		this.element.append(this.bgContainer,this.middleContainer);
		this.bgContainer.append("<div class='flow-item-title'>节点名称</div>","<div class='flow-item-info-title'>交易信息</div>","<div class='flow-item-bg-container'></div>");
		
		this.timelineContainer = $("<div class='flow-timeline-container'></div>");
		this.flowMainContainer = $("<div class='flow-main-container'></div>");
		
		this.middleContainer.append(this.timelineContainer,this.flowMainContainer);
		
		darwTimeLine(this.middleContainer,this.s_at,this.e_at);
		
		darwItem(this.flowMainContainer,this.bgContainer,"",this.items,this.s_at,this.e_at,this.maxSizeMap);
		
		darwLink(this.element.find(".flow-item"));
		
		//生成连接线
		function darwLink(items){
			items.each(function(index, element) {
              if($(element).attr("data-psid") != ""){
				  var _p = $(element).position();
				  var _line = $("<div class='flow-line'></div>");
				  _line.css({
						height: _p.top + 15,
						top: -_p.top-20,
						left: -1
					});
				  $(element).append(_line);
				}
            });
		}
		
		//生成时间轴
		function darwTimeLine(container,s_time,e_time){
			var range = e_time - s_time;
			var range_len = range.toString().length;
			var step;
			var step_2 = 2*Math.pow(10, range_len-2);
			var step_5 = 5*Math.pow(10, range_len-2);
			var step_10 = Math.pow(10, range_len-1);
			if(range_len <= 1){
				step = 1;
			}else if(Math.floor(range/step_2) < 10){
				step = step_2;
			}else if(Math.floor(range/step_5) < 10){
				step = step_5;
			}else if(Math.floor(range/step_10) < 10){
				step = step_10;
			}
			
			var _length = step*Math.ceil(range/step);
			var _margin = (_length-range)/_length*100;
			var _width = 100 / Math.ceil(range/step);
			
			container.find(".flow-main-container").css("margin-right",_margin+"%");
			
			var step_dom = "<div class='flow-timeline-item' style='width:" + _width + "%'><span></span></div>";
			
			var _container = container.find(".flow-timeline-container");
			
			for(var i = 1; i <= Math.ceil(range/step); i++){
				var _dom = $(step_dom);
				_dom.find("span").text(translate(i*step));
				_container.append(_dom);
			}
			
			
			
			var s_date = new Date(s_time).pattern("yyyy-MM-dd HH:mm:ss.S");
			var e_date = new Date(e_time).pattern("yyyy-MM-dd HH:mm:ss.S");
			
			var total_dom = "<div class='flow-timeline-total' style='margin-right:"+ _margin +"%' data-ez-s-time='"+ s_date +"' data-ez-e-time='"+ e_date +"'><div class='flow-timeline-total-line'><span class='flow-timeline-total-text'>"+ translate(range) +"</span></div></div>";
			
			_container.append(total_dom);
			
		}
		
		function translate(num){
			var _text;
			if(num > 1000){
				_text = "+" + num/1000 + "s";
			}else{
				_text = "+" + num + "ms";
			}
			return _text;
		}
		
		//生成需要展现的数据
		/*function generateData(_item){
			var data_container = $("<div class='item-data-container'></div>");
			for(var key in data_message){
				if(typeof _item[data_message[key]]=="object"){
					for(var key_2 in _item[data_message[key]]){
						var _item_data = "<div class='item-data-line'><span class='item-data-key'>"+ key_2 +"：</span><span class='item-data-value'>"+ _item[data_message[key]][key_2] +"</span></div>";
						data_container.append(_item_data);
					}
				}else{
					var _item_data = "<div class='item-data-line'><span class='item-data-key'>"+ data_message[key] +"：</span><span class='item-data-value'>"+ _item[data_message[key]] +"</span></div>";
					data_container.append(_item_data);
				}
				
			}
			return data_container;
		}*/
        function generateData(_item){
            var data_container = $("<div class='item-data-container'></div>");
            for(var key in data_message){
                if(typeof data_message[key] == "string"){
                    if(typeof _item[data_message[key]]=="object"){
                        data_container.append("<hr/>");
                        for(var key_2 in _item[data_message[key]]){
                            var _item_data = "<div class='item-data-line'><span class='item-data-key'>"+ key_2 +"：</span><span class='item-data-value'>"+ _item[data_message[key]][key_2] +"</span></div>";
                            data_container.append(_item_data);
                        }
                    }else{
                        var _item_data = "<div class='item-data-line'><span class='item-data-key'>"+ data_message[key] +"：</span><span class='item-data-value'>"+ _item[data_message[key]] +"</span></div>";
                        data_container.append(_item_data);
                    }
                }else if(typeof data_message[key] == "object"){
                    if(typeof _item[data_message[key].v_key]=="object"){
                        data_container.append("<hr/>");
                        for(var key_2 in _item[data_message[key].v_key]){
                            if(data_message[key].v_sub_key.indexOf(key_2) != -1){
                                var _item_data = "<div class='item-data-line'><span class='item-data-key'>"+ key_2 +"：</span><span class='item-data-value'>"+ _item[data_message[key].v_key][key_2] +"</span></div>";
                                data_container.append(_item_data);
                            }
                        }
                    }
                }
            }
            return data_container;
        }
 
		//生成flow DOM
		function darwItem(container,bg_container,pid,items,left,right,maxSizeMap){
			if(items.length == 0){
				return;
			}
			
			var draw_item = [];   //缓存已经渲染的item；
			
			$(items).each(function(index, element) {

                if (element.psid == pid && draw_item.indexOf(element.sid + element.psid) == -1) {

                    var _sid = element.sid;

                    draw_item.push(_sid + pid);
					var item_container = $("<div class='flow-item-container'></div>")	;
					item_container.append("<div class='flow-item-children-container clearfix'></div>");		
					
					$(container).append(item_container);
					
					var bg_container_dom = $("<div class='flow-item-group-container' style='cursor: pointer;' node_id='"+element.target+"' onclick='selectNode(this)'></div>");
					var bg_left_dom = $("<div class='flow-item-bg-left'><span>"+ element.name +"</span></div>");
					bg_container_dom.append(bg_left_dom);
					bg_container.find(".flow-item-bg-container").append(bg_container_dom);

                    if (maxSizeMap) {
                        var maxSizeMapOfSid = maxSizeMap[_sid];
                        if (maxSizeMapOfSid && maxSizeMapOfSid > 0) {
                            var bg_left_bottom_dom = $("<div class='flow-item-bg-left flow-item-layout-bottom'><span title='过多的交易已被隐藏，这可能是由于节点中交易关联的配置出了问题'>" + maxSizeMapOfSid + "+</span></div>");
                            bg_container_dom.append(bg_left_bottom_dom);
                            bg_container_dom.addClass("more-items");
                        }
                    }
					$(items).each(function(index, element) {
						if(element.sid == _sid && element.psid == pid){

                            if ((element._latency_msec - element._trans_transfer_ms) < 0) {
                                element._latency_msec = element._trans_transfer_ms;
                                console.log("(element._latency_msec - element._trans_transfer_ms) < 0 ... update :element._latency_msec = element._trans_transfer_ms");
                            }

							var margin_left = (element._start_at_ms*1000 - left)/(right-left)*100;
							var margin_right = (right - element._start_at_ms*1000 - element._latency_msec)/(right-left)*100;
							var inner_width = element._trans_transfer_ms/element._latency_msec*100;
							var tmp_dom = $("<div class='flow-item'></div>");
							tmp_dom.css({
								"margin-left": margin_left + "%",
								"margin-right": margin_right + "%"
							});
							tmp_dom.attr("id",element.i + element.sid);
							tmp_dom.attr("data-psid",element.psid);
							item_container.prepend(tmp_dom);
							
							//生成item背景区域及对应数据
                            var bg_dom = $("<div class='flow-item-bg' title = \"交易来源节点: " + element.dataSourceNode + "\" data-item-id='" + element.i + element.sid + "'></div>");
							var bg_right_dom = $("<div class='flow-item-bg-right'></div>");
							var _item_data = generateData(element);
							bg_right_dom.append(_item_data);
							
							bg_dom.append(bg_right_dom);
							bg_container_dom.prepend($(bg_dom));
							
							if(_item_data.outerHeight() > bg_right_dom.height()){
								var _action_show = $("<a class='show-more-data'>更多</a>");
								bg_right_dom.append(_action_show);
								_action_show.click(function(){
									//$(bg_container).find(".show-more").removeClass("show-more");
									bg_dom.addClass("show-more");
								});
								var _action_close = $("<a class='close-more-data'>关闭</a>");
								_item_data.append(_action_close);
								_action_close.click(function(){
									bg_dom.removeClass("show-more");
								});
							}
							
							//添加传输延迟、延迟文本和交易代码
							var _inner_div = $("<div class='flow-item-inner-area'></div>");
							var _inner_right_text = $("<div class='flow-item-right-text'>"+ element._trans_transfer_ms +"ms</div>");
							var _inner_left_text = $("<div class='flow-item-left-text'>"+ (element._latency_msec-element._trans_transfer_ms) +"ms</div>");
							
							_inner_div.css({width:inner_width+"%"});

							var _inner_text = $("<div class='flow-item-inner-text'></div>");
							if(margin_left > 70){
								_inner_text.css({
									left:"auto",
									right:0
								});
							}
							if(!element.is_success){
								_inner_text.addClass("active");
							}
							_inner_text.text(element._trans_id);
							
							tmp_dom.append(_inner_div,_inner_text,_inner_right_text,_inner_left_text);
							
							var right_container_width = _inner_div.width();
							var left_container_width = tmp_dom.width() - right_container_width;
							var right_width = _inner_right_text.width();
							var left_width = _inner_left_text.width();
							
							if(right_container_width >= right_width){
								_inner_right_text.css("right", 0);
								_inner_right_text.addClass("show");
							}else{
								_inner_right_text.css("right", -right_width-4);
								_inner_right_text.addClass("show out");
							}
							
							if(left_container_width >= left_width){
								_inner_left_text.css("left", 0);
								_inner_left_text.addClass("show");
							}else{
								_inner_left_text.css("left", -left_width-4);
								_inner_left_text.addClass("show out");
							}
						}
                    });
					
					//递归
					var next_container = item_container.children(".flow-item-children-container")[0];
					darwItem(next_container,bg_container,element.sid,items,left,right,maxSizeMap);
				}
			});
		}
		
		function findParent(_item){
			var _parent = _item.parent().parent();
			if(_parent.hasClass("flow-item-children-container")){
				findParent(_parent.prev());
				_parent.prev().parent().children(".flow-item").addClass("active");
			}else{
				return;
			}
		}
		
		//事件绑定
		$(".flow-item-bg").live("mouseenter",function(){
			var _this = $("#"+$(this).attr("data-item-id"));
			_this.addClass("active");
			$(element).addClass("hover-state");
			findParent(_this);
		});
		
		$(".flow-item-bg").live("mouseleave",function(){
			$(element).removeClass("hover-state");
			$(".flow-item.active").removeClass("active");
		});
		
	}
	
	$.fn.ezflowdrawer = function(options){
		options = options || {};
		this.each(function () {
			var el = $(this);
			if (!el.data('ezflowdrawer'))
				el.data('ezflowdrawer', new EzFlowDrawer(el, options));
		});
	}
})(jQuery);