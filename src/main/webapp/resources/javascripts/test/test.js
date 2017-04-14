$(function () {
    $("#getByName").live("click", function () {
        getStudentByName();
    });
    $("#getByNameAndAge").live("click", function () {
        getStudentByNameAndAge();
    });
    $("#create").live("click", function () {
        saveNewStudent();
    });
});

function getStudentByNameAndAge() {
    $.ajax({
        url: "/lxk/student/getStudentByName",
        type: "post",
        data: {
            name: "李学凯",
            age: 18
        },
        dataType: "json",
        success: function (data) {
            console.log(data);
        }
    });
}

/**
 * 这个参数是转成java对象的形式在后台接收
 */
function saveNewStudent() {
    var me = {
        name: "李学凯新建",
        age: 18,
        sex: true
    };
    $.ajax({
        url: "/lxk/student/createNewStudent",
        contentType: "application/json; charset=utf-8",
        type: "post",
        data: JSON.stringify(me),
        dataType: "json",
        success: function (data) {
            console.log(data);
        }
    });
}

/**
 * 这个参数是以简单类型的形式在后台接收
 */
function getStudentByName() {
    $.ajax({
        url: "/lxk/student/getStudentByName",
        type: "post",
        data: {
            name: "李学凯"
        },
        dataType: "json",
        success: function (data) {
            console.log(data);
        }
    });
}

