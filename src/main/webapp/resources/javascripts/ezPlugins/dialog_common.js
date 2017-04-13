function submitForm(item) {
	var $form = $(item).parents("div.modal:first").find("form");
	var allowSubmit = true;
	$form.find("input.input-necessary").each(function() {
		if ($.trim($(this).val()) == "") {
			allowSubmit = false;
			return false;
		}
	});
	if (!allowSubmit)
		return false;
	else
		$form.submit();
}

function modalSave(modalId, func) {
	if (func != false) {
		$('#' + modalId).modal('hide');
	}
}

function topoModalSave(modalId, func) {
	if (func != false && func != undefined) {
		$('#' + modalId).modal('hide');
	}
}

$(document).ready(
	function() {
		$("button.dialog-cancel").click(function() {
			$(this).parents("div.modal:first").find(":text").val("");
		});
		$("div.modal").find("form").attr("onkeydown", "if(event.keyCode==13){return false;}");
});