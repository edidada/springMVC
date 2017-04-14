<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <jsp:include page="../shared/_include_common.jsp" />
    <script type="text/javascript">
        $(function(){
            $.ajaxSetup({
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    loadingMask(false);
                    if (textStatus == "timeout") {
                        GMS.success("请求超时, 请重试!");
                    } else if(textStatus == "parsererror") {
                        GMS.success("解析错误!");
                    } else if (XMLHttpRequest.status == 404) {
                        GMS.success("该请求不存在!");
                    } else if (XMLHttpRequest.status == 500) {
                        GMS.success("服务器处理失败!");
                    } else if (XMLHttpRequest.status == 503) {
                        GMS.success("服务器维护中当前不可用!");
                    } else if (XMLHttpRequest.status != 0) {
                        GMS.success("连接服务器异常!");
                    }else{
                        window.location.reload();
                    }
                },
                success: function (data) {
                    GMS.success();
                }
            });
            initDraggable();
        });
        //交互操作时显示区域 isloading 是否正在处理
        function loadingMask(isloading) {
            if(isloading)
                $(".loadingmask").mask("处理中...");
            else
                $(".loadingmask").unmask();
        }
        //拖拽对话框
        function initDraggable()
        {
            $(".modal").draggable({
                scroll: false,
                handle: ".modal-header"
            });
        }
    </script>
    <title>Title</title>
</head>
<body>
<script type="text/javascript">

</script>

</body>
</html>
