String.prototype.replaceAll = function(s1,s2){    
	return this.replace(new RegExp(s1,"gm"),s2);    
}
jQuery.expr[':'].Contains = function(a, i, m) {
	return jQuery(a).text().toLowerCase().indexOf(m[3].toLowerCase()) >= 0;
}
function lightKeyWords(keyword,string){
	var _keyword = keyword.trim().escapeHTML().toLowerCase();
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
function tableFolterInit(input,table, num){
	var tdnum = table.find("thead tr:eq(0) th").length;
	if (typeof num != 'undefined') {
		tdnum = num;
	}
	var trdom = '<tr class="nomatchdata"><td colspan="'+ tdnum +'">未找到匹配数据</td></tr>';

	input.keyup(function(e){
		$(".nomatchdata",table).remove();
		var val = $.trim($(this).val()).toLowerCase();
		var _trs = $('tbody tr', table);
		var trnum = _trs.length;
		
		_trs.removeClass("tr-hide");
		$('td font.lightkeywords',table).parents("td").each(function(index, element) {
			var _txt = $(element).html().toString().replaceAll('<font class="lightkeywords">','');
			var txt = _txt.replaceAll("</font>","");
			$(element).html(txt);
		});
		
		if(val == "") return;
		
		var hide_trs = $('tbody tr',table).filter(function(index) {
			var _element = $(":Contains("+ val +")",this);
			var num = _element.length;
			console.log(_element.html());
			if(num > 0){
				_element.each(function(index, element) {
					var text_node = $(element).contents().filter(function(){ return this.nodeType != 1; });
					text_node.each(function(index, element) {
						var text = $(element).text().escapeHTML();
						$(element).replaceWith(lightKeyWords(val,text));
					});
				});
				return false;
			}else{
				return true;
			}
		});
		
		hide_trs.addClass("tr-hide");
		var hidenum = hide_trs.length;
		
		if(hidenum == trnum){
			table.find("tbody").append(trdom);
		}
	});
}
$(document).ready(function(e) {
	var _input = $("input.table-filter");
	var _table = $("table.table-filter");
    tableFolterInit(_input, _table);
});