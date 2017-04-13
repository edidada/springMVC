/**
 * @fileOverview String 扩展
 * @author User
 * @since 2013-10-24 11:15
 * @version 1.0.1
 */
/**
 * @description 获取转义后的字符串
 * @returns 转义后的字符串
 */
String.prototype.escapeHTML = function() {
	/*var str = this.replace(/(<)/g, "&lt;");
	str = str.replace(/(>)/g, "&gt;");
	str = str.replace(/(\')/g, "&apos;");
	str = str.replace(/(\")/g, "&quot;");
	str = str.replace(/(&)/g, "&amp;");
	str = str.replace(/(©)/g, "&copy;");
	str = str.replace(/(®)/g, "&reg;");
	str = str.replace(/(™)/g, "™");
	str = str.replace(/(×)/g, "&times;");
	str = str.replace(/(÷)/g, "&divide;");
	return str;*/
	var text = $("<textarea></textarea>").text(this.toString()).html();
	return text.replace(/(\')/g, "&apos;").replace(/(\")/g, "&quot;");
};
String.prototype.escapeText = function() {
	var str = this.replace(/(&lt;)/g, "<");
	str = str.replace(/(&gt;)/g, ">");
	str = str.replace(/(&apos;)/g, "\'");
	str = str.replace(/(&quot;)/g, "\"");
	str = str.replace(/(&amp;)/g, "&");
	return str;
};