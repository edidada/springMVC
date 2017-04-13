String.prototype.replaceAll = function(s1,s2){    
	return this.replace(new RegExp(s1,"gm"),s2);    
}
jQuery.expr[':'].Contains = function(a, i, m) {
	return jQuery(a).text().toLowerCase().indexOf(m[3].toLowerCase()) >= 0;
}
function lightKeyWords(keyword,string){
	var _keyword = $.trim(keyword).toLowerCase();
	var _string = string.toLowerCase();
	var indx = _string.indexOf(_keyword);
	if(indx >= 0){
		var txt1 = string.substring(0, indx);
		var txt2 = string.substring(indx, indx + _keyword.length);
		var txt3 = string.substring(indx + _keyword.length);
		return txt1 + '<font class="lightkeywords">' + txt2 + "</font>" + lightKeyWords(keyword,txt3);
	}else{
		return string;
	}
}
function ulFolterInit(input,ul){
	var lidom = '<li class="nomatchdata">未找到匹配数据</li>';

	input.keyup(function(e){
		$(".nomatchdata",ul).remove();
		var val = $.trim($(this).val()).toLowerCase();
		var _lis = $('li', ul);
		var linum = _lis.length;
		
		resetSearchList(ul);
		
		if(val == "") return;
		
		var hide_lis = $('li',ul).filter(function(index) {
			var _element = $(":Contains("+ val +")",this);
			var num = _element.length;
			if(num > 0){
				_element.each(function(index, element) {
					var text_node = $(element).contents().filter(function(){ return this.nodeType != 1; });
					text_node.each(function(index, element) {
						var text = $(element).text();
						$(element).replaceWith(lightKeyWords(val,text));
					});
				});
				return false;
			}else{
				return true;
			}
		});
		
		hide_lis.removeClass("shown").removeClass("highlight-item");
		var hidenum = hide_lis.length;
		
		if(hidenum == linum){
			ul.append(lidom);
		}
	});
	
	/*ul.find("li").live("mouseover",function(){
		$(".highlight-item",ul).removeClass("highlight-item");
	});
	
	ul.find("li > a").live("click",function(){
		var _val = $(this).find("span.filter-code").text();
		ul.parents(".ez-dropmenu").nextAll(".filter-input").val(_val);
		$(this).parent("li").addClass("highlight-item");
		resetSearchList(ul);
		input.val("");
	});*/
	
	ul.delegate("li","mouseover",function(){
		$(".highlight-item",ul).removeClass("highlight-item");
	});

	ul.delegate("li > a","click",function(){
		var _val = $(this).find("span.filter-code").text();
		ul.parents(".ez-dropmenu").nextAll(".filter-input").val(_val);
		$(this).parent("li").addClass("highlight-item");
		resetSearchList(ul);
		input.val("");
	});
	
	input.keydown(function(event){
		var _items = ul.find("li.shown");
		var _highlight_item = _items.filter(".highlight-item");
		
		if(event.keyCode == 38){
			clearDefault(event);
			if(_highlight_item.length <= 0){
				return;
			}else{
				_highlight_item.removeClass("highlight-item");
				var _between_prev = _highlight_item.prevUntil("li.shown");
				if(_between_prev.length <= 0){
					var _tmp_prev = _highlight_item.prev();
					if(_tmp_prev.length <= 0){
						_items.last().addClass("highlight-item");
					}else{
						_tmp_prev.addClass("highlight-item");
					}
				}else{
					var _prev = _between_prev.last().prev();
					if(_prev.length <= 0){
						_items.last().addClass("highlight-item");
					}else{
						_prev.addClass("highlight-item");
					}
				}
			}
			var the_highlight_item_up = ul.find("li.shown.highlight-item");
			if(the_highlight_item_up.length > 0){
				dropListScrollUp(the_highlight_item_up,$(".filter-item-list").eq(0));
			}
		}
		if(event.keyCode == 40){
			clearDefault(event);
			if(_highlight_item.length <= 0){
				_items.first().addClass("highlight-item");
			}else{
				_highlight_item.removeClass("highlight-item");
				var _between_next = _highlight_item.nextUntil("li.shown");
				if(_between_next.length <= 0){
					var _tmp_next = _highlight_item.next();
					if(_tmp_next.length <= 0){
						_items.first().addClass("highlight-item");
					}else{
						_tmp_next.addClass("highlight-item");
					}
				}else{
					var _next = _between_next.last().next();
					if(_next.length <= 0){
						_items.first().addClass("highlight-item");
					}else{
						_next.addClass("highlight-item");
					}
				}
			}
			var the_highlight_item_down = ul.find("li.shown.highlight-item");
			if(the_highlight_item_down.length > 0){
				dropListScrollDown(the_highlight_item_down,$(".filter-item-list").eq(0));
			}
		}
		if(event.keyCode == 13){
			if(_highlight_item.length <= 0){
				return;
			}
			var _val = _highlight_item.find("a span.filter-code").text();
			ul.parents(".ez-dropmenu").nextAll(".filter-input").val(_val);
			ul.parents(".ez-dropmenu").removeClass("open");
			resetSearchList(ul);
			input.val("");
			
		}
	});
}

//滚动下拉列表
function dropListScrollDown(_item,_list){
	var _top = _item.position().top;
	var _item_height = _item.height();
	if(_list.height() - _top - _item.height() < 0){
		_list[0].scrollTop += _item_height;
	}else if(_top <= _item_height){
		_list[0].scrollTop = 0;
	}
}
function dropListScrollUp(_item,_list){
	var _top = _item.position().top;
	var _item_height = _item.height();
	if(_top - _item_height < 0){
		_list[0].scrollTop -= _item_height;
	}else if(_top >= _list.height()){
		_list[0].scrollTop += _list.height();
	}
}

//初始化搜索列表和搜索结果
function resetSearchList(_ul){
	var the_lis = $('li', _ul);
	the_lis.addClass("shown");
	$('span font.lightkeywords',_ul).parents("li").each(function(index, element) {
		var _txt = $(element).html().toString().replaceAll('<font class="lightkeywords">','');
		var txt = _txt.replaceAll("</font>","");
		$(element).html(txt);
	});
}