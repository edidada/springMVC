<%@ page contentType="text/html; charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Spring MVC Hello World</title>
    <jsp:include page="../shared/_include_common.jsp"/>
</head>
<body style="overflow: auto">
<button id="saveBlog" type="button" class="btn btn-primary mini">保存数据</button>
<button id="getAllBlogSortByRead" type="button" class="btn btn-primary mini" style="width: 150px;">获得所有数据(READ)</button>
<button id="getAllBlogSortByPing" type="button" class="btn btn-primary mini" style="width: 150px;">获得所有数据(PING)</button>
<button id="getBlogTopReadN" type="button" class="btn btn-primary mini" style="width: 230px;">获得Top Read N（n = 20）数据</button>
<button id="getBlogTopPingN" type="button" class="btn btn-primary mini" style="width: 230px;">获得Top Ping N（n = 20）数据</button>
<button id="getBlogTopIncreaseN" type="button" class="btn btn-primary mini" style="width: 230px;">获得Top Increase N（n = 50）数据</button>
<table id="blogTable">
    <thead>
    <tr>
        <th>标题</th>
        <th>点击数</th>
        <th>评论数</th>
        <th id="increase">增长量</th>
    </tr>
    </thead>
    <tbody>

    </tbody>

</table>
</body>
</html>

<script src="<c:url value='/resources/javascripts/blog/blog.js'/>"></script>
<script src="<c:url value='/resources/javascripts/data/blogData.js'/>"></script>
