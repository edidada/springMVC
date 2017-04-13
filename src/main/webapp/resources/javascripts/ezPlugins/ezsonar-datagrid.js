/**
 * @fileOverview ezDataGrid 控件
 * @author User
 * @since 2013-10-24 11:18
 * @version 1.0.1
 */
/**
 * 页面查无数据时默认显示【查无数据】，如果显示其他的内容，在dom加载完成后赋值
 */
var NO_DATA_SHOW_TEXT_TEMP;
/**
 * @author User
 * @description 加载 ezDataGrid 控件
 */
(function($) {

    /**
     * @type {string} 查询无数据默认跨列显示的内容
     *
     * isShowMaxSizeStatus 是否显示最大条数状态 ,true 当前只显示最大条数 出现显示全部按钮, false 显示全部数据 出现收起按钮
     */
    /*var NO_DATA_SHOW_TEXT = "查无数据",
     NOT_SHOW_MAX_SIZE_STATUS = "收起>>",
     SHOW_MAX_SIZE_STATUS = "全部>>";
     */
    var TEXT_STATUS = {

        /**
         * @return {string}  如果更换无数据提示方式,页面请定义 NO_DATA_SHOW_TEXT_TEMP 变量
         */
        NO_DATA_SHOW_TEXT : function() {
            return NO_DATA_SHOW_TEXT_TEMP ? NO_DATA_SHOW_TEXT_TEMP : "尚未配置";
        },
        /**
         * @return {string}
         */
        NOT_SHOW_MAX_SIZE_STATUS : function() {
            return "收起>>";
        },
        /**
         * @return {string}
         */
        SHOW_MAX_SIZE_STATUS : function() {
            return "全部>>";
        }
    };

    /**
     * @description 根据 id 获取数据
     * @param {Object} target 对象
     * @param {String} id 主键 id
     * @return {Object} 数据对象
     */
    function getDataById(target, id) {
        var opts = $.data(target, "ezDataGrid").options;
        if (null != opts.datas) {
            for (var i = 0; i < opts.datas.length; i++) {
                if (opts.datas[i][opts.idField] == id) {
                    return opts.datas[i];
                }
            }
            return null;
        } else {
            return null;
        }
    }

    /**
     * @description 根据 序号 获取数据
     * @param {Object} target 对象
     * @param {int} rowIndex 序号
     * @return {Object} 数据对象
     */
    function getDataByRowIndex(target, rowIndex) {
        var opts = $.data(target, "ezDataGrid").options;
        if (null != opts.datas) {
            return opts.datas[rowIndex];
        }
        return null;
    }

    /**
     * @description 获取选中的数据
     * @param {Object} target 对象
     * @return {Object} 数据对象
     */
    function getSelectedDatas(target) {
        var opts = $.data(target, "ezDataGrid").options;
        var cks = $(target).find("input[name='" + $(target).attr("id") + "_" + opts.idField + "']:checked");
        var datas = [];
        cks.each(function() {
            datas.push(opts.datas[parseInt($(this).attr("ri"))]);
        });
        return datas;
    }

    /**
     * @description 取消全选
     * @param {Object} target 对象
     */
    function unSelectAll(target) {
        var opts = $.data(target, "ezDataGrid").options;
        var cks = $(target).find("input[name='" + $(target).attr("id") + "_" + opts.idField + "']:checked");
        cks.each(function() {
            $(this).removeAttr("checked");
        });
    }

    /**
     * @description 重新载入
     * @param {Object} target 对象
     * @param {Data} data 数据
     */
    function reload(target, data) {
        var opts = $.data(target, "ezDataGrid").options;
        opts.rowIndex = 0;
        load(target);
    }

    /**
     * @description 从服务器重新载入数据
     * @param {Object} target 对象
     * @param {Data} data 数据
     */
    function reloadFromServer(target, data) {
        var opts = $.data(target, "ezDataGrid").options;
        opts.rowIndex = 0;
        head(target);
        headLoading(target);
        $.ajax({
            url : opts.url,
            dataType : "json",
            data : data,
            success : function(datas) {
                opts.datas = datas;
                load(target);
            }
        });
    }

    /**
     * @description 载入数据表头Loading状态
     * @param {Object} target 对象
     */
    function headLoading(target) {
        var opts = $.data(target, "ezDataGrid").options;
        var count = 0;
        if ( typeof (opts.rownumbers) != "undefined" && opts.rownumbers) {
            count = 1 + opts.columns.length;
        } else {
            count = opts.columns.length;
        }
        var html = "<tr>";
        html += "<td colspan=\"" + count + "\" style=\"text-align: center;\">";
        html += "<img src=\"" + APP_NAME + "resources/images/loading.gif\"/>";
        html += "</td>";
        html += "</tr>";
        $(target).append(html);
    }

    /**
     * @description 载入数据表头
     * @param {Object} target 对象
     */
    function head(target) {
        var opts = $.data(target, "ezDataGrid").options;

        //是否隐藏表头,默认为 false
        var hideTableHead = opts.hideTableHead || false;
        if (hideTableHead) {
            $(target).html("");
            return;
        }

        var html = "<thead>";
        html += "<tr class=\"info\">";
        /**
         * colspan_columns判断是否跨列
         * 不跨列按正常表头情况解析字段
         */
        if ( typeof (opts.colspan_columns) != "undefined" && opts.colspan_columns) {
            var colspan = opts.colspan_columns;

            if ( typeof (colspan.width) != "undefined") {
                html += "<th style=\"width: " + colspan.width + "\" colspan=\"" + colspan.colspanNum + "\"";
            }
            if ( typeof (colspan.className) != "undefined") {
                html += " class=\"" + colspan.className + "\"";
            }
            html += ">" + colspan.title + "</th>";

        } else {
            if (typeof (opts.rownumbers) != "undefined" && opts.rownumbers) {
                html += "<th style='width:43px;'>序号</th>";
            }
            for (var i = 0; i < opts.columns.length; i++) {

                var column = opts.columns[i];
                var styleStr = "";
                html += "<th ";
                if (typeof (column.display) != "undefined") {
                    styleStr += "display:none;";
                }
                if (typeof (column.width) != "undefined") {
                    styleStr += "width:" + column.width + ";";
                }


                if (typeof (column.className) != "undefined") {
                    html += " class=\"" + column.className + "\"";
                }

                if (styleStr) {
                    html += " style=\"" + styleStr + "\"";
                }

                html += ">";
                html += column.title + "</th>";
            }
        }
        html += "</tr>";
        html += "</thead>";

        $(target).html(html);
    }

    /**
     * @description 载入数据表尾,拼接是否显示[收起>>]
     * @param {Object} target 对象
     * @return {boolean} 添加是否超过
     */
    function footer(target) {

        //是否已经添加,addRow 方法中判断超过最大显示条数时默认显示
        var showMaxSizeStatusTr = getColSpanContainsTr(target, TEXT_STATUS.NOT_SHOW_MAX_SIZE_STATUS());
        if (showMaxSizeStatusTr) {
            return false;
        }

        var opts = $.data(target, "ezDataGrid").options;

        //是否设置了显示最大条数,超过最大条数后显示[显示全部>>]
        var defaultShowMaxSize = opts.defaultShowMaxSize || -1;

        if (defaultShowMaxSize > 0 && opts.rowIndex >= defaultShowMaxSize && !opts.isShowMaxSizeStatus) {
            var tr = $("<tr></tr>");
            var td = $("<td  colspan=\"" + ((opts.rownumbers) ? 1 + opts.columns.length : opts.columns.length) + "\" style=\"text-align: center;cursor:pointer;\">" + TEXT_STATUS.NOT_SHOW_MAX_SIZE_STATUS() + "</td>");
            td.click(function() {
                opts.isShowMaxSizeStatus = !opts.isShowMaxSizeStatus;
                reload(target);
            });
            tr.html(td);
            $(target).append(tr);
            return true;
        }
        return false;
    }

    /**
     * @description 载入完整数据
     * @param {Object} target 对象
     */
    function load(target) {
        var opts = $.data(target, "ezDataGrid").options;
        head(target);
        if (opts.datas == null || opts.datas.length < 1) {
            var count = (opts.rownumbers) ? (1 + opts.columns.length) : opts.columns.length;
            var html = "<tr>";
            html += "<td colspan=\"" + count + "\" style=\"text-align: center;\">" + TEXT_STATUS.NO_DATA_SHOW_TEXT() + "</td>";
            html += "</tr>";
            $(target).append(html);
        } else {
            opts.datas.forEach(function(v, i) {
                addRow(target, v, true);
            });
            footer(target);
        }
        opts.reloadCallBack();
    }

    /**
     * 查询某 table 跨列行,且内容为 contains 的 tr
     * @param target 待查询表格对象
     * @param contains 待匹配的内容
     * @return {*} tr
     */
    var getColSpanContainsTr = function(target, contains) {
        var opts = $.data(target, "ezDataGrid").options;
        var count = (opts.rownumbers) ? 1 + opts.columns.length : opts.columns.length;
        var td = $(target).find("td[colspan='" + count + "']:contains('" + contains + "')");

        return td.is("td") ? td.parent() : undefined;
    };

    /**
     * 删除查无数据的行
     *
     * @like #NO_DATA_SHOW_TEXT
     * @param target
     */
    function clearNoData(target) {
        var tr = getColSpanContainsTr(target, TEXT_STATUS.NO_DATA_SHOW_TEXT());
        if (tr) {
            tr.remove();
        }
    }

    /**
     * @description 增加一行
     * @param {Object} target 对象
     * @param {[]} data 数据对象
     * @param {boolean} flag 是否将数据绑定到 dataTable
     */
    function addRow(target, data, flag) {

        var opts = $.data(target, "ezDataGrid").options;
        clearNoData(target);

        //是否设置了显示最大条数,超过最大条数后显示[显示全部>>] , 如果状态为[收起>>]时默认显示全部
        var defaultShowMaxSize = opts.defaultShowMaxSize || -1;

        if (defaultShowMaxSize > 0 && opts.rowIndex >= defaultShowMaxSize && opts.isShowMaxSizeStatus) {

            //当前条数等于最大显示条数配置时,添加 SHOW_MAX_SIZE_STATUS 信息
            if (opts.rowIndex === defaultShowMaxSize) {
                var tr = $("<tr></tr>");
                var td = $("<td  colspan=\"" + ((opts.rownumbers) ? 1 + opts.columns.length : opts.columns.length) + "\" style=\"text-align: center;cursor:pointer;\">" + TEXT_STATUS.SHOW_MAX_SIZE_STATUS() + "</td>");
                td.click(function() {
                    opts.isShowMaxSizeStatus = !opts.isShowMaxSizeStatus;
                    reload(target);
                });
                tr.html(td);
                $(target).append(tr);
            }

        } else {

            var tr = $("<tr></tr>");
            var tds = [];
            if ( typeof (opts.rownumbers) != "undefined" && opts.rownumbers) {
                if (opts.idCheckbox) {
                    var html = "<td style=\"width:41px;\">";
                    html += "<label>";
                    html += "<input type=\"checkbox\" name=\"" + $(target).attr("id") + "_" + opts.idField + "\" ri=\"" + opts.rowIndex + "\" style=\"margin-top:-6px;margin-right:2px;\" value=\"" + data[opts.idField] + "\"/>";
                    html += opts.rowIndex + 1;
                    html += "</label>";
                    html += "</td>";
                    tds.push($(html));
                } else {
                    tds.push($("<td>" + (opts.rowIndex + 1) + "</td>"));
                }
            }

            //添加了是否隐藏该列字段 display 2014年11月03日20:35:46
            for (var i = 0; i < opts.columns.length; i++) 
            {

                var column = opts.columns[i];
                var td = $("<td></td>");

                var styleStr = "";
                if (column.display) {
                    styleStr += "display: none;";
                }
                if (column.width) {
                    styleStr += "width:" + column.width + ";";
                }
                if (styleStr) {
                    td.attr("style", styleStr);
                }
                if (column.tdClassName) {
                    td.attr("class", column.tdClassName);
                }
                if (column.formatter) {
                    if ( typeof data == "string") {
                        td.html(column.formatter(data, data, opts.rowIndex));
                    } else {
                        td.html(column.formatter(data[column.field], data, opts.rowIndex));
                    }
                } else {
                    if ( typeof data == "string") {
                        td.html(data);
                    } else {
                        td.html(data[column.field] == undefined ? "" : data[column.field]);
                    }
                }
                tds.push(td);
            }
            for (var i = 0; i < tds.length; i++) {
                tr.append(tds[i]);
            }
            tr.data("data", data);

            //当前是否为[收起>>]状态
            var showMaxSizeStatusTr = getColSpanContainsTr(target, TEXT_STATUS.NOT_SHOW_MAX_SIZE_STATUS());
            //按行添加,超过最大显示值时判定是否自动添加 [收起>>]状态
            if (defaultShowMaxSize > 0 && opts.rowIndex == defaultShowMaxSize && !opts.isShowMaxSizeStatus && !showMaxSizeStatusTr) {
                showMaxSizeStatusTr = footer(target);
            }

            //为收起状态时默认在最后一行前追加内容
            if (showMaxSizeStatusTr) {
                var $tbody = $(target).find("tbody");
                var number = ($tbody.find("tr").length - 1);
                $tbody.find("tr:eq(" + number + ")").before(tr);
            } else {
                $(target).append(tr);
            }

            }

            //数据绑定
            if (!flag) {
                if (null == opts.datas) {
                    opts.datas = [];
                }
                opts.datas.push(data);
            }
            opts.rowIndex += 1;

            opts.reloadCallBack();
            }


    /**
     * @description 更新行数据
     * @param {Object} target 对象
     * @param {Data} data 数据对象
     */
    function updateRowData(target, data) {
        var opts = $.data(target, "ezDataGrid").options;
        if (null != opts.datas && null != data) {
            if (null == opts.idField && typeof data.rowIndex != "undefined" || null != data.rowIndex && typeof data.data != "undefined" && null != data.data) {
                for (var i = 0; i < opts.datas.length; i++) {
                    if (i == data.rowIndex) {
                        opts.datas[i] = data.data;
                        return;
                    }
                }
            } else {
                for (var i = 0; i < opts.datas.length; i++) {
                    if (opts.datas[i][opts.idField] == data[opts.idField]) {
                        opts.datas[i] = data;
                        return;
                    }
                }
            }
        }
    }

    /**
     * @description 根据序号移除一行
     * @param {Object} target 对象
     * @param {int} rowIndex 序号
     */
    function removeRowByRowIndex(target, rowIndex) {
        var opts = $.data(target, "ezDataGrid").options;
        var datas = opts.datas;
        if (null != datas && datas.length > 0) {
            var new_datas = [];
            for (var i = 0; i < datas.length; i++) {
                if (i == rowIndex) {
                    continue;
                }
                new_datas.push(datas[i]);
            }
            opts.datas = new_datas.length > 0 ? new_datas : null;
        }
        reload(target);
    }

    function getAllDatas(target, data) {
        var opts = $.data(target, "ezDataGrid").options;
        return (null != opts.datas && opts.datas.length > 0) ? opts.datas : null;
    }

    /**
     * @class
     * @description ezDataGrid 控件
     * @param {$.fn.ezDataGrid.defaults} options 参数或者调用名
     * @param {Param} param 参数
     * @return {$.fn.ezDataGrid} ezDataGrid
     */
    $.fn.ezDataGrid = function(options, param) {
        if ( typeof options == "string") {
            return $.fn.ezDataGrid.methods[options](this, param);
        }
        options = options || {};
        return this.each(function() {
            var state = $.data(this, "ezDataGrid");
            if (state) {
                $.extend(state.options, options);
            } else {
                state = $.data(this, "ezDataGrid", {
                    options : $.extend({}, $.fn.ezDataGrid.defaults, options)
                });
                if (null == state.options.url || state.options.start == false) {
                    reload(this);
                } else {
                    reloadFromServer(this);
                }
            }
        });
    };

    /**
     * @class
     * @extends external:{$.fn.ezDataGrid}
     * @description ezDataGrid 默认选项
     * @return {$.fn.ezDataGrid.defaults} 默认数据
     */
    $.fn.ezDataGrid.defaults = {
        /**
         * @description {String} url 请求 URL
         * @field
         */
        url : null,
        start : true,
        /**
         * @description {String} idField 主键字段名称
         * @field
         */
        idField : null,
        /**
         * @description {boolean} idCheckbox 是否启用复选框
         * @field
         */
        idCheckbox : false,
        /**
         * @description {boolean} rownumbers 是否显示序号
         * @field
         */
        rownumbers : false,
        /**
         * @description {Data} datas 数据
         * @field
         */
        datas : null,
        /**
         * @description {int} rowIndex 序号
         * @field
         */
        rowIndex : 0,
        /**
         * @description {Column} columns 列信息
         * @field
         */
        columns : null,

        /**
         * @description {Column} colspan_columns 是否跨列
         * @field
         */
        colspan_columns : false,

        /**
         * @description {Number} defaultShowMaxSize 默认显示最大条数 , -1 不做限制
         * @field
         */
        defaultShowMaxSize : -1,

        /**
         * @description {boolean} isShowMaxSizeStatus 是否显示最大条数状态 ,true 当前只显示最大条数 出现显示全部按钮, false 显示全部数据 出现收起按钮
         * @field
         */
        isShowMaxSizeStatus : true,

        /**
         * @description {boolean} reloadCallBack 表格reload 后的CallBack 方法
         * @field
         */
        reloadCallBack : function() {
        }
    };

    /**
     * @class
     * @extends external:{$.fn.ezDataGrid}
     * @description ezDataGrid 调用方法
     */
    $.fn.ezDataGrid.methods = {
        /**
         * @description 获取 ezDataGrid 选项
         * @param {Object} jq 对象
         * @return {$.fn.ezDataGrid.defaults} ezDataGrid 选项
         */
        options : function(jq, data) {
            if ( typeof data == "undefined") {
                return $.data(jq[0], "ezDataGrid").options;
            }
            data = data || {};
            //alert(JSON.stringify($.extend({}, $.data(jq[0], "ezDataGrid").options, data)));
            $.data(jq[0], "ezDataGrid", {
                options : $.extend({}, $.data(jq[0], "ezDataGrid").options, data)
            });
            return $.data(jq[0], "ezDataGrid").options;
        },
        /**
         * @description 重新载入 ezDataGrid
         * @param {Object} jq 对象
         * @param {$.fn.ezDataGrid.defaults} param 选项参数
         * @return {$.fn.ezDataGrid} ezDataGrid
         */
        reload : function(jq, param) {
            return jq.each(function() {
                reload(this, param);
            });
        },
        /**
         * @description 从服务器重新载入 ezDataGrid
         * @param {Object} jq 对象
         * @param {$.fn.ezDataGrid.defaults} param 选项参数
         * @return {$.fn.ezDataGrid} ezDataGrid
         */
        reloadFromServer : function(jq, param) {
            return jq.each(function() {
                reloadFromServer(this, param);
            });
        },
        /**
         * @description 根据序号获取数据
         * @param {Object} jq 对象
         * @param {int} param 序号
         * @return {Data} 数据
         */
        getDataByRowIndex : function(jq, param) {
            return getDataByRowIndex(jq[0], param);
        },
        /**
         * @description 根据id获取数据
         * @param {Object} jq 对象
         * @param {String} param id
         * @return {Data} 数据
         */
        getDataById : function(jq, param) {
            return getDataById(jq[0], param);
        },
        /**
         * @description 获取选中项数据
         * @param {Object} jq 对象
         * @param {Param} param 参数
         * @return {Data} 数据
         */
        getSelectedDatas : function(jq, param) {
            return getSelectedDatas(jq[0], param);
        },
        /**
         * @description 取消全选
         * @param {Object} jq 对象
         * @param {Param} param 参数
         */
        unSelectAll : function(jq, param) {
            return unSelectAll(jq[0], param);
        },
        /**
         * @description 增加一行
         * @param {Object} jq 对象
         * @param {Data} param 行数据
         */
        addRow : function(jq, param) {
            return jq.each(function() {
                addRow(this, param);
            });
        },
        updateRowData : function(jq, param) {
            return jq.each(function() {
                updateRowData(this, param);
            });
        },
        /**
         * @description 根据序号移除一行
         * @param {Object} jq 对象
         * @param {int} param 序号
         */
        removeRowByRowIndex : function(jq, param) {
            return jq.each(function() {
                removeRowByRowIndex(this, param);
            });
        },
        /**
         * @description 获取所有数据
         * @param {Object} jq 对象
         * @param param 参数
         * @returns 所有数据
         */
        getAllDatas : function(jq, param) {
            return getAllDatas(jq[0], param);
        }
    };
})(jQuery); 