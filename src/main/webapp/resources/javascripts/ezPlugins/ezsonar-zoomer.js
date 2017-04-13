//路径图容器zoom事件-开始
var graph_div = document.getElementById('plot-frame');
var graph_slider = $("#graph-slider" );
var graph_slider_div = $(".graph-slider-container");
var graph_height;
var graph_width;
var plot_frame_height;
var plot_frame_width;
var mouse_x;
var mouse_y;
var add_event = false;
var zoom_flag;
var zoom_def = 1;
var zoom_state = 0;
var zoom_step = 0.1;
var zoom_max = 2;
var zoom_min = 0.1;
var resetting = false;
var quickzoom = false;
var _slider = false;           //支持slider bar 控制zoom

function eventToggle(){
	if(zoom_flag < zoom_max && !add_event){
		if(graph_div.addEventListener){ 
			graph_div.addEventListener('DOMMouseScroll',zoomTigger, false); 
		}
		graph_div.onmousewheel=zoomTigger;
		add_event = true;
	}else if(zoom_flag >= zoom_max){
		if (graph_div.removeEventListener){
			graph_div.removeEventListener('DOMMouseScroll', zoomTigger, false );
		}
		graph_div.onmousewheel=null;
		add_event = false;
	}
}

function zoomTigger(e){ 
	var direct=0; 
	e=e || window.event; 
	if(e.wheelDelta){ 
		direct=e.wheelDelta>0?1:-1; 
	}else if(e.detail){ 
		direct=e.detail<0?1:-1; 
	}
	
	mouse_x = e.pageX;
	mouse_y = e.pageY;
    
    // 为了不影响双击时鼠标位置放大，这里模拟slider操作，激活slider状态，这样就禁用了鼠标滚动时的鼠标位置缩放
    _slider = true;
	graphZoom(direct);
	_slider = false;
    
	if(e.preventDefault) {
		e.preventDefault();
		e.stopPropagation();
	}else{
		e.returnValue = false;
		e.cancelBubble = true;
	}
}

function zoomFlag(){
	var zoomObj = $("#tplot");
	graph_height = zoomObj.eq(0).height();
	graph_width = zoomObj.eq(0).width();
	plot_frame_height = $('#plot-frame').eq(0).height() - 10;
	plot_frame_width = $('#plot-frame').eq(0).width() - 10;
	var zoom_y = plot_frame_height/graph_height;
	var zoom_x = plot_frame_width/graph_width;
	zoom_flag = zoom_y>zoom_x?zoom_x:zoom_y;
    zoom_flag = Math.floor(zoom_flag*10)/10;  //只取小数点后一位
	if(zoom_flag > zoom_max){
		zoom_flag = zoom_def;
	}
}

function checkMin(){
	if(zoom_flag < zoom_min){
		zoom_min = zoom_flag/2;
		graph_slider.slider("destroy");
		graph_sliderInit();
	}
}

function graphZoom(direct){
	if((zoom_state == zoom_min && direct < 0 && direct != -2) || (zoom_state == zoom_max && direct > 0 && direct != 2)){
		return;
	}else if(!resetting){
		graphRelocater(direct);
		if(direct < 0){
			zoom_state = zoom_state - zoom_step;
			if(zoom_state < zoom_min){
				zoom_state = zoom_min;
			};
			//支持直接缩小至适屏
			if(direct == -2){
				zoom_state = zoom_flag;
			}
		}else if(direct > 0){
			zoom_state = zoom_state + zoom_step;
			if(zoom_state > zoom_max){
				zoom_state = zoom_max;
			};
			//支持直接放大至原大
			if(direct == 2){
				zoom_state = zoom_def;
			}
		}else{
			zoom_state = zoom_def;
		}
		graphResizer(zoom_state);
		initHandleDraggableTopo();
		graph_slider.slider("value",zoom_state);         //支持slider bar 控制zoom
	}
}

function graphResizer(state){
	var zoomer = $('#plot-frame .for-zoom');
	var _padding_top = zoomer.css("padding-top").replace("px","") - 0;
	var _padding_left = zoomer.css("padding-left").replace("px","") - 0;
	zoomer.css('-moz-transform','scale('+ state + ')');
	zoomer.css('-webkit-transform','scale('+ state + ')');
	zoomer.css('-o-transform','scale('+ state + ')');
	zoomer.css('-ms-transform','scale('+ state + ')');
	zoomer.css('transform','scale('+ state + ')');
	zoomer.css('margin-top','-'+ _padding_top*state +'px');
	zoomer.css('margin-left','-'+ _padding_left*state +'px');
	/*if(zoom_state == zoom_flag){
		resetting = true;
		quickzoom = false;
		graphRelocation();
	}*/
	
	// added by lix
	jsPlumb.setZoom(state);
	//尚未进行测试，以下代码：
	/*$(".editMode").draggable("destory");
	jsPlumb.draggable(".editMode",{
		grid: [state*20 , state * 20]
	});
	$(".radius-node").draggable("destory");
	jsPlumb.draggable(".radius-node",{
		grid: [state*10 , state * 10]
	});*/
	
}

function graphZoomInit(isScroll){
	zoom_flag = null;
	zoom_state = 0;
	zoomFlag();
	if(!isScroll){
		eventToggle();
	}
	
	if(zoom_state < zoom_flag){
		zoom_state = zoom_flag;
		//只有在编辑模式下默认原大
		if(isScroll != undefined ){
			zoom_state = 1;
		}
		graphResizer(zoom_state);
		graphRelocation();
	}
	
	initHandleDraggableTopo();
	graph_sliderInit();
}

function initHandleDraggableTopo()
{
	$("#btnNewNode").addClass("disabled");
	//如果zoom_state为1比1的比例时，可以拖拽
	if(zoom_state == 1)
	{
		$(".editTopo .node").draggable("enable");
		$(".editTopo .cloudNode").draggable("enable");
		$(".editTopo .topo-area").draggable("enable");
		$(".editTopo .topo-area").resizable("enable");
		//不能拖拽时，不可以添加节点
		$("#btnNewNode").removeClass("disabled");
	}
	else
	{
		$(".editTopo .node").draggable("disable");
		$(".editTopo .cloudNode").draggable("disable");
		$(".editTopo .topo-area").draggable("disable");
		$(".editTopo .topo-area").resizable("disable");
		//拖拽时，可以添加节点
		$("#btnNewNode").removeClass("disabled").addClass("disabled");
	}
}

function graphRelocation(){
	var _div = $('.for-zoom');
	var _top = Math.round((plot_frame_height - graph_height*zoom_flag)/2) + "px";
    // var _top = "50px";
	var _left = Math.round((plot_frame_width - graph_width*zoom_flag)/2) + "px";
	if(_div.css("left") != _left || _div.css("top") != _top){
		_div.stop().animate({
			"left":_left,
			"top":_top
		},200,function (){
				resetting = false;
			}
		);	
	}else{
		resetting = false;
	}
}

function graphRelocater(direct){
	var _div = $('#plot-frame').eq(0);
	var _graphZoom = $('.for-zoom').eq(0);
	var _zoom;
	var plot_frame_x = _div.offset().left;
	var plot_frame_y = _div.offset().top;
	
	//添加slider支持
	if((quickzoom && direct != 0) || _slider){
		mouse_x = plot_frame_x + (plot_frame_width + 10)/2;
		mouse_y = plot_frame_y + (plot_frame_height + 10)/2;
	}
	
	var tmp_width = mouse_x - plot_frame_x;
	var tmp_height = mouse_y - plot_frame_y;
	var graphZoom_x = parseFloat(_graphZoom.css("left").substring(0,(_graphZoom.css("left").length-2)));
	var graphZoom_y = parseFloat(_graphZoom.css("top").substring(0,(_graphZoom.css("top").length-2)));
	var _width = tmp_width - graphZoom_x;
	var _height = tmp_height - graphZoom_y;
	if(_width < 0 || _height <0){
		return;
	}
	if(direct == 0){
		var new_width = _width/zoom_state*zoom_def;
		var new_height = _height/zoom_state*zoom_def;
		var new_x = new_width + graphZoom_x;
		var new_y = new_height + graphZoom_y;
		var center_x = (plot_frame_width + 10)/2;
		var center_y = (plot_frame_height + 10)/2;
		var move_x = center_x - new_x;
		var move_y = center_y - new_y;
		graphZoom_x = move_x + graphZoom_x;
		graphZoom_y = move_y + graphZoom_y;
		_graphZoom.css("left",graphZoom_x +"px");
		_graphZoom.css("top",graphZoom_y +"px");
		return;
	}
	if(direct > 0){
		_zoom = zoom_state + zoom_step;
		if(_zoom > zoom_max){
			_zoom = zoom_max;
		}
		//支持直接放大至原大
		if(direct == 2){
			_zoom = zoom_def;
		}
	}else{
		_zoom = zoom_state - zoom_step;
		if(_zoom < zoom_min){
			_zoom = zoom_min;
		}
		//支持直接缩小至适屏
		if(direct == -2){
			_zoom = zoom_flag;
		}
	}
	var new_width = _width/zoom_state*_zoom;
	var new_height = _height/zoom_state*_zoom;
	var move_x = _width - new_width;
	var move_y = _height - new_height;
	graphZoom_x = move_x + graphZoom_x;
	graphZoom_y = move_y + graphZoom_y;
	_graphZoom.css("left",graphZoom_x +"px");
	_graphZoom.css("top",graphZoom_y +"px");
}
//路径图容器zoom事件-结束

$(document).ready(function(){
	//路径图拖动
	var _for_zoom_div = $('.for-zoom');
	_for_zoom_div.draggable({
		scroll: false, 
		start:function(){
			_for_zoom_div.addClass("closehand");
			if(typeof(dragFlag) != 'undefined') //业务路径展示页面拖动
				dragFlag = -1;
		},
		stop:function(){
			_for_zoom_div.removeClass("closehand");
			if(zoom_flag == zoom_state){
				//自动调整位置
				//graphRelocation();
			}
		}
	});
	
	//路径图双击放大
	$('.for-zoom').dblclick(function(e){
		if($(e.srcElement).parents(".node").length > 0 || $(e.srcElement).parents(".area").length > 0 || $(e.srcElement).hasClass("_jsPlumb_overlay"))
		{
			return;
		}
		if(zoom_state >= zoom_max){
			return;
		}
		e=e || window.event;
		mouse_x = e.pageX;
		mouse_y = e.pageY;
		graphZoom(0);
		quickzoom = true;
	});
	
	$(".zoom-in").click(function(){
		_slider = true;
		graphZoom(1);
		_slider = false;
	});
	$(".zoom-out").click(function(){
		_slider = true;
		graphZoom(-1);
		_slider = false;
	});
	$(".resize-full").click(function(){
		_slider = true;
		graphZoom(2);
		_slider = false;
	});
	$(".resize-small").click(function(){
		_slider = true;
		zoomFlag();
		checkMin();
		graphZoom(-2);
		graphRelocation();
		_slider = false;
	});
	
});

//slider控制路径图缩放
function graph_sliderInit() {
	graph_slider.slider({
		orientation: "vertical",
		min: zoom_min,
		max: zoom_max,
		step: zoom_step,
		value: zoom_state,
		slide: function(event, ui){
			_slider = true;
			var _dir = 0;
			if(zoom_state > ui.value){
				_dir = -1;
			}else{
				_dir = 1;
			}
			graphZoom(_dir);
			_slider = false;
		},
		start: function( event, ui ) {
			graph_slider_div.addClass("slider-move");
		},
		stop: function( event, ui ) {
			graph_slider_div.removeClass("slider-move");
		}
	});
	if(zoom_min == zoom_max){
		graph_slider_div.addClass("disabled");
	};
}