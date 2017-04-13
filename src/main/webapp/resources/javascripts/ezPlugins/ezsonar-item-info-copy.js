/**
* @version: 0.2
* @author: E_Bo
* @date: 2014-05-28
* @work with jQuery
*/
(function ($,undefined) {
	
	$.ezItemInfoText = "";
	$.ezItemInfoCloseDelay = 0;
	
	$.fn.eziteminfo = function(options){
		options = options || {};
		
		var hasOptions = typeof options == 'object';
		
		$.ezInfoActionText = "复制";
		$.ezInfoReturnText = "已复制";
		$.ezInfoAreaPlacement = "top";
		$.ezInfoSelector=".ez-item-info-copy";
		$.ezInfoAttrName = "data-item-info";
		
		 if(hasOptions){ 
		 	if(typeof(options.actionText) == "string"){
				 $.ezInfoActionText = options.actionText;
			}
			if(typeof(options.returnText) == "string"){
				 $.ezInfoReturnText = options.returnText;
			}
			if(typeof(options.placement) == "string"){
				 $.ezInfoAreaPlacement = options.placement;
			}
			if(typeof(options.selector) == "string"){
				 $.ezInfoSelector = options.selector;
			}
			if(typeof(options.attrName) == "string"){
				 $.ezInfoAttrName = options.attrName;
			}
		 }
		
		$.ezInfoFloatActionArea = $('<div id="ez_item_info_area" class="tooltip fade in '+ $.ezInfoAreaPlacement +'" style="left:-200px; top:0px;"><div class="tooltip-arrow"></div><div class="tooltip-inner"><a class="ez-item-info-action"  id="ez_item_info_action">'+ $.ezInfoActionText +'</a></div></div>');
		 
		$("body").append($.ezInfoFloatActionArea);
		
		$.ezInfoHideArea = function(){
			$.ezInfoFloatActionArea.hide();
			$.ezInfoFloatActionArea.find('.ez-item-info-action').text($.ezInfoActionText);
		}
		
		$.ezInfoFloatActionArea.on('mouseenter',function(){
			clearTimeout($.ezItemInfoCloseDelay);
		});
		$.ezInfoFloatActionArea.on('mouseleave',function(){
			$.ezItemInfoCloseDelay = setTimeout($.ezInfoHideArea,200);
		});
		
		var client = new ZeroClipboard( $.ezInfoFloatActionArea.find('#ez_item_info_action'),{
			moviePath: APP_NAME + "/resources/javascripts/modules/zeroClipboard/ZeroClipboard.swf",
			forceHandCursor: true
		});
		
		/*client.on("mousedown", function (event) {
			client.setText($.ezItemInfoText);
		});*/
		
		client.on( 'dataRequested', function (client, args) {
		  client.setText($.ezItemInfoText);
		});
		
		client.on( 'complete', function ( client, args ) {
		  $.ezInfoFloatActionArea.find('.ez-item-info-action').text($.ezInfoReturnText);
		} );
		
		$(".global-zeroclipboard-container").on('mouseenter',function(){
			clearTimeout($.ezItemInfoCloseDelay);
		});
		
		var areaTop = 0;
		var areaLeft = 0;
		
		function locateFloatArea(element,placement){
			if(placement == "top"){
				areaTop  = element.offset().top - $.ezInfoFloatActionArea.outerHeight();
				areaLeft = element.offset().left;
			}
			if(placement == "left"){
				areaTop  = element.offset().top;
				areaLeft = element.offset().left - $.ezInfoFloatActionArea.outerWidth();
			}
			if(placement == "bottom"){
				areaTop  = element.offset().top + element.height();
				areaLeft = element.offset().left;
			}
			if(placement == "right"){
				areaTop  = element.offset().top;
				areaLeft = element.offset().left + element.width();
			}
			areaTop += "px";
			areaLeft += "px";
		}
		
		function showFloatArea(event) {
			locateFloatArea($(this),$.ezInfoAreaPlacement);
			$.ezItemInfoText = $(this).attr($.ezInfoAttrName);
			$.ezInfoFloatActionArea.css({
				"top":areaTop,
				"left":areaLeft
			});
			clearTimeout($.ezItemInfoCloseDelay);
			$.ezInfoHideArea();
			$.ezInfoFloatActionArea.show();
		}
		
		function hideFloatArea(event){
			clearTimeout($.ezItemInfoCloseDelay);
			$.ezItemInfoCloseDelay = setTimeout($.ezInfoHideArea,200);
		}
		
		//$($.ezInfoSelector).live('mouseenter', showFloatArea);
		//$($.ezInfoSelector).live('mouseleave', hideFloatArea);
		
		$(this).live('mouseenter', showFloatArea);
		$(this).live('mouseleave', hideFloatArea);
	}
})(jQuery);