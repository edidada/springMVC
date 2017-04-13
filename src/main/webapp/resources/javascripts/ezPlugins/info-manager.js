/*
 *
 * Copyright (c) 2015 EBo (https://github.com/E-Bo)
 *
 * Version 0.1
 *
 * Work with jQuery
 *
 */
var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

var checker = {
    isDOM: function(dom){
        if(typeof HTMLElement === 'object' || typeof HTMLElement === 'function'){
            return dom instanceof HTMLElement;
        }else{
            return dom && typeof(dom) === 'object' && dom.nodeType === 1 && typeof(dom.nodeName) === 'string';
        }
    },
    isBool: function(bool){
        return typeof(bool) === 'boolean';
    },
    isString: function(string){
        return typeof(string) === 'string';
    },
    isObject: function(obj){
        return typeof(obj) === 'object';
    },
    isArray: function(arr){
        return arr instanceof Array;
    },
    isFunction: function(fun){
        return typeof(fun) === 'function';
    },
    isNumber: function(number){
        return typeof(number) === 'number';
    },
    isEmptyObject: function(obj){
        for(var n in obj){return false;}
        return true;
    }
};

var setter = {
    setDom: function(needDom){
        if(checker.isObject(needDom) && checker.isDOM(needDom[0])){
            return needDom[0];
        }else if(checker.isString(needDom)){
            if(checker.isDOM($(needDom)[0])){
                return $(needDom)[0];
            }else{
                return null;
            }
        }else if(checker.isDOM(needDom)) {
            return needDom;
        }else{
            return null;
        }
    },
    setBool: function(needBool){
        if(checker.isBool(needBool)){
            return needBool;
        }else{
            return null;
        }
    },
    setString: function(needString){
        if(checker.isString(needString)){
            return needString;
        }else{
            return null;
        }
    },
    setObj: function(needObj){
        if(checker.isObject(needObj)){
            return needObj;
        }else{
            return null;
        }
    },
    setArray: function(needArray){
        if(checker.isArray(needArray)){
            return needArray.concat();
        }else{
            return null;
        }
    },
    setFunction: function(needFun){
        if(checker.isFunction(needFun)){
            return needFun;
        }else {
            return null;
        }
    },
    setNumber: function(needNum){
        if(checker.isNumber(needNum)){
            return needNum;
        }else {
            return null;
        }
    }
};

var infoManager = function(options){
    options = options || {};
    this.defOptions = {
        container: null,
        triggerParentSelector: '',
        triggerSelector: '',
        showEventType: 'mouseenter',
        hideEventType: 'mouseleave',
        itemSelectorAttr: 'id',
        infoSrcKeyStr: 'asset',
        infoKeys: ['assetName','appDisplayName','assetSubType','deviceCity','deviceManager','deviceDepartment','deviceMIP','deviceServiceIP','deviceDomainName'],
        itemTemplate: null
    };
    this.options = $.extend({},this.defOptions);

    this.setOptions(options);

    if(!this.options.container || !this.options.itemTemplate || !this.options.triggerSelector || !this.options.triggerParentSelector || !this.options.infoSrcKeyStr || this.options.infoKeys.length == 0){
        this.consoleInfo('配置参数有误');
        return;
    };
    this.initInfoManager();
};

infoManager.prototype = {
    optionsCheck:{
        container: setter.setObj,
        triggerParentSelector: setter.setString,
        triggerSelector: setter.setString,
        showEventType: setter.setString,
        hideEventType: setter.setString,
        itemSelectorAttr: setter.setString,
        infoSrcKeyStr: setter.setString,
        infoKeys: setter.setArray,
        itemTemplate: setter.setFunction
    },
    setOptions: function(options){
        for(var key in this.optionsCheck){
            this.options[key] = this.optionsCheck[key](options[key]) === null ? this.optionsCheck[key](this.options[key]) : this.optionsCheck[key](options[key]);
        };
        this.logicalCheck();
    },
    logicalCheck: function(){

    },
    initInfoManager: function(){
        this.items = [];
        this.container = this.options.container;
        this.containerElement = this.options.container.render();
        this.triggers = $(this.options.triggerParentSelector);
        this.triggers.on(this.options.showEventType, this.options.triggerSelector, { manager: this }, function(event){
            var srcTarget = $(this).parent();
            var attrValue = srcTarget.attr(event.data.manager.options.itemSelectorAttr);
            event.data.manager.setItems(attrValue);
            event.data.manager.container.show(srcTarget);
        });
        this.triggers.on(this.options.hideEventType, this.options.triggerSelector, { manager: this }, function(event){
            event.data.manager.container.hide();
        });
    },
    setData: function(data){
        this.srcData = data;
    },
    setItems: function(itemAttrValue){
        var count = 0;
        var dataSet = this.getData(this.srcData[itemAttrValue], this.options.infoSrcKeyStr);
        for(var i = 0; i < this.options.infoKeys.length; i++){
            if(dataSet[this.options.infoKeys[i]] && dataSet[this.options.infoKeys[i]] != ''){
                var itemData = {
                    key: this.options.infoKeys[i],
                    value: dataSet[this.options.infoKeys[i]]
                };
                if(this.items[count]){
                    this.items[count].setData(itemData);
                }else{
                    this.items[count] = new this.options.itemTemplate();
                    this.containerElement.append(this.items[count].render());
                    this.items[count].setData(itemData);
                };
                count++ ;
            }
        };
        for(var j = count; j < this.items.length; j++){
            this.items[j].destroy();
            delete this.items[j];
        };
        this.items.length = count;
    },
    getData: function(data,keyString){
        var keys = keyString.split('.');
        var newData = $.extend({},data);
        for(var j = 0; j < keys.length; j++){
            if(newData[keys[j]]){
                newData = newData[keys[j]];
            }
        };
        return newData;
    },
    consoleInfo: function(msg){
        if(console && console.info){
            console.info(msg);
        };
    }
};

var infoItem = function(){
    this.element = $('#node_info_item_template').clone(false);
    this.doms = {};
    this.keys = {
        key: '.js-info-title',
        value: '.js-info-content'
    };
    this.initInfoItem();
};

infoItem.prototype = {
    displayNames: {
        'assetName': '设备名称',
        'assetSubType': '设备类型',
        'deviceCity': '城市',
        'deviceDepartment': '部门',
        'appName': '应用ID',
        'appDisplayName': '所属应用',
        'deviceServiceIP': '服务IP',
        'deviceMIP': '管理IP',
        'deviceManager': '管理员',
        'deviceDomainName': '域名',
        'storage': '存储',
        'host': '主机',
        'router': '路由器',
        'switchboard': '交换机',
        'virtualMac': '虚拟机',
        'physicalMac': '物理机',
        'secretMac': '加密机',
        'safetyEq': '安全设备',
        'f5': 'F5',
        'other': '其他',
        'firewall': '防火墙',
    },
    render: function(){
        return this.element.removeClass('template').removeAttr('id');
    },
    destroy: function(){
        this.doms = null;
        this.keys = null;
        this.element.remove();
        this.element = null;
    },
    initInfoItem: function(){
        for(var key in this.keys){
            this.doms[key] = this.element.find(this.keys[key]);
        };
    },
    setData: function(data){
        for(var key in this.keys){
            this.doms[key].text(this.getData(data[key]));
        };
    },
    getData: function(dataValue){
        var dataArray = [].concat(dataValue);
        for(var i = 0; i < dataArray.length; i++){
            if(this.displayNames[dataArray[i]]){
                dataArray[i] = this.displayNames[dataArray[i]];
            };
        };
        return dataArray.toString();
    }
};

var infoToolTip = function(options){
    options = options || {};
    this.defOptions = {
        container: 'body',
        template: '<div class="info-tooltip-container"></div>',
        showDelay: 500,
        autoHide: false,
        hiddenClassName: 'tooltip-hidden',
        dragClassName: 'jsplumb-drag'
    };
    this.options = $.extend({},this.defOptions);

    this.setOptions(options);

    if(!this.options.container){
        this.consoleInfo('配置参数有误');
        return;
    };
    this.initInfoToolTip();
};

infoToolTip.prototype = {
    optionsCheck:{
        container: setter.setDom,
        template: setter.setString,
        showDelay: setter.setNumber,
        autoHide: setter.setBool
    },
    observerConfig: {
        attributes: true,
        childList: false,
        characterData: false
    },
    setOptions: function(options){
        for(var key in this.optionsCheck){
            this.options[key] = this.optionsCheck[key](options[key]) === null ? this.optionsCheck[key](this.options[key]) : this.optionsCheck[key](options[key]);
        };
        this.logicalCheck();
    },
    logicalCheck: function(){
        if(this.options.container.tagName != 'BODY' && this.options.container.tagName != 'HTML' && $(this.options.container).css('position') != 'absolute' && $(this.options.container).css('position') != 'relative'){
            this.consoleInfo('容器的样式可能导致 tooltip 定位不准。');
        };
    },
    initInfoToolTip: function(){
        this.container = $(this.options.container);
        this.element = $(this.options.template).addClass(this.options.hiddenClassName);
        this.container.append(this.element);
        this.showDelayTimer = null;
        this.targetScale  = 1;
        this.onMoving = false;
        this.elementPosition = {
            left: 0,
            top: 0
        };
        this.targetPrevPosition = {
            left: 0,
            top: 0
        };
    },
    render: function(){
        return this.element;
    },
    showToolTip: function(){
        this.element.removeClass(this.options.hiddenClassName);
    },
    hideToolTip: function(){
        this.element.addClass(this.options.hiddenClassName);
    },
    observeTargetElement: function(){
        if(this.observer && this.onMoving){
            return;
        }else if(this.observer){
            this.stopObserveTargetElement();
        }
        var thisInfoToolTip = this;
        
        this.observer = new MutationObserver(function(mutations) {
            if(mutations[0].attributeName == 'class'){
                if(mutations[0].target.className.indexOf(thisInfoToolTip.options.dragClassName) != -1){
                    thisInfoToolTip.onMoving = true;
                    thisInfoToolTip.hide();
                }else{
                    thisInfoToolTip.onMoving = false;
                }
            }
        });
        this.observer.observe(this.triggerElement[0], this.observerConfig);
    },
    stopObserveTargetElement: function(){
        this.observer.disconnect();
        this.observer = null;
        delete this.observer;
    },
    setTargetScale: function(number){
        if(setter.setNumber(number) === null){
            this.consoleInfo('缩放比例传入参数有误。');
        }else{
            this.targetScale = number;
        };
    },
    show: function(triggerElement){
        if(this.showDelayTimer){
            clearTimeout(this.showDelayTimer);
        }
        if(this.onMoving){
            return;
        }
        this.triggerElement = triggerElement;
        this.showDelayTimer = setTimeout($.proxy(function(){
            this.setStyle(this.getCssObj(this.getPosition(this.triggerElement)));
            this.showToolTip();
        },this),this.options.showDelay);
        
        if(this.options.autoHide){
            this.observeTargetElement();
        }
    },
    hide: function(){
        if(this.showDelayTimer){
            clearTimeout(this.showDelayTimer);
        }
        
        if(!this.onMoving && this.observer){
            this.stopObserveTargetElement();
        }
        
        this.hideToolTip();
    },
    setStyle: function(cssObj){
        this.element.css(cssObj);
    },
    getCssObj: function(position){
        return {
            left: position.left + 'px',
            top: position.top + 'px'
        };
    },
    getPosition: function(srcTarget){
        var left = 0,
            top = 0,
            srcStyle = this.getStyle(srcTarget, this.targetScale),
            windowStyle = this.getWindowStyle(),
            containerStyle = this.getContainerStyle(),
            elementStyle = this.getElementStyle();

        var containerDistances = {
            top: srcStyle.top - containerStyle.top,
            right: containerStyle.left + containerStyle.width - srcStyle.left - srcStyle.width,
            bottom: containerStyle.top + containerStyle.height - srcStyle.top - srcStyle.height,
            left: srcStyle.left - containerStyle.left
        };
        var windowDistances = {
            top: srcStyle.top - windowStyle.scrollTop,
            right: windowStyle.width - srcStyle.left - srcStyle.width,
            bottom: windowStyle.height + windowStyle.scrollTop - srcStyle.top - srcStyle.height,
            left: srcStyle.left
        };
        var distances = {
            top: Math.min(containerDistances.top, windowDistances.top),
            right: Math.min(containerDistances.right, windowDistances.right),
            bottom: Math.min(containerDistances.bottom, windowDistances.bottom),
            left: Math.min(containerDistances.left, windowDistances.left)
        };

        if(distances.right >= elementStyle.width){
            left = containerDistances.left + srcStyle.width;
            top = containerDistances.top + srcStyle.height/2 - elementStyle.height/2;
            if(elementStyle.height/2 > (distances.bottom + srcStyle.height/2)){
                top -= (elementStyle.height/2 - distances.bottom - srcStyle.height/2);
                if(top < 0){
                    top = 0;
                };
            }
            if(elementStyle.height/2 > (distances.top + srcStyle.height/2)){
                top += elementStyle.height/2 - distances.top - srcStyle.height/2;
            }
        }else{
            left = containerDistances.left + srcStyle.width/2 - elementStyle.width/2;
            if(distances.right + srcStyle.width/2 < elementStyle.width/2){
                left += (distances.right + srcStyle.width/2 - elementStyle.width/2);
            }
            top = containerDistances.top + srcStyle.height;
            if( elementStyle.height > distances.bottom){
                top = containerDistances.top - elementStyle.height;
            }
        }

        return{
            left: left,
            top: top
        };
    },
    getStyle: function(element, elementScale){
        var scale = elementScale || 1;
        return $.extend({
            width: element.outerWidth() * scale,
            height: element.outerHeight() * scale,
        },element.offset());
    },
    getElementStyle: function(){
        return {
            width: this.element.outerWidth(true),
            height: this.element.outerHeight(true)
        };
    },
    getContainerStyle: function(){
        return $.extend({
            width: this.container.outerWidth(),
            height: this.container.outerHeight(),
        },this.container.offset());
    },
    getWindowStyle: function(){
        return {
            width: $(window).width(),
            height: $(window).height(),
            scrollTop: $(window).scrollTop()
        };
    },
    consoleInfo: function(msg){
        if(console && console.info){
            console.info(msg);
        };
    }
};
