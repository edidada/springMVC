/**
 * @description 自动完成插件
 * @author E_Bo
 * @date 2014-12-12 edit by SHENT
 * @work with jQuery & jQuery UI
 */
(function($){
	
	/**
	 * @description 操作符
	 */
	var OPERATE_ARRAY = ["AND","OR","NOT"];
	/**
	 * @description 键值对象
	 */
	var keyObject = { 
			SPACE_KEY_CODE : 32, //空格
			COLON_KEY_CODE : 186, //冒号
			BACK_KEY_CODE : 8,   //BackSpace
			PARENTHESES_KEY_CODE : 57, //括弧
			QUOTATION_KEY_CODE : 222 //引号
	};
	/**
	 * @description 键值数组
	 */
	var KEY_CODE_ARRAY = [
	        keyObject.SPACE_KEY_CODE,
            keyObject.COLON_KEY_CODE,
            keyObject.BACK_KEY_CODE,  
            keyObject.PARENTHESES_KEY_CODE,
            keyObject.QUOTATION_KEY_CODE
	];
	/**
	 * @description 取消执行自动完成的key值
	 */
	var CANCEL_SEARCH_KEY_ARRAY = [
	        67, //鼠标选中
	        16, //shift
	        17, //ctrl
	        37, //→键
	        39	//←键
	];
	/**
	 * @description 取消后台查询
	 */
	var CANCAL_SEARCH_REQUEST = false;
	
	$.ezhelperno = 0;
	/**
     * @description ez-helper 控件
     * @param {$.fn.ezhelper.defaults} options 参数或者调用名
     * @param {Param} param 参数
     * @return {$.fn.ezhelper}
     */
    $.fn.ezhelper = function (options, param) {
        if (typeof options == "string") {
            return $.fn.ezhelper.methods[options](this, param);
        }
        options = options || {};
        return this.each(function () {
        	$.ezhelperno += 1;
            var state = $.data(this, "ezhelper");
            if (state) {
                $.extend(state.options, options);
            } else {
            	options.autoCompleteAreaID = "ez_auto_complete_" + $.ezhelperno;
            	options.elementId = $(this).attr("id");
                state = $.data(this, "ezhelper", {
                    options: $.extend({}, $.fn.ezhelper.defaults, options)
                });
                init(this); //初始化插件
                loadDataFromServer(this);//加载数据
            }
        });
    };
    /**
     * @class
     * @extends external:{$.fn.ezhelper}
     * @description 默认选项
     * @return {$.fn.ezhelper.defaults} 默认数据
     */
	$.fn.ezhelper.defaults = {
		/**
		 * @description 前置条件，如当前文本为[_trans_id:viewItem],
		 * 				则CURRENT_TERM保存为[_trans_id:]这样在切换_trans_id的值时方便组合字符串
		 */
		CURRENT_TERM : "",
		/**
		 * @description 当前queryString, 根据AutoComplete的search事件随时改变
		 */
		CURRENT_VALUE : "",
		/**
		 * @description 光标位置
		 */
		CURSOR_INDEX : 0,
		/**
         * 隐藏部分指标
         */
        displayMetric: [],
		/**
		 * @description 初始数据源
		 */
		availableTags : [],
		/**
		 * @description 初始数据源备份
		 */
		backUpMetricData : [],
		/**
		 * @description 显示自动完成区域
		 */
		showAutoComplete : true,
		/**
		 * @description 显示帮助区域
		 */
		showHelperArea : true,
		/**
		 * @description 显示打开过滤器按钮
		 */
		showFilterListBtn : true,
		/**
		 * @description 显示保存按钮
		 */
		showSaveBtn : true,
		/**
		 * @description 显示清除按钮
		 */
	 	showClearBtn : true,
	 	/**
		 * @description 是否触发查询事件
		 */
	 	triggerEvent : true,
	 	/**
		 * @description 修复宽度
		 */
	 	fixedWidth : false,
	 	/**
		 * @description 配置时，请使用number，除了自适应之外，不要使用string
		 */
		filterListWidth : "auto",
	 	containerClass : "ez-filter-container",
	 	inputClass : "filter-input",
	 	helperAreaClass : "filter-input-helper-area",
	 	autoCompleteAreaClass : "auto-complete-area",
	 	helpTextAreaClass : "help-text-area"
	};
		
    /**
     * @class
     * @extends external:{$.fn.ezhelper}
     * @description ezhelper 调用方法
     */
    $.fn.ezhelper.methods = {
        /**
         * @description 获取 ezhelper 选项
         * @param {Object} jq 对象
         * @return {$.fn.ezhelper.defaults} ezhelper 选项
         */
        options: function (jq, data) {
            if (typeof data == "undefined") {
                return $.data(jq[0], "ezhelper").options;
            }
            data = data || {};
            $.data(jq[0], "ezhelper", {options: $.extend({}, $.data(jq[0], "ezhelper").options, data)});
            return $.data(jq[0], "ezhelper").options;
        },
        /**
         * @description 从服务器重新载入 ezhelper
         * @param {Object} jq 对象
         * @param {$.fn.ezhelper.defaults} param 选项参数
         * @return {$.fn.ezhelper} ezhelper
         */
        loadDataFromServer: function (jq, param) {
            return jq.each(function () {
            	loadDataFromServer(this, param);
            });
        },
        /**
         * @description 检查queryString是否能成功执行
         * @param {Object} jq 对象
         * @param {$.fn.ezhelper.defaults} param 选项参数
         * @return {$.fn.ezhelper} ezhelper
         */
        checkQueryValid: function (jq, param) {
            return checkQueryValid(jq, param);
        }
    };
    
    /**
     * @description 初始化插件
     * @param {Object} target 目标对象
     */
    function init(target){
		var opts = $.data(target, "ezhelper").options;
		var targetObj = $(target);
		if (!targetObj.hasClass(opts.inputClass)){
			targetObj.addClass(opts.inputClass);
		}
		if(opts.filterListWidth == "auto"){
			opts.filterListWidth = targetObj.outerWidth();
		}
		 
		$.ez_containerSelector = opts.containerClass;
		$.ez_helperAreaSelector = opts.helperAreaClass;
		 
		if(!opts.showAutoComplete){
			opts.helperAreaClass += " no-auto-complete";
		}
		if(!opts.showHelperArea){
			opts.helperAreaClass += " no-helper-area";
		}
		 
		//语法验证提示图标
		var verification_state_area = '<div class="ez-filter-verification"><i class="icon-exclamation-sign icon-white" title="语法错误"></i><i class="icon-ok-sign icon-white" title="语法正确"></i></div>';
		 
		//过滤器列表按钮+list区域
		var filter_list_area = '<div class="ez-dropmenu" style="top:50%;left:0px;right:auto;margin-top:-10px;"></div>';
		var show_filter_list_btn = '<a data-toggle="dropdown" class="ez-dropmenu-btn ez-icon-btn" style="margin-left:3px;"><i class="icon-filter"></i></a>';
		targetObj.filterList = $('<div class="ez-dropmenu-list-con for-dark-theme dropdown-menu pull-left for-icon-btn-20" style="width:'+ opts.filterListWidth +'px;padding:6px;"></div>');
		targetObj.filterItemSearch = $('<input type="text" class="dropmenu-input" id="filter_items_search" style="padding:2px 6px; width:'+ (opts.filterListWidth - 28) +'px;">');
		targetObj.searchInputIcon = $('<div class="ez-dropmenu-btn dropmenu-icon"><i class="icon-search"></i></div>');
		targetObj.searchInputArea = $('<div style="position:relative;"></div>').append(targetObj.filterItemSearch, targetObj.searchInputIcon); 
		 
		var filter_list_item = '<ul class="filter-item-list"></ul>';
		targetObj.filterList.append(targetObj.searchInputArea, filter_list_item); 
		targetObj.filterListArea = $(filter_list_area);
		targetObj.filterListArea.append(show_filter_list_btn, targetObj.filterList);
		getFilters();
		 
		//过滤器保存按钮+表单区域
		var filter_save_area = '<div class="ez-dropmenu" style="top:50%;right:0px;margin-top:-10px;"></div>';
		var filter_save_btn = '<a class="ez-dropmenu-btn ez-icon-btn" style="margin-right:3px;"><i class="icon-save" title="保存当前过滤器"></i></a>';
		var save_area = '<div class="ez-dropmenu-list-con dropdown-menu pull-right for-icon-btn-20" style="width:200px; height:80px;"></div>';
		var input_form = '<div class="filter-save-form"></div>';
		var filter_name = '<input type="text" placeholder="过滤器名称" id="filter_name"/>';
		var share_form = '<label><input type="radio" name="filter_share" value="1" checked>公开</label><label><input type="radio" name="filter_share" value="0">私有</label>';
		var share_form_2 = '<label><input type="checkbox" id="_filter_share" name="filter_share" value="1" checked="checked">公开</label>';
		var form_btn_area = '<div class="filter-save-form-btn"></div>';
		targetObj.filterSaveConfirmBtn = $('<button type="button" class="btn btn-success mini">确定</button>');
		targetObj.formBtnArea = $(form_btn_area).append(targetObj.filterSaveConfirmBtn);
		targetObj.filterSaveBtn = $(filter_save_btn);
		targetObj.inputForm = $(input_form);
		targetObj.inputForm.append(filter_name,share_form_2);
		targetObj.saveArea = $(save_area);
		targetObj.saveArea.append(targetObj.inputForm, targetObj.formBtnArea);
		targetObj.filterSaveArea = $(filter_save_area);
		targetObj.filterSaveArea.append(targetObj.filterSaveBtn, targetObj.saveArea);
		 
		//下方弹出区域容器
		var filter_helper_area = '<div class="'+ opts.helperAreaClass +'"></div>';
		targetObj.helperArea = $(filter_helper_area);
		 
		//自动补全区域
		var auto_complete_area = '<div class="'+ opts.autoCompleteAreaClass +'" id="'+ opts.autoCompleteAreaID +'"></div>';
		targetObj.autoCompleteArea = $(auto_complete_area);
		 
		//帮助文本区域
		var help_text_area = '<div class="'+ opts.helpTextAreaClass +'"></div>';
		targetObj.helpTextArea = $(help_text_area);
		var help_text = '<div class="scroll-area">'+ 
						'<p class="help-step">1.范围查询</p>' +
						'<p>日期：<span>date:[2012/01/01 TO 2012/12/31] 和  date:{* TO 2012/01/01}</span></p>' +
						'<p>数字：<span>_start_at:[1392614000 TO 1392615555] 和  _start_at:[1392614000 TO *]</span></p>' +
						'<p>大小与：<span>_in_bytes:>10 和 _in_bytes:<=10 和  _in_bytes:(>=10 AND < 20)</span></p>' +
						'<p class="help-step">2.包含</p>' +
						'<p>包含：<span>_src_ip:192.168.1*</span></p>' +
						'<p>包含多个：<span>_src_ip:(192.168.1.1 192.168.1.2)</span></p>' +
						'<p>精确匹配：<span>_src_ip:"192.168.1.1"</span></p>' +
						'<p class="help-step">3.正则表达式</p>' +
						'<p>使用 / 放在表达式的首尾：<span>_trans_id:/GET.*cat3.gif/ </span></p>' +
						'<p>使用?和*：<span>_trans_id:/joh?n(ath[oa]n)/</span></p>' +
						'<p>查询JSON字段例如_ret_code.response和_ret_code.HTTP包含success或failure：<span>_ret_code.\\*:(success failure)</span></p>' +
						'<p class="help-title">多条件用AND或OR相连: </p>' +
						'<p>_src_ip:192.168.1.1 AND (_latency_msec:>100 OR _sport:8080)</p>' +
						'<p class="help-title">保留字符</p>' +
						'<p>如下字符  + - && || ! ( ) { } [ ] ^ " ~ * ? : \ /  需要用转义字符\\, 例如：\\(1\\+1\\)=2</p>'+
					 '</div>';
		targetObj.helpTextArea.append(help_text);
		//内容清除按钮
		var _ezClaerRight = 0;
		if(opts.showSaveBtn){
			_ezClaerRight = 24;
		}
		var _ezClearHeight = targetObj.height();
		var half_ezClearHeight = _ezClearHeight/2;
		targetObj.ezClearBtn = $('<a class="ez-filter-input-clear" style="height:'+ _ezClearHeight +'px; top:50%; margin-top:-'+ half_ezClearHeight +'px; right:'+ _ezClaerRight +'px"><i class="icon-remove-circle"></i></a>');

		
		if(!opts.fixedWidth){
			targetObj.wrap('<div class="'+ opts.containerClass +'" style="height:'+ targetObj.outerHeight() +'px;"></div>');
		}else{
			targetObj.wrap('<div class="'+ opts.containerClass +'" style="height:'+ targetObj.outerHeight() +'px; width:'+ targetObj.outerWidth() +'px;"></div>');
		}
		
		targetObj.helperArea.append(targetObj.autoCompleteArea, targetObj.helpTextArea);
		
		targetObj.after(verification_state_area, targetObj.helperArea);
		
		//添加过滤器列表区域
		if(opts.showFilterListBtn){
			targetObj.addClass("has-filter-list");
			targetObj.before(targetObj.filterListArea);
		}
		
		//添加保存过滤器区域
		if(opts.showSaveBtn){
			targetObj.addClass("has-save-filter");
			targetObj.before(targetObj.filterSaveArea);
		}
		
		//添加清除按钮
		if(opts.showClearBtn){
			targetObj.addClass("has-clear-btn");
			targetObj.after(targetObj.ezClearBtn);
		}
		
		//事件绑定
		$(document).click(function (event) {
			src_element = $(event.srcElement || event.target);
			if (src_element.parents("." + $.ez_containerSelector).length == 0){
				$("." + $.ez_helperAreaSelector).css("visibility","hidden");
			}
			if (src_element.parents(".ez-dropmenu").length == 0){
				$(".ez-dropmenu").removeClass("open");
			}
        });
		
		if(opts.showFilterListBtn){
			targetObj.filterListArea.click(function(){
				$("."+$.ez_helperAreaSelector).css("visibility","hidden");
			});
			
			targetObj.searchInputArea.click(function(e){
				e.stopPropagation();
			});
			
			$(".filter-item-list").each(function(index, element) {
				ezMouseSroll(element,element);
            });
			
			ulFolterInit(targetObj.filterItemSearch, targetObj.parent("."+$.ez_containerSelector).find(".filter-item-list"));
		}
		
		if(opts.showSaveBtn){
			targetObj.filterSaveArea.click(function(){
				$("."+$.ez_helperAreaSelector).css("visibility","hidden");
			});
			targetObj.filterSaveBtn.click(function(e){
				var _droplist = $(this).parent();
				if(_droplist.hasClass("open")){
					_droplist.removeClass("open");
				}else{
					_droplist.addClass("open");
				}
				
			});
			
			//绑定保存过滤器按钮事件
			targetObj.filterSaveConfirmBtn.click(function(){
				var _filter_name = $(this).parents(".filter-save-form-btn").prev().find("#filter_name").val();
				var _filter_value = targetObj.val();
				var _is_share = $("#_filter_share").is(":checked");
				if(_filter_name.trim() == "" || _filter_name == null){
					GMS.error("名称不能为空!");
					return;
				}
				if(_filter_value.trim() == "" || _filter_name == null){
					GMS.error("值不能为空!");
					return;
				}
				if(!checkQueryValid(targetObj, _filter_value)){
					return;
				}
				saveFilter(_filter_name, _filter_value, _is_share);//保存过滤器
				$(this).parents(".ez-dropmenu").removeClass("open");
			});
		}
		
		//清除按钮
		if(opts.showClearBtn){
			targetObj.ezClearBtn.click(function(){
				$(this).parent("."+$.ez_containerSelector).find("input.filter-input").val("");
				$(this).css("visibility","hidden");
			});
			targetObj.keydown(function(){
				$(this).nextAll(".ez-filter-input-clear").css("visibility","visible");
			});
			targetObj.keyup(function(){
				if($(this).val().length == 0){
					$(this).nextAll(".ez-filter-input-clear").css("visibility","hidden");
				}
			});
		}
		if(opts.showAutoComplete){
			opts.targetObj = targetObj;
			autocomplete(opts);
		}
    }
    /**
     * @description 自动完成事件绑定
     * @param opts
     */
    function autocomplete(opts){
		var keyCode = "-1", shiftKey = false;
		var targetObj = opts.targetObj;
		targetObj.keydown(function(event){
			keyCode = event.keyCode;
			shiftKey = (event != undefined) ? event.shiftKey : false;
			if(keyCode == 13){ //敲击Enter键并且没有选中项时触发查询
				if(opts.triggerEvent && $(".ui-state-focus").length == 0){
					jQuery.event.trigger("doQuerySearch");
				}
				targetObj.nextAll("."+$.ez_helperAreaSelector).css("visibility","hidden");
				CANCAL_SEARCH_REQUEST = true; 			 //取消后台查询
			}
		});
		//处理AutoComplete自动改变值的问题
		targetObj.live("mouseleave",function(){
			$(".ui-menu-item").die("mouseleave").live("mouseleave",function(){
				targetObj.val(opts.CURRENT_VALUE);
			});
		});
		
		targetObj.unbind("click").bind("click", function(event){
			var index = getFocusIndex(targetObj);
			if(opts.CURSOR_INDEX != index){
				opts.CURSOR_INDEX = index;
				current_metric = null;//置空current_metric
				opts.availableTags = [];
			}
		});
		//扩展jQuery UI 插件，改变容器宽度
		var _id = opts.autoCompleteAreaID;
		$.widget( "custom.ezAutocomplete", $.ui.autocomplete,{
			_resizeMenu: function() {
				this.menu.element.width($("#"+_id).outerWidth()-5);
			},
			search : function(value , event){
				if($.inArray(keyCode, CANCEL_SEARCH_KEY_ARRAY) >= 0){
					if(keyCode == 37 || keyCode == 39){
						opts.CURSOR_INDEX = getFocusIndex(targetObj);
						setFocusIndex(opts.CURSOR_INDEX, targetObj);
					}
					return;
				}
				if(event && (event.ctrlKey && keyCode == 65)){ //ctrl + a
					return;
				}
				targetObj.nextAll("."+$.ez_helperAreaSelector).css("visibility","visible");
				var val = handleValueOnSearch(keyCode, shiftKey, opts, targetObj);
				this._search(val);
			}
		});
		
		targetObj.ezAutocomplete({
			appendTo: "#"+_id,
			source: function( request, response ) {
				var term = request.term;
				if(term !=null && term.trim() != ""){
					 switch(keyCode){
				        case keyObject.COLON_KEY_CODE:   //冒号
				        	colonKeyEvent(term, response, opts, targetObj);
				        break;
				        case keyObject.SPACE_KEY_CODE:  //空格
				        	term = spaceKeyEvent(term, opts);
				        break;
				        case keyObject.BACK_KEY_CODE: //Backspace
				        	term = backSpaceKeyEvent(term, response, opts, targetObj);
				        break;
				        case keyObject.PARENTHESES_KEY_CODE: //括号
				        	term = parenthesesKeyEvent(term, opts, targetObj, shiftKey);
				        break;
				        case keyObject.QUOTATION_KEY_CODE: //引号
				        	term = quotationKeyEvent(term, opts);
				        break;
				    }
			   }else{
				   defaultEvent(term, opts, targetObj);
			   }
			   response( $.ui.autocomplete.filter(opts.availableTags, term) );
			   targetObj.val(opts.CURRENT_VALUE);
			   setFocusIndex(opts.CURSOR_INDEX, targetObj);
			},
			select: function( event, ui ) {
				var _value = this.value; //文本框的值
				var _selectValue = ui.item.value; //选中项的值
				if(!addQuotation(opts, _selectValue)){
					_selectValue = "\"" + _selectValue + "\"";
				}
				var frontValue="", lastValue="";
				if(opts.CURSOR_INDEX > 0 && opts.CURSOR_INDEX < _value.length){//当光标在字符串中间
					frontValue = _value.substring(0, opts.CURSOR_INDEX); 	   //截取至光标位置
					if($.inArray(_selectValue, OPERATE_ARRAY) >= 0){      	   //如果选择的是操作符
						frontValue = frontValue.substring(0, frontValue.lastIndexOf(" ")+1);
					}else{
						if(frontValue.lastIndexOf(" ") != frontValue.length-1){
							frontValue = getString(frontValue);//前半段值
						}
					}
					lastValue = _value.substring(opts.CURSOR_INDEX, _value.length);				//后半段值
					targetObj.val((frontValue+_selectValue+lastValue).replace(/\"\"/g,"\""));   //前半段值+ 选中的值 + 后半段值
					setFocusIndex((frontValue+_selectValue).length, targetObj); 				//设置光标位置
				}else{
					targetObj.val(opts.CURRENT_TERM + _selectValue);
				}
				opts.CURSOR_INDEX = getFocusIndex(targetObj);
				opts.CURRENT_VALUE = targetObj.val(); 	 //设置当前值
				current_metric = null;
				CANCAL_SEARCH_REQUEST = true; 			 //取消后台查询
				return false;
			},
			focus: function( event, ui ) {
				targetObj.val(opts.CURRENT_VALUE);
				setFocusIndex(opts.CURSOR_INDEX, targetObj);
				return false;
			}
		});
		
		targetObj.unbind("focus").bind("focus", function(event){
			if(targetObj.val() == "" || targetObj.val() == null){
				targetObj.ezAutocomplete("search", "");
			}else{
				targetObj.nextAll(".ez-filter-input-clear").css("visibility","visible");
			}
			targetObj.nextAll("."+$.ez_helperAreaSelector).css("visibility","visible");
		});
    }
	
    /**
     * 是否需要添加引号
     * @param opts
     * @param _selectValue
     */
	function addQuotation(opts, _selectValue){
		var bool = false;
		for(var i in opts.backUpMetricData){
			var metric = opts.backUpMetricData[i].value;
			if(_selectValue == metric){
				bool = true;
				break;
			}
		}
		if($.inArray(_selectValue, OPERATE_ARRAY) >= 0){
			bool = true;
		}
		return bool;
	}
	/**
	 * @description 获取数据
	 * @param param
	 * @param callbackFunc
	 * @param timeobj
	 * @returns
	 */
	function getMetricDatas(param, callbackFunc, timeobj){
		if(CANCAL_SEARCH_REQUEST){ //取消后台查询
			return;
		}
		if((timeobj.from != null && timeobj.from != "") && (timeobj.to != null && timeobj.to != "")){
    		if(((timeobj.to - timeobj.from)/7200) >= 1){
    			param.from = (timeobj.to -7200);
    			param.to = timeobj.to;
    			timeobj.to = param.from;
    			ajaxRequest(param, callbackFunc, timeobj, false);
    		}else{
    			if(timeobj.from < timeobj.to){
    				param.from = timeobj.from;
        			param.to = timeobj.to;
        			ajaxRequest(param, callbackFunc, timeobj, true);
    			}
    		}
    	}else{
    		ajaxRequest(param, callbackFunc, timeobj, true);
    	}
	}
	/**
	 * @description 发送请求
	 * @param param 参数
	 * @param callbackFunc 回调函数
	 * @param timeobj 时间对比对象
	 * @param isEnd 是否结束递归
	 * @returns
	 */
	function ajaxRequest(param, callbackFunc, timeobj, isEnd){
		$.ajax({
	    	url : SUBSYSTEM_APP_NAME+"autocomplete/getMetricData",
	    	type : "post",
	    	data : param,
	        success : function (data) {
	        	callbackFunc(data, param.i);
	        	if(!isEnd){
	        		param.i = param.i + 1;
	    			setTimeout(function(){
	    				getMetricDatas(param, callbackFunc, timeobj);
	    			}, 3000);
	    		}
	        }
		});
	}
	/**
	 * 初始化数据
	 * @param target
	 * @param param
	 * @returns
	 */
	function loadDataFromServer(target, param){
		var opts = $.data(target, "ezhelper").options;
		opts.availableTags = [];
		opts.backUpMetricData = [];
		if(param == undefined || param == ""){
			param = new Object();
			param.stream_id = opts.stream_id;
			param.stream_type = opts.stream_type;
		}else{
			opts.stream_id = param.stream_id;
			opts.stream_type = param.stream_type;
		}
		//初始化metric
		$.ajax({
	    	url : SUBSYSTEM_APP_NAME+"autocomplete/initMetrics",
	    	type : "post",
	    	data : param,
	        success : function (data) 
            {
                var obj = data.obj;
                if (data.success && obj != null) {

                    var displayMetric = opts.displayMetric;
                    //隐藏指定的属性
                    if (displayMetric) { LOOP:
                        for (var i = 0; i < obj.length; i++) {
                            var v = obj[i].value;
                            for (var y = 0; y < displayMetric.length; y++) {
                                if (v === displayMetric[y]) {
                                    obj.splice(i--, 1);
                                    displayMetric.splice(y--, 1);
                                    if (displayMetric.length == 0) {
                                        break LOOP;
                                    }
                                }
                            }
                        }
                    }
                    opts.availableTags = obj;
                    opts.backUpMetricData = obj;
                } else {
                    GMS.error("指标加载出错.");
                }
            }

		});
	}
	/**
	 * @description 检查queryString是否能成功执行
	 * @param target
	 * @param queryString
	 */
	function checkQueryValid(target, queryString){
		var isValid = true;
		if(queryString != null && queryString.trim() != ""){
			$.ajax({
		    	url : SUBSYSTEM_APP_NAME + "autocomplete/checkQueryValid",
		    	type : "post",
		    	async : false,
		    	data : {
		    		queryString: queryString
		    	},
		        success : function (data) {
		        	if(data.success){
		        		return;
		        	}else{
		        		GMS.error(data.msg);
		        		isValid = data.success;
		        		if(target != null){
		        			target.focus();
		        		}
		        	}
		        }
			});
		}
		return isValid;
	}
	/**
	 * 获取过滤器
	 * @returns
	 */
	function getFilters(){
		$.ajax({
	    	url : APP_NAME+"filters/getFilters",
	    	type : "post",
	    	data : {},
	        success : function (data) {
	        	if(data.success){
	        		$(".filter-item-list").empty();
	        		var filterArray = data.obj;
	        		if(filterArray && filterArray.length > 0){
	        			var html = '';
	        			for(i in filterArray){
	        				var filter = filterArray[i];
	        				html += '<li class="shown"><a><span class="filter-name">'+filter.name+'</span>';
	        				html += '<span class="filter-code">'+filter.value+'</span></a></li>';
	        			}
	        			$(".filter-item-list").append(html);
	        		}else{
	        			$(".filter-item-list").append("查无数据!");
	        		}
	        	}else{
	        		GMS.error(data.msg);
	        	}
	        }
		});
	}
	/**
	 * 保存过滤器
	 * @param _filter_name
	 * @param _filter_value
	 * @param is_share
	 * @returns
	 */
	function saveFilter(_filter_name, _filter_value, _is_share){
		$.ajax({
	    	url : APP_NAME+"filters/save",
	    	type : "post",
	    	data : {
	    		name : _filter_name,
	    		value : _filter_value,
	    		is_share : _is_share
	    	},
	        success : function (data) {
	        	if(data.success){
	        		GMS.success(data.msg);
	        		var html = '<li class="shown"><a><span class="filter-name">' + _filter_name + '</span>'+
    						   '<span class="filter-code">' + _filter_value + '</span></a></li>';
    				$(".filter-item-list").prepend(html);
	        	}else{
	        		GMS.error(data.msg);
	        	}
	        }
		});
	}
	/**
	 * 获取光标在文本框的位置
	 * @param targetObj
	 */
	function getFocusIndex(targetObj) { 
		var elm = targetObj[0];
		if(typeof elm.selectionStart == 'number') { // Other
	        return elm.selectionStart;   
	    }else if(elm.createTextRange) { // IE
	        var range = window.getSelection();                  
	        range.setEndPoint('StartToStart', elm.createTextRange());                  
	        return range.text.length;   
	    }
	}
	/**
	 * 设置光标在文本框的位置
	 * @param index
	 * @param targetObj
	 */
	function setFocusIndex(index, targetObj){
		var elm = targetObj[0];
		if(elm.setSelectionRange){
			elm.focus();
			elm.setSelectionRange(index,index);
		}else if (elm.createTextRange) {
			var range = elm.createTextRange();
			range.collapse(true);
			range.moveEnd('character', index);
			range.moveStart('character', index);
			range.select();
		}
	}
	/**
	 * 设置当前的值
	 * @param term
	 * @param opts
	 */
	function setCurrentTerm(term, opts){
		opts.CURRENT_TERM = term;
		return term = "";;
	}
	/**
	 * 获取数据
	 * @param metricValue
	 * @param response
	 * @param opts
	 */
	function responseData(metricValue, response, opts){
		var options = $.data(opts.targetObj[0], "ezhelper").options;
		var timeobj = new Object();
		if((options.from != null && options.from != "") && (options.to != null && options.to != "")){
			opts.from = options.from;
			opts.to = options.to;
			timeobj.from = opts.from;
			timeobj.to = opts.to;
		}
		var param = {
			metric : metricValue,
			stream_id : opts.stream_id, 
			stream_type : opts.stream_type,
			from : opts.from,
			to : opts.to,
			i : 0
		};
		var callbackFunc = function(data, i){
			if(data.success){
				var values = data.obj;
				if(i != undefined && i > 0){//处理多次查询后的结果
					if(values != null && values.length > 0){
						if(opts.availableTags == null || opts.availableTags.length == 0){
							opts.availableTags = values;
						}else{
							for(i in values){
								var count = 0;
								for(j in opts.availableTags){
									if(values[i] == opts.availableTags[j]){
										count++;
										break;
									}
								}
								if(count == 0){
									opts.availableTags.push(values[i]);
								}
							}
						}
					}
				}else{
					opts.availableTags = (values == null ? [] : values);
				}
			}else{ 
				//TODO 失败处理 
			}
			var val = opts.targetObj.val();
			var term = val.substring(val.lastIndexOf(":")+1, getFocusIndex(opts.targetObj)).replace(/\(/g,"").replace(/\"/g,"");
			response( $.ui.autocomplete.filter(opts.availableTags, term==undefined?"":term));
		};
    	getMetricDatas(param, callbackFunc, timeobj);
	}
	/**
	 * 从queryString中取出指标字段
	 * @param term
	 */
	function getMetricInQueryString(term){
		var metric = "";
		if(term != null && term.indexOf(" ") < 0){
			metric = term.substring(0, term.indexOf(":"));
		}else{
			metric = term.substring(term.lastIndexOf(" ")+1, term.lastIndexOf(":")).replace(/\(/g,"");
		}
		return metric;
	}
	/**
	 * 冒号事件处理
	 * @param term
	 * @param response
	 * @param opts
	 * @param targetObj
	 */
	function colonKeyEvent(term,response,opts,targetObj){
		CANCAL_SEARCH_REQUEST = false; 			 //执行后台查询
		setCurrentTerm(term,opts);
		opts.CURSOR_INDEX = getFocusIndex(targetObj);
		opts.availableTags = [];
		if(opts.CURSOR_INDEX > 0){
			term = term.substring(0, opts.CURSOR_INDEX);
		}
		responseData(getMetricInQueryString(term),response,opts);
	}
	/**
	 * 空格事件处理
	 * @param term
	 * @param opts
	 */
	function spaceKeyEvent(term, opts){
		setCurrentTerm(term, opts);
		term = term.replace(/\s/g,"").trim();//替换空格
		var str = term.substring(term.length-5, term.length);
		if((str.indexOf("AND") < 0 && str.indexOf("OR") < 0 && str.indexOf("NOT") < 0)){
			opts.availableTags = OPERATE_ARRAY;
		}else{
			opts.availableTags = opts.backUpMetricData;
		}
		current_metric = null;
		return term = "";
	}
	
	/**
	 * 截取当前字符串有效部分，以括号、冒号和空格三个符号最后的index为准
	 * @param termString
	 */
	function getString(termString){
		var k = termString.lastIndexOf("("),//括号
			m = termString.lastIndexOf(":"),//冒号
			s = termString.lastIndexOf(" ");//空格
		var str = "";
		if(termString.indexOf("(") >= 0 && (k > m) && (k > s)){ 		  //当括号在其他字符串的最后
			str = termString.substring(0, termString.lastIndexOf("(")+1);
			
		}else if(termString.indexOf(":") >= 0 && (m > k) && (m > s)){   //当冒号在其他字符串的最后
			str = termString.substring(0, termString.lastIndexOf(":")+1);
			
		}else if(termString.indexOf(" ") >= 0 && (s > k) && (s > m)){  //当空格在其他字符串的最后
			str = termString.substring(0, termString.lastIndexOf(" ")+1);
		}
		return str;
	}
	/**
	 * 回退删除时重设CURRENT_TERM
	 * @param term
	 * @param opts
	 */
	function processCurrentTerm(term, opts){
		var str = "";
		if(term.indexOf(" ")>=0){//包含空格
			str = term.substring(0,term.lastIndexOf(" ")+1);
		}else{
			str = term.substring(0,term.lastIndexOf(":")+1);
		}
		if(str != "" && term.indexOf(" ") >= 0){
			term = term.substring(term.lastIndexOf(" ")+1, term.length);
			str += getString(term);
		}
		setCurrentTerm(str, opts);
	}
	/**
	 * 回退键事件处理
	 * @param term
	 * @param response
	 * @param opts
	 * @param targetObj
	 */
	var current_metric = null;
	function backSpaceKeyEvent(term, response, opts, targetObj){
		CANCAL_SEARCH_REQUEST = false; 			 	 //执行后台查询
		opts.CURSOR_INDEX = getFocusIndex(targetObj);//获取光标位置
		if(opts.CURSOR_INDEX > 0){
			if(opts.CURSOR_INDEX == term.length){
				processCurrentTerm(term, opts);
			}
			term = term.substring(0,opts.CURSOR_INDEX); //从0截取至光标位置
			if(term.indexOf(" ") >= 0){ 				//如果包含空格
				term = term.substring(term.lastIndexOf(" ")+1, term.length).replace(/\(/g,"").replace(/\"/g,"");
			}
			if(term != null && term.trim() != ""){
				if((" AND".indexOf(term) >= 0 || " OR".indexOf(term) >= 0 || " NOT".indexOf(term) >= 0)){
					opts.availableTags = OPERATE_ARRAY;
					CANCAL_SEARCH_REQUEST = true; 		//取消后台查询
				}else{
					var array = term.replace(/\(/g,"").replace(/\"/g,"").split(":");
					var metricValue = array[0];
					if(array && array.length == 2){
						term = array[1];
					}
					if(array.length < 2){
						opts.availableTags = opts.backUpMetricData; //将结果集设置为指标
						response( $.ui.autocomplete.filter(opts.availableTags, term));
					}else{
						if(current_metric != metricValue){ //判断是否为同一个metric,如果不同则根据metric请求数据
							opts.availableTags = [];
							responseData(metricValue,response,opts);
							current_metric = metricValue;
						}
					}
				}
			}else{
				current_metric = null;
				CANCAL_SEARCH_REQUEST = true; 		//取消后台查询
			}
		}
		return term;
	}
	/**
	 * 引号事件处理
	 * @param term
	 * @param opts
	 */
	function quotationKeyEvent(term, opts){
	   processCurrentTerm(term, opts);
	   return "";
	}
	/**
	 * 左括号事件处理
	 * @param term
	 * @param opts
	 * @param targetObj
	 * @param shiftKey
	 */
	function parenthesesKeyEvent(term, opts, targetObj, shiftKey){
		if(!shiftKey){
			return term;
		}
		term = setCurrentTerm(term, opts);
		opts.CURSOR_INDEX = getFocusIndex(targetObj);
		var val = targetObj.val();
		if(opts.CURSOR_INDEX > 0 && opts.CURSOR_INDEX < val.length){
			opts.availableTags = [];
		}
		return term;
	}
	/**
	 * 默认事件处理
	 * @param term
	 * @param opts
	 */
	function defaultEvent(term, opts, targetObj){
		var val = targetObj.val();
		if((val == null || val == "") && (term == null || term == "")){
			opts.availableTags = opts.backUpMetricData;
			opts.CURRENT_TERM = "";
		}
	}
	/**
	 * 查询结果时处理value
	 * @param keyCode
	 * @param shiftKey
	 * @param opts
	 * @param targetObj
	 */
	function handleValueOnSearch(keyCode, shiftKey, opts, targetObj){
		var val = targetObj.val();
		opts.CURRENT_VALUE = val; //赋值给全局变量
		opts.CURSOR_INDEX = getFocusIndex(targetObj);
		if((keyCode == keyObject.PARENTHESES_KEY_CODE && !shiftKey) || $.inArray(keyCode, KEY_CODE_ARRAY) < 0){ //KEY_CODE_ARRAY是否包含当前的keyCode
			if(val != null){
				val = val.substring(0, opts.CURSOR_INDEX);
				if(val.indexOf("AND") >= 0 || val.indexOf("NOT") >= 0){
					val = val.substring(val.lastIndexOf(" ")+1, val.length);
				}
				if(val.indexOf(":") > 0){
					val = val.substring(val.lastIndexOf(":")+1, val.length);
				}
				if(val.indexOf(" ") > 0){
					val = val.substring(val.lastIndexOf(" ")+1, val.length);
				}
				val = val.replace(/\(/g,"").replace(/\"/g,"");
			}
		}
		return val;
	}
})(jQuery);