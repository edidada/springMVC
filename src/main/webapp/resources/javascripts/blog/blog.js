$(function () {
    $("#saveBlog").live("click", function () {
        saveBlogList();
    });
    $("#getBlogTopReadN").live("click", function () {
        getBlogList(20, "read");
    });
    $("#getBlogTopPingN").live("click", function () {
        getBlogList(20, "ping");
    });
    $("#getBlogTopIncreaseN").live("click", function () {
        getBlogList(50, "increase");
    });
    $("#getAllBlogSortByRead").live("click", function () {
        getAllBlogList("read");
    });
    $("#getAllBlogSortByPing").live("click", function () {
        getAllBlogList("ping");
    });
    $("#getAllBlogSortByPraise").live("click", function () {
        getAllBlogList("praise");
    });
    $("#getAllBlogSortByTread").live("click", function () {
        getAllBlogList("tread");
    });
});

function getAllBlogList(type) {
    $.ajax({
        url: "/lxk/blog/getAllBlog",
        dataType: "json",
        data: {
            type: type
        },
        success: function (data) {
            console.log(data);
            setTable(data)
        }
    });
}

function saveBlogList() {
    var data = {
        blogList: getBlogListToSave2(),
        name: "lxk",
        date:new Date(2017,5,1)
    };
    $.ajax({
        url: "/lxk/blog/saveBlogList",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        type: "post",
        data: JSON.stringify(data),
        success: function (data) {
            console.log(data);
        }
    });
}

function getBlogList(topN, type) {
    $.ajax({
        url: "/lxk/blog/getTopNBlog",
        dataType: "json",
        data: {
            topN: topN,
            type: type
        },
        success: function (data) {
            console.log(data);
            setTable(data)
        }
    });
}

function setTable(data) {
    var tbody = $("#blogTable").find("tbody");
    tbody.empty();
    var trs = "";
    for (var obj in data) {
        var read = data[obj].read;
        var title = data[obj].title;
        var ping = data[obj].ping;
        var increase = data[obj].increase;
        var praise = data[obj].praise;
        var tread = data[obj].tread;

        trs += "<tr><td style='width: 600px;' title='" + title + "'>" + title + "</td>";
        trs += "<td title='" + read + "'>" + read + "</td>";
        trs += "<td title='" + ping + "'>" + ping + "</td>";
        trs += "<td title='" + increase + "'>" + increase + "</td>";
        trs += "<td title='" + praise + "'>" + praise + "</td>";
        trs += "<td title='" + tread + "'>" + tread + "</td>";
        trs += "</tr>";
    }
    tbody.append(trs);
}



