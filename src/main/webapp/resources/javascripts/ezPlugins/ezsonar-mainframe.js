function navOpen(obj){
	var last = $('.has-sub.clearfix.open:not(.active)',$('#sidebar'));
	var _parent = obj.parent();
	var _main_nav = $("#sidebar-ul");
	if(!(_parent.hasClass("active") && obj.find(".arrow").hasClass("open"))){
		last.removeClass("open");
		$('.arrow', last).removeClass("open");
		$('.sub', last).slideUp(200);
	}
	var sub = obj.next();
	if (sub.is(":visible")) {
		$('.arrow', obj).removeClass("open");
		obj.parent().removeClass("open");
		sub.slideUp(200);
	} else {
		$('.arrow', obj).addClass("open");
		if(!obj.parent().hasClass("active")){
			obj.parent().addClass("open");
		}
		sub.slideDown(200, function(){
			//_main_nav.scrollTop(_parent[0].offsetTop - 100);
		});
	}
}

function navActive(obj){
	var last_active = $('#sidebar > ul > li.active');
	var last_prev = $('#sidebar > ul > li.prev');
	var this_parent = obj.parent('li');
	last_active.removeClass("active");
	last_prev.removeClass("prev");
	last_active.find('.active').removeClass("active");
	this_parent.addClass("active");			
	if(this_parent.parent().hasClass("sub")){
		var this_parnet_li = this_parent.parents('.has-sub');
		this_parnet_li.addClass("active");
		this_parnet_li.removeClass("open");					
	}else{
		var last = $('[class="has-sub clearfix open"]',$('#sidebar'));
		last.removeClass("open");
		$('.arrow', last).removeClass("open");
		$('.sub', last).slideUp(200);
		var prev_li = this_parent.prev();
		if(prev_li.hasClass("no-sub")){
			prev_li.addClass("prev");
		}
	}
	if(!last_active.hasClass("active")){
		last_active.find('.arrow').removeClass("open");
		last_active.removeClass("open");
		last_active.find('.sub').slideUp(200);
	}
}

function navActive_direct(obj){
	var this_parents = obj.parents('.has-sub');
	
	if(!this_parents.hasClass("open") && !this_parents.hasClass("active")){
		navOpen(obj.parents("ul.sub").prev());
	}
	navActive(obj);
}

function navbarFixed(height,navbar_id){
	var navbar = $("#" + navbar_id);
	if(height < 792){
		navbar.removeClass("navfixed");
	}else{
		navbar.addClass("navfixed");
	}
}

function navbarAbsolute(navbar_id,bool){
	var navbar = $("#" + navbar_id);
	if(bool){
		navbar.removeClass("navfixed");
	}else{
		navbar.addClass("navfixed");
	}
}

function sidebarToggle(toggler){
	var sidebar_ul = $('#sidebar > ul');
	var _body = $('#body');
	var sidebar = $('#sidebar');
	var container = $("#container");
	var container_title = $('#container-title');
	//var container_actionbar = $('#container-actionbar');
	var sidebartoggler = $('.sidebar-toggler');
	//var sidebar_icon = $('#sidebar-ul>li>a>i');
	var sub_ul = $('#sidebar > ul > .has-sub > .sub');
	//var sidebar_active_icon = $('#sidebar-ul>li.active>a>i');
	
	if (toggler === true) {
		container.addClass("sidebar-closed");
		sub_ul.removeAttr("style");
		_body.stop().animate({
			'margin-left': '50px'
		});
		container_title.stop().animate({
			'left': '50px'
		});	
		sidebartoggler.stop().animate({
			'left': '15px'
		});
		sidebar.stop().animate({
			'width': '50px'
		}, {
			complete: function () {
				//sidebar_ul.hide();
				//container.addClass("sidebar-closed");
				//zoom属性重置需要在动画完成后进行
				sub_ul.removeAttr("style");
				//checkZoomer();
				jQuery.event.trigger("containerResize");
			}
		});
	} else {
		container.removeClass("sidebar-closed");
		_body.stop().animate({
			'margin-left': '120px'
		},{
			complete: function (){
				//zoom属性重置需要在动画完成后进行
				//checkZoomer();
				jQuery.event.trigger("containerResize");
			}
		});
		container_title.stop().animate({
			'left': '120px'
		});	
		sidebartoggler.stop().animate({
			'left': '51px'
		});
		sidebar.stop().animate({
			'width': '120px'
		}, {
			complete: function () {
				container.removeClass("sidebar-closed-def");
			}
		});
	}
}

function sortToggle(th){
	var up = th.find(".up");
	var down = th.find(".down");
	if(up.hasClass("active")){
		up.removeClass("active");
		down.addClass("active");
	}else{
		down.removeClass("active");
		up.addClass("active");
	}
}

function checkZoomer(){
	try{
		if(typeof(eval(graphZoomInit))=="function"){
			graphZoomInit();
		}
	}catch(e){
		return;
	}
}

function editareatoggler(){
	var _btn = $("#dashboardshow-edit");
	var _area = $(".dashboardshow-edit-area");
	if(_btn.css("display") == "none"){
		_area.hide();
		_btn.show();
	}else{
		_area.show();
		_btn.hide();
	}
}
function clearPropagation(e){
	if (e && e.stopPropagation){
		e.stopPropagation();
	}else{
		window.event.cancelBubble=true;
	}
}
function clearDefault(e){	
	e = e || window.event;
    if(e.preventDefault) {
      e.preventDefault();
    }else{
      e.returnValue = false;
    }
}
function clearPropDef(e){
	e = e || window.event;
	if(e.preventDefault) {
		e.preventDefault();
		e.stopPropagation();
	}else{
		e.returnValue = false;
		e.cancelBubble = true;
	}
}
function ezMouseSroll(message_div,message_table){
	if(jQuery.browser.mozilla){  
		message_div.addEventListener('DOMMouseScroll',function(e){  
			message_table.scrollTop += e.detail>0?60:-60;  
			e.preventDefault();  
		},false);  
	}else{  
		message_div.onmousewheel = function(e){  
			e = e || window.event;  
			message_table.scrollTop += e.wheelDelta>0?-60:60;  
			e.returnValue=false;  
		};  
	}
}
function showConfirm(_options){
	var defaults = {
		confirmTitle:"操作确认",
		confirmText:"您确认进行该操作么？",
		confirmBtnText:"确定",
		cancelBtnText:"取消",
		confirmCallback:function(){return;},
		cancelCallback:function(){return;}
	};
	var _options = $.extend(defaults,_options);
	
	var _modal = $("#confirm-modal");
	
	$("#confirmMdalTitle").text(_options.confirmTitle);
	$("#confirmMdalText").hide();
	if(_options.confirmText != null) {
		$("#confirmMdalText").show();
		$("#confirmMdalText").text(_options.confirmText);
	}
	$("#confirmMdalConfirmBtn").hide();
	$("#confirmMdalCancelBtn").hide();
	
	if(_options.confirmBtnText != null) {
		$("#confirmMdalConfirmBtn").show();
		$("#confirmMdalConfirmBtn").text(_options.confirmBtnText).unbind().click(function(){
			defaults.confirmCallback();
			_modal.modal('hide');
		});
	}
	if(_options.cancelBtnText != null) {
		$("#confirmMdalCancelBtn").show();
		$("#confirmMdalCancelBtn").text(_options.cancelBtnText).unbind().click(function(){
			defaults.cancelCallback();
			_modal.modal('hide');
		});
	}
	_modal.modal('show');
}