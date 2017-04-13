/**
 * 数据校验
 * -----------------------------------------------------
 *
 * @description
 *
 *  null  / {} / []                         表述为 Blank
 *  null / undefined / {} / [] / NaN / ''   表述为 Empty
 *
 *  -----------------------------------------------------
 * Created by wei.Li on 14/11/21.
 */
//email
var EMAIL_REGEXP = "/^\\w+((-\\w+)|(\\.\\w+))*@[A-Za-z0-9]+((\\.|-)[A-Za-z0-9]+)*\\.[A-Za-z0-9]+$/";
//英文数字 ，默认长度4-10
var ENGLISH_NUMBERS_LENGTH_REGEXP = "[a-zA-Z0-9_]{4,10}";
//英文数字 ，无长度限制
var ENGLISH_NUMBERS_REGEXP = "[a-zA-Z0-9_]";
//中英文数字下划线 ，默认长度4-10
var CHINESE_ENGLISH_NUMBERS_UNDERLINE_LENGTH_REGEXP = "[\u4e00-\u9fa5_a-zA-Z0-9_]{4,10}";
//中英文数字下划线 ，无长度限制
var CHINESE_ENGLISH_NUMBERS_UNDERLINE_REGEXP = "[\u4e00-\u9fa5_a-zA-Z0-9_]";
//IP
var IP_REGEXP = "^(([1-9]|([1-9]\\d)|(1\\d\\d)|(2([0-4]\\d|5[0-5])))\\.)(([0-9]|([0-9]\\d)|(1\\d\\d)|(2([0-4]\\d|5[0-5])))\.){2}([0-9]|([0-9]\\d)|(1\\d\\d)|(2([0-4]\\d|5[0-5])))$";
//时间格式 ex: 00:00
var HH_MM_REGEXP = "^(0\\d{1}|1\\d{1}|2[0-4]):([0-5]\\d{1})$";

var _toString = Object.prototype.toString;
//TODO
//FIXME
var checkArgs = new function () {

    //默认文本框最大长度
    var defaultMaxLength = 50;


    /**
     * 校验数据是否为空，不保证每个元素的值不为空
     *
     * @param {string/number/object} args
     * @returns {boolean} null / undefined / {} / [] / NaN / '' 默认返回 true(是空值)
     */
    this.checkIsEmpty = function (args) {

        var type = _toString.call(args).slice(8, -1);

        switch (type) {
            case 'String':
                return !$.trim(args);
            case 'Array':
                return !args.length;
            case 'Object':
                // 普通对象使用 for...in 判断，有 key 即为 false
                if (!args) return true;
                for (var key in args)
                    return false;
                return true;
            default:
                // 其他对象均视作空
                return true;
        }
    };


    /**
     * 校验数据是否为空着，不保证每个元素的值不为空
     *
     * @param {string/number/object} args
     * @returns {boolean} is null OR '' OR length==0  默认返回 false
     */
    this.checkIsBlank = function (args) {

        return (typeof args !== 'undefined' && (args == null || args == '' || args.length == 0) );

    };


    /* */
    /**
     * @deprecated
     * 校验数据中是否 ，保证每个元素的值不为空
     *
     * @param {string/number/object} args
     * @returns {boolean} null / undefined / {} / [] / NaN / '' 默认返回 true(是空值)
     */
    /*
     this.checkObjHaveValIsEmpty = function (args) {

     var type = Object.prototype.toString.call(args).slice(8, -1);
     switch (type) {
     case 'String':
     return !$.trim(args);
     case 'Array':
     return this.checkObjHaveEmptyElement(args);
     case 'Object':
     return this.checkObjHaveEmptyElement(args);
     default:
     // 其他对象均视作非空
     return true;
     }
     };*/


    /**
     * 校验参数中每个元素是否含有 空值
     * @param {object} [args]
     * @param {Array} ignoreFields 校验忽略字段
     * @returns {boolean} 有某个元素含有空值返回 true
     */
    this.checkObjHaveEmptyElement = function (args, ignoreFields) {

        //checkIsEmpty 方法保证对象数据不为空，当不保证每个元素的值不为空
        if (this.checkIsEmpty(args)) {
            return true;
        }
        ignoreFields = ignoreFields || [];
        //校验每个值不为空
        for (var key in args) {

            var obj = args[key];
            if (obj == '') return true;
            for (var element in obj) {
                if ((!$.inArray(element, ignoreFields)) && $.trim(obj[element]) == '') {
                    return true;
                }
            }
        }
        return false;
    };


    /**
     * 校验参数 是否为空对象 或者 数据每个元素是否含有空值
     * @param {object}[args]
     * @returns {boolean} 如果是Blank 对象 或者不含有空元素返回 true
     */
    this.checkObjsIsBlankOrNotHaveEmptyElement = function (args) {

        if (this.checkIsBlank(args)) return true;

        return !this.checkObjHaveEmptyElement(args, undefined);
    };

    /**
     * 校验参数 是否为空对象 或者 数据每个元素是否含有空值
     * @param {object}[args] 待校验对象
     * @param {Array} ignoreFields 校验忽略字段
     * @returns {boolean} 如果是Blank 对象 或者不含有空元素返回 true
     */
    this.checkObjsIsBlankOrNotHaveEmptyElement = function (args, ignoreFields) {

        if (this.checkIsBlank(args)) return true;

        return !this.checkObjHaveEmptyElement(args, ignoreFields);
    };

    /**
     * 校验 arg 是否在 JSONObject 中
     * @param {*} [JSONObject]    JSONObject
     * @param {Object} arg
     * @param {boolean} ignoreNumberStringType 是否忽略字符串数字类型的类型比较
     * @returns {boolean}  存在 true(arg是JSONObject的一个元素)
     */
    this.isElementInJSONObject = function (JSONObject, arg, ignoreNumberStringType) {

        if (!arg || !JSONObject) {
            return false;
        }

        /**
         * 处理 非 object 类型的校验
         */
        if (typeof arg !== "object") {
            var b = false;
            $.each(JSONObject, function () {
                if (arg == this) {
                    b = true;
                    return false;
                }
            });
            return b;
        }

        if (ignoreNumberStringType) {
            return checkHelperUtils.ignoreNumberStringTypeCompare(JSONObject, arg);
        } else {
            return checkHelperUtils.notIgnoreNumberStringTypeCompare(JSONObject, arg);
        }
    };


    /**
     * 类型是否为 object
     *
     * @param  {object} [arg]   对象数据
     * @returns {boolean} 如果有一个类型不为 object 则返回 false
     */
    this.isTypeOfObject = function (arg) {

        if (typeof arg === 'object') {

            var b = true;
            $.each(arg, function () {

                var type = _toString.call(this).slice(8, -1);
                if (type !== 'Object') {
                    b = false;
                    return false;
                }
            });
            return b;
        }
        return false;
    };


    /**
     * 是否是数字
     * @param {string} arg
     * @returns {boolean} 是数字返回 true
     */
    this.checkNumber = function (arg) {
        return $.isNumeric(arg);
    };


    /**
     * 是否是数字 且长度为 < defaultMaxLength
     * @param {number} arg
     * @returns {boolean}
     */
    this.checkNumberLtDefaultMaxLength = function (arg) {
        return $.isNumeric(arg) && arg.toString().length < defaultMaxLength;
    };


    /**
     * 是否是数字,且最大长度为 < maxLength
     * @param  {number} arg
     * @param  {number} maxLength
     * @returns {boolean}
     */
    this.checkNumberLtMaxLength = function (arg, maxLength) {
        return $.isNumeric(arg) && arg.toString().length < maxLength;
    };

    /**
     * 是否匹配 email 格式
     * @param arg 参数
     * @returns {boolean} 是 Email 格式返回 true
     */
    this.checkEmail = function (arg) {
        return (arg.search(EMAIL_REGEXP) != -1);
    };

    /**
     * 是否匹配 IP 格式
     * @param {string} arg 参数
     * @returns {boolean} 是 IP 格式返回 true
     */
    this.checkIP = function (arg) {
        return (arg.search(IP_REGEXP) != -1);
    };


    /**
     * 是否匹配 端口 格式 端口号为数字 0~65535
     * @param {number} arg 参数
     * @returns {boolean} 是 Email 格式返回 true
     */
    this.checkPort = function (arg) {
        return ($.isNumeric(arg) && arg > 0 && arg < 65535);
    };


    /**
     * 验证是否是英文数字、默认长度4-10
     * @param {*} arg
     * @returns {boolean}
     */
    this.checkEnglishNumbersLength = function (arg) {
        return (arg.search(ENGLISH_NUMBERS_LENGTH_REGEXP) != -1);
    };


    /**
     * 验证是否是英文数字、自定义长度限制
     * @param {*} arg
     * @returns {boolean}
     */
    this.checkEnglishNumbers = function (arg, minLength, maxLength) {
        return (arg.search(ENGLISH_NUMBERS_REGEXP + this.getRegexpLength(minLength, maxLength)) != -1);
    };


    /**
     * 验证是否是中英文数字下划线、默认长度4-10
     * @param {*}arg
     * @returns {boolean}
     */
    this.checkChineseEnglishNumbersUnderlineLength = function (arg) {
        return (arg.search(CHINESE_ENGLISH_NUMBERS_UNDERLINE_LENGTH_REGEXP) != -1);
    };


    /**
     * 验证是否是中英文数字下划线、自定义长度限制
     * @param {*} arg
     * @param {number} minLength 最小长度
     * @param {number} maxLength 最大长度
     * @returns {boolean}
     */
    this.checkChineseEnglishUnderlineNumbers = function (arg, minLength, maxLength) {
        return (arg.search(CHINESE_ENGLISH_NUMBERS_UNDERLINE_REGEXP + this.getRegexpLength(minLength, maxLength)) != -1);
    };


    /**
     * @param {number} minLength
     * @param {number} maxLength
     * @returns {string} 正则表达式 {minLength,maxLength} 字符串
     */
    this.getRegexpLength = function (minLength, maxLength) {
        return "{" + minLength + "," + maxLength + "}";
    };
};

//onkeyup 事件注册
var registerOnkeyup = new function () {

    /**
     * 清除“数字”和“.”以外的字符
     * onkeyup 事件注册
     * @param {object}obj
     */
    this.clearNoNumOrPoint = function (obj) {
        obj.value = obj.value.replace(/[^\d.]/g, "");  //清除“数字”和“.”以外的字符
        obj.value = obj.value.replace(/^\./g, "");  //验证第一个字符是数字而不是.
        obj.value = obj.value.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的.
        obj.value = obj.value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
    };

    /**
     * 清除“数字”以外的字符
     * onkeyup 事件注册
     * @param {object}obj
     */
    this.clearNoNum = function (obj) {
        obj.value = obj.value.replace(/[^\d.]/g, "");  //清除“数字”和“.”以外的字符
    };

};


/**
 * 使用 validate + qtip2.0 插件校验
 * @see http://qtip2.com/demos
 *
 * 自定义校验方法添加说明
 * @see additional-methods.min.js 注释中的部分代码、添加自定义方法需要同步添加validateCheckForm#handleCustomOrGroupsMessages()方法集中显示错误信息
 */
var validateCheckForm = new function () {

    /**
     * 定义 formObj 、 默认设置示例
     * @type {{formId: string, rules: {rule_type: {required: boolean}}, customMessages: {}, isGroupsMessages: boolean, checkIsRepetitionParam: {target_id: string, ignoreNumberStringType: boolean, getAllDateFunctionName: *, getArgDateFunctionName: *}[], initCheckForm: Function, isValid: Function}}
     */
    this.default_setting = {

        //表单id
        formId: "#id",
        //校验的内容字段（name 属性作为选择器）remote为异步请求验证-可验证用户名称是否重复
        //扩展方法见 additional-methods.min.js
        rules: {
            title: {
                required: true, maxlength: 20, remote: {//远程地址只能输出 "true" 或 "false"，不能有其他输出
                    url: SUBSYSTEM_APP_NAME + "streams/updateStreamCommon1",     //后台处理程序
                    type: "post",               //数据发送方式
                    dataType: "json",           //接受数据格式
                    data: {                     //要传递的数据
                        username: function () {
                            return "1";
                        }
                    }
                }
            },
            shortname: {maxlength: 20},
            description: {maxlength: 20}
        },
        //自定义提示信息
        customMessages: {},
        //是否将所有验证信息集中提示
        isGroupsMessages: true,
        //校验是否重复添加 [{}]、{}
        checkIsRepetitionParam: [{
            //校验结果显示的目标ID
            'target_id': "#id",
            //是否忽略字符串数字类型的比较
            'ignoreNumberStringType': true,
            //获取所有数据与添加数据的方法名字
            'getAllDateFunctionName': $.noop,
            'getArgDateFunctionName': $.noop
        }],
        //错误信息位置
        setting: {
            'container': $(document.body)
        }
        ,
        //init 添加表单验证、页面初始化执行
        initCheckForm: function () {
            validateCheckForm.checkDontSubmit(this);
        }
        ,
        // 是否验证成功、绑定到事件上
        isValid: function () {
            return $(this.formId).valid();
        }
    };


    /**
     * 仅验证不进行表单提交
     *   对于 chosen 插件的下拉框 class="chzn-select force-valid" data-force-valid-target-id="#baseline_filters_chosen"
     *   class 增加 force-valid ，表示强制性添加校验。attr 增加data-force-valid-target-id属性，指定校验结果显示的元素 id
     * @param {object}  formObj
     */
    this.checkDontSubmit = function (formObj) {

        var formId = formObj.formId;
        if (!formId) {
            return;
        }
        var rules = formObj.rules;
        rules = rules ? rules : {};

        this.handleCheckIsRepetitionParam(formObj);
        var messages = this.handleCustomOrGroupsMessages(formObj);
        // class="chzn-select force-valid" data-force-valid-target-id="#baseline_metrics_chosen"
        $(formId).validate({
            //忽略: ':hidden:not(.force-valid)', 忽略隐藏且不需要强制性校验的元素
            ignore: ':hidden:not(.force-valid)',
            onfocusout: false,
            //onclick:false,
            //onkeyup: false,
            // 每次显示提示都删除上一次的提示
            overwrite: true,
            errorClass: 'error',
            validClass: 'valid',
            //focusInvalid:true,
            focusCleanup: true,//focus对应对象时隐藏错误提示
            rules: rules,
            messages: messages,
            submitHandler: function () {
                $.noop();
            },
            invalidHandler: function () {//验证不通过时调用
                $.noop();
            },
            /*errorPlacement: function(error, element) { error.appendTo(element.parent()); },*/
            errorPlacement: function (error, element) {
                var elem = $(element);
                var target = elem;
                //强制性将结果显示到校验失败标签自定义的元素上
                var attr = elem.attr("data-force-valid-target-id");
                if (attr !== undefined) {
                    target = $(attr);
                }
                if (!error.is(':empty')) {
                    //var source = elem.source(':not(.valid)');
                    validateCheckForm.showErrorOfQtip(elem, error, target, formObj.setting);
                } else {
                    elem.qtip('destroy');
                }
            },
            success: $.noop
        });
    };

    /*
     * 显示 source 的提示到 target 元素上
     * @param {object} source
     * @param {string} errorMsg
     * @param {object} target
     * @param {object} setting 自定义设置
     */
    this.showErrorOfQtip = function (source, errorMsg, target, setting, Callbacks) {

        if (source.attr("aria-describedby") !== undefined) {
            source.qtip().show();
        } else {
            if (!setting) {
                setting = {};
            }
            if (!setting.container) {
                setting.container = this.default_setting.setting.container;
            }
            target = target ? target : source;
            source.qtip({
                overwrite: true,// 每次显示提示都删除上一次的提示
                content: errorMsg,// 提示信息的内容
                position: {
                    // 如提示的目标元素的右下角(at属性)
                    // 对应 提示信息的左上角(my属性)
                    my: 'left top',
                    at: 'bottom left',
                    target: target,
                    adjust: {
                        // scroll: true // Can be ommited (e.g. default behaviour)
                    },
                    container: setting.container,
                    viewport: $(window)
                },
                hide: {
                    effect: function () {
                        $(this).slideUp();
                    },
                    target: false,
                    event: 'unfocus',//blur/mouseleave/unfocus
                    //event: false,
                    delay: 0,
                    // 设置为true时，不会隐藏
                    //fixed: false,
                    //inactive: 2000,
                    leave: 'window'
                    //distance: false

                },
                show: {
                    event: false,
                    // ready 确定提示是否只要它被绑定到元素即当.qtip （ ）调用触发显示。
                    // 这是这是事件处理程序中创建，因为没有它，他们不会立即显示工具提示非常有用。
                    ready: true,
                    //when: 'focus', // 在点击事件触发后呈现该对话框，如果要执行其他的事件，可以写这里面
                    //solo: true, // 隐藏其他的tooltip 只显示这一个
                    effect: function () {
                        $(this).slideDown();
                    }
                },
                style: {
                    //['red', 'blue', 'dark', 'light', 'green','jtools', 'plain', 'youtube', 'cluetip', 'tipsy', 'tipped','bootstrap']
                    //classes: 'ui-tooltip-tipsy ui-tooltip-shadow ui-tooltip-rounded',
                    classes: 'ui-tooltip-tipsy',
                    widget: false,
                    width: 'auto',
                    height: 'auto'
                }
            });
        }

        if (Callbacks) {
            Callbacks();
        }
    };

    /*
     * 用于ldap验证
     * 显示 source 的提示到 target 元素上
     * @param {object} source
     * @param {string} errorMsg
     * @param {object} target
     * @param {object} setting 自定义设置
     */
    this.ldapShowErrorOfQtip = function (source, errorMsg, target, setting, Callbacks) {

        if (!setting) {
            setting = {};
        }
        if (!setting.container) {
            setting.container = this.default_setting.setting.container;
        }
        target = target ? target : source;
        source.qtip({
            overwrite: true,// 每次显示提示都删除上一次的提示
            content: errorMsg,// 提示信息的内容
            position: {
                // 如提示的目标元素的右下角(at属性)
                // 对应 提示信息的左上角(my属性)
                my: 'left top',
                at: 'bottom left',
                target: target,
                adjust: {
                    // scroll: true // Can be ommited (e.g. default behaviour)
                },
                container: setting.container,
                viewport: $(window)
            },
            hide: {
                effect: function () {
                    $(this).slideUp();
                },
                target: false,
                event: 'unfocus',//blur/mouseleave/unfocus
                //event: false,
                delay: 0,
                // 设置为true时，不会隐藏
                //fixed: false,
                //inactive: 2000,
                leave: 'window'
                //distance: false

            },
            show: {
                event: false,
                // ready 确定提示是否只要它被绑定到元素即当.qtip （ ）调用触发显示。
                // 这是这是事件处理程序中创建，因为没有它，他们不会立即显示工具提示非常有用。
                ready: true,
                //when: 'focus', // 在点击事件触发后呈现该对话框，如果要执行其他的事件，可以写这里面
                //solo: true, // 隐藏其他的tooltip 只显示这一个
                effect: function () {
                    $(this).slideDown();
                }
            },
            style: {
                //['red', 'blue', 'dark', 'light', 'green','jtools', 'plain', 'youtube', 'cluetip', 'tipsy', 'tipped','bootstrap']
                //classes: 'ui-tooltip-tipsy ui-tooltip-shadow ui-tooltip-rounded',
                classes: 'ui-tooltip-tipsy',
                widget: false,
                width: 'auto',
                height: 'auto'
            }
        });
        if (Callbacks) {
            Callbacks();
        }
    };

//提示信息分隔符定义
    var errorQTipSeparator = "，";
    /**
     * 自定义方法显示错误提示信息
     * @param {{}}  formObj
     * @returns {{}}
     */
    this.handleCustomOrGroupsMessages = function (formObj) {
        var messages = {};
        var rules = formObj.rules;
        var isGroupsMessages = formObj.isGroupsMessages;
        var customMessages = formObj.customMessages;
        customMessages = customMessages ? customMessages : {};
        if (rules) {
            for (var key in rules) {
                //剔除自定义的
                var customMessage = customMessages[key];
                if (customMessage) {
                    messages[key] = customMessage;
                    continue;
                }
                if (!isGroupsMessages) {
                    continue;
                }
                var obj = rules[key];
                var msg = "";
                //required: true, digits: true, min: 1, maxlength: 9
                if (obj["required"] !== undefined) {
                    msg += "必填" + errorQTipSeparator;
                }
                if (obj["digits"] !== undefined) {
                    msg += "整数格式" + errorQTipSeparator;
                } else if (obj["number"] !== undefined) {
                    msg += "数字格式" + errorQTipSeparator;
                }
                var min = obj["min"];
                var max = obj["max"];
                var isMin = min !== undefined;
                var isMax = max !== undefined;
                if (isMin && isMax) {
                    msg += "范围" + min + "~" + max + errorQTipSeparator;
                } else if (isMin && !isMax) {
                    msg += "最小值" + min + errorQTipSeparator;
                } else if (!isMin && isMax) {
                    msg += "最大值" + max + errorQTipSeparator;
                }

                var minlength = obj["minlength"];
                var maxlength = obj["maxlength"];

                var isMinlength = minlength !== undefined;
                var isMaxlength = maxlength !== undefined;
                if (isMinlength && isMaxlength) {
                    msg += "内容为" + minlength + "~" + maxlength + "个字符" + errorQTipSeparator;
                } else if (isMinlength && !isMaxlength) {
                    msg += "内容不小于" + minlength + "个字符" + errorQTipSeparator;
                } else if (!isMinlength && isMaxlength) {
                    msg += "内容不超过" + maxlength + "个字符" + errorQTipSeparator;
                }
                if (obj["checkIsRepetition"] !== undefined) {
                    msg += "添加的内容已定义" + errorQTipSeparator;
                }
                if (obj["email"] !== undefined) {
                    msg += "请填写正确的邮箱" + errorQTipSeparator;
                }
                if (obj["ip"] !== undefined) {
                    msg += "请填写有效的IP地址" + errorQTipSeparator;
                }
                if (obj['port'] !== undefined) {
                    msg += "请填写正确的端口号 0-65535" + errorQTipSeparator;
                }
                if (obj['mobile'] !== undefined) {
                    msg += "请填写正确的手机号码" + errorQTipSeparator;
                }
                if (obj['regularExpression'] !== undefined) {
                    msg += "请填写有效的时间" + errorQTipSeparator;
                }
                if(obj["splitLengthIsEqSelectVal"] !== undefined){
                	msg += "填写内容数量与所选内容数量不一致" + errorQTipSeparator;
                }
                
                var length = msg.length;
                if (length > 1) {
                    msg = msg.substring(0, length - 1);
                }
                messages[key] = msg;
            }
        }
        return messages;
    };


    /**
     * 处理验证是否重复添加参数信息
     *
     * @param {{}}formObj
     */
    this.handleCheckIsRepetitionParam = function (formObj) {

        var checkIsRepetitionParam = formObj.checkIsRepetitionParam;
        if (checkIsRepetitionParam) {
            var type = _toString.call(checkIsRepetitionParam).slice(8, -1);

            switch (type) {
                case 'Array':
                    for (var i = 0; i < checkIsRepetitionParam.length; i++) {
                        var param = checkIsRepetitionParam[i];
                        addCheckIsRepetition(param, formObj, i);
                    }
                    break;
                case 'Object':
                    addCheckIsRepetition(checkIsRepetitionParam, formObj, 0);
                    break;
            }
        }
    };

    /**
     * 添加 调用'checkIsRepetition'方法的参数信息 到 rules 中
     * @param {{}}param
     * @param {{}}formObj
     * @param {number}number 多个待校验重复的参数，name 尾数编号
     */
    function addCheckIsRepetition(param, formObj, number) {
        var targetId = param.target_id;
        var allDateFunctionName = param.getAllDateFunctionName;
        var argDateFunctionName = param.getArgDateFunctionName;
        var ignoreNumberStringType = param.ignoreNumberStringType;
        ignoreNumberStringType = ignoreNumberStringType !== undefined;
        if (targetId && allDateFunctionName && argDateFunctionName
            && $.isFunction(allDateFunctionName) && $.isFunction(argDateFunctionName)) {
            var formId = formObj.formId;
            var hidderInputName = formId + "checkIsRepetitionParam" + number;
            var hiddenInput = "<input type=\"hidden\" name=\"" + hidderInputName +
                "\" class=\"force-valid\" data-force-valid-target-id=\"" + targetId + "\"> ";
            $(formId).append(hiddenInput);
            formObj.rules[hidderInputName] = {
                'checkIsRepetition': [allDateFunctionName, argDateFunctionName, ignoreNumberStringType]
            };
        } else {
            console.log("添加 'checkIsRepetition' 到 rules 中 Check failed" + JSON.stringify(param));
        }
    }
};


var checkHelperUtils = new function () {

    /**
     * 递归对象中参数 number 类型转换为 string
     * @param obj
     */
    this.numberConvertStringType = function (obj) {
        for (var key in obj) {
            var obj22 = obj[key];
            if (typeof obj22 === "object") {
                this.numberConvertStringType(obj22);
            } else if (typeof obj22 === "number") {
                obj[key] = obj22.toString();
            }
        }
    };

    /**
     *  arg 的所有参数逐个对比 objes[{}]中的信息，忽略字符串与数字类型的比较
     * @param {[{}]} objArray
     * @param {{}} arg
     * @returns {boolean} 是否重复
     */
    this.ignoreNumberStringTypeCompare = function (objArray, arg) {
        var result = false;
        $.each(objArray, function () {

            var isRepetition = true;
            for (var key in arg) {
                var argParam = arg[key];
                var objsParam = this[key];
                //其中一个内容为空,表示不重复
                if ((argParam != null && objsParam == null) || (argParam == null && objsParam != null)) {
                    isRepetition = false;
                    break;
                } else if (typeof argParam === "object") {
                    if (!checkHelperUtils.ignoreNumberStringTypeCompareHandle(objsParam, argParam)) {
                        isRepetition = false;
                        break;
                    }
                } else if (argParam != objsParam) {
                    isRepetition = false;
                    break;
                }
            }
            if (isRepetition) {
                result = true;
                return false;
            }
        });
        return result;
    };

    /**
     *  arg 的所有参数逐个对比 objes[{}]中的某个对象的信息，忽略字符串与数字类型的比较
     * @param {{}} obj
     * @param {{}} arg
     * @returns {boolean} 是否重复某字段
     */
    this.ignoreNumberStringTypeCompareHandle = function (obj, arg) {
        if (obj == null && arg == null) {
            return true;
        } else if (obj == null || arg == null) {
            return false;
        }
        for (var key in arg) {
            var argParam = arg[key];
            var objsParam = obj[key];
            if (typeof argParam === "object") {
                if (!checkHelperUtils.ignoreNumberStringTypeCompareHandle(objsParam, argParam)) {
                    return false;
                }
            } else if (argParam != objsParam) {
                return false;
            }
        }
        return true;
    };


    /**
     *  arg 的所有参数逐个对比 objes[{}]中的信息，不忽略字符串与数字类型的比较
     * @param {[{}]} objArray
     * @param {{}} arg
     * @returns {boolean} 是否重复
     */
    this.notIgnoreNumberStringTypeCompare = function (objArray, arg) {
        var result = false;
        $.each(objArray, function () {

            var isRepetition = true;
            for (var key in arg) {
                var argParam = arg[key];
                var objsParam = this[key];
                //其中一个内容为空,表示不重复
                if ((argParam != null && objsParam == null) || (argParam == null && objsParam != null)) {
                    isRepetition = false;
                    break;
                } else if (typeof argParam === "object") {
                    if (!checkHelperUtils.notIgnoreNumberStringTypeCompareHandle(objsParam, argParam)) {
                        isRepetition = false;
                        break;
                    }
                } else if (argParam !== objsParam) {
                    isRepetition = false;
                    break;
                }
            }
            if (isRepetition) {
                result = true;
                return false;
            }
        });
        return result;
    };

    /**
     *  arg 的所有参数逐个对比 objes[{}]中的某个对象的信息，不忽略字符串与数字类型的比较
     * @param {{}} obj
     * @param {{}} arg
     * @returns {boolean} 是否重复某字段
     */
    this.notIgnoreNumberStringTypeCompareHandle = function (obj, arg) {
        for (var key in arg) {
            var argParam = arg[key];
            var objsParam = obj[key];
            if (typeof argParam === "object") {
                if (!checkHelperUtils.notIgnoreNumberStringTypeCompareHandle(objsParam, argParam)) {
                    return false;
                }
            } else if (argParam !== objsParam) {
                return false;
            }
        }
        return true;
    };

    /**
     * 转换为JSON 字符串进行比较 （保证对象信息顺序）
     * @param {[{}]}objArray
     * @param {{}}arg
     * @returns {boolean} arg是否在objs中已存在
     */
    this.convertJSONStrCompare = function (objArray, arg) {
        var b = false;
        var stringify_arg = JSON.stringify(arg);

        $.each(objArray, function () {
            if (stringify_arg == JSON.stringify(this)) {
                b = true;
                return false;
            }
        });
        return b;
    };
};
