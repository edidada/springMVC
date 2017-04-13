$(document).ready(function(){
    $("#submit").bind("click", function() {
      $("#loginform").submit();
    });

    $(document).bind("keypress", function(e) {
      code = (e.keyCode ? e.keyCode : e.which);
      if (code == 13) {
        $("#loginform").submit();
      }
    });

    $("#loginform").bind("submit", function() {
      button = $("#submit");
      // No mutiple submit.
      if (button.hasClass("submit-disabled")) {
        return false;
      }
      button.html("登录中...");
      button.addClass("submit-disabled");
      $(this).submit();
    });
});