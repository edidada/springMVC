<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>

<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>Spring MVC Hello World</title>
	<jsp:include page="shared/_include_common.jsp" />
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
</head>

<body>
	<h2>All Students in System</h2>

	<table border="1">
		<tr>
			<th>Id</th>
			<th>Name</th>
			<th>Age</th>
			<th>Sex</th>
		</tr>
		<c:forEach var="student" items="${students}">
			<tr>
				<td>${student.id}</td>
				<td>${student.name}</td>
				<td>${student.age}</td>
				<td>${student.sex}</td>
			</tr>
		</c:forEach>
	</table>
	<button id="getByName" type="button" class="btn btn-primary mini">查找</button>
	<button id="create" type="button" class="btn btn-primary mini">新建</button>
	<button id="getByNameAndAge" type="button" class="btn btn-primary mini">查找2</button>
	<select id="my_select" class="chzn-select force-valid " multiple data-placeholder="请选择内容"
			style="width:100px; display:none;margin-left: 10px;">
		<option value="eq">等于</option>
		<option value="gt">大于</option>
		<option value="lt">小于</option>
		<option value="neq">不等于</option>
	</select>

</body>
</html>
<jsp:include page="shared/_include_chosen.jsp"/>
<script src="<c:url value='/resources/javascripts/test/test.js'/>"></script>
<script type="text/javascript">
    $(function () {
        var $select = $("#my_select");
        $select.chosen({
            no_results_text: "没有匹配项",
            disable_search: true,
            allow_single_deselect: false
        });
        $select.live('change', function () {
            console.log($(this).val());
		});
    });
</script>
