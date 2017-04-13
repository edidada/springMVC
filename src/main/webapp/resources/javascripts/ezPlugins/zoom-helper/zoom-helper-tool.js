/**
 * @description zoom helper工具类
 * @param state
 */

var zoomStep = 0.1;
var zoomMax = 1;
var zoomMin = 0.05;

var btnsFunctionMap = {
    zoomToMax : 'zoomToMax',
    zoomIn : 'zoomIn',
    zoomOut : 'zoomOut',
    zoomToSuitable : 'zoomToSuitable'
};

var toolsBtnState = {
    zoomToMax : true,
    zoomIn : true,
    zoomOut : true,
    zoomToSuitable : true
};

var toolsBtnStates = {
    max : {
        zoomToMax : false,
        zoomIn : false,
        zoomOut : true,
        zoomToSuitable : true
    },
    min : {
        zoomToMax : true,
        zoomIn : true,
        zoomOut : false,
        zoomToSuitable : true
    },
    def : {
        zoomToMax : true,
        zoomIn : true,
        zoomOut : true,
        zoomToSuitable : true
    }
};

var toolsBtns = {};
var graphSlider = null;

/**
 * @description 检查按钮状态
 * @param state
 */
function checkBtnState(state){
    for(var key in toolsBtnStates[state]){
        if(toolsBtnState[key] != toolsBtnStates[state][key]){
            toolsBtnState[key] = toolsBtnStates[state][key];
            updateBtnState(toolsBtns[key],toolsBtnState[key]);
        }
    }
}

/**
 * @description 更新按钮状态
 * @param btn
 * @param state
 */
function updateBtnState(btn,state){
    if(btn){
        if(state){
            btn.removeAttr('disabled');
        }else{
            btn.attr('disabled','disabled');
        }
    }
}

/**
 * @description 初始化zoom插件
 */
function setZoomer() {
	graphSlider = $("#graph-slider");
	var zoomer = new zoomHelper({
        container: '.zoom-container',
        zoomer: '#char',
        afterZoom: function(data){
        	jsPlumb.setZoom(data.scale);
            checkBtnState(data.state);
            if(graphSlider.data('slider')){
            	graphSlider.slider("value",data.scale);
            }
            if(myInfoTip){
            	myInfoTip.setTargetScale(data.scale);
            }
        },
        zoomMax: zoomMax,
        zoomMin: zoomMin,
        zoomStep: zoomStep
    });
	
	graphSliderInit(zoomer);
	
	$(".js-tools-btn").each(function(){
	    var _this = $(this);
	    var _key = _this.attr('data-action-type');
	    toolsBtns[_key] = _this;
	});

	for(var btn in toolsBtns){
	    toolsBtns[btn].on('click',{key: btn},function(event){
	    	zoomer[btnsFunctionMap[event.data.key]]();
	    });
	}
	checkBtnState(zoomer.getState().state);
	graphSlider.slider("value",zoomer.getState().scale);
	
	return zoomer;
}

/**
 * @description slider控制路径图缩放
 * @param zoomer
 */
function graphSliderInit(zoomer) {
	graphSlider.slider({
		orientation: "vertical",
		min: zoomMin,
		max: zoomMax,
		step: zoomStep,
		value: zoomer.getState().scale,
		slide: function(event, ui){
			zoomer.zoomToScale(ui.value);
		},
		start: function( event, ui ) {
			$(".graph-slider-container").addClass("slider-move");
		},
		stop: function( event, ui ) {
			$(".graph-slider-container").removeClass("slider-move");
		}
	});
	if(zoomMin == zoomMax){
		$(".graph-slider-container").addClass("disabled");
	};
}