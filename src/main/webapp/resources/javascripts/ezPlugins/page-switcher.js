/*
 *
 * Copyright (c) 2015 EBo (https://github.com/E-Bo)
 *
 * Version 0.1
 *
 * Work with animate.css (https://github.com/daneden/animate.css)
 *
 */

var pageSwitcher = function(option){
    this.pages = option.pages;
    this.animation = option.animation || 'bounce';
    this.inDirection = option.inDirection || 'Right';
    this.outDirection = option.outDirection || 'Left';
    this.currentPageIndex = option.currentPageIndex || 0;

    this.shownClass = 'on-shown';
    this.pageCount = this.pages.length;

    this.classNames = {
        next: {
            show: this.animation + 'In' + this.inDirection,
            hide: this.animation + 'Out' + this.outDirection
        },
        prev:{
            show: this.animation + 'In' + this.outDirection,
            hide: this.animation + 'Out' + this.inDirection
        },
        shown: this.shownClass
    }
};

pageSwitcher.prototype = {
    initPage: function(){
        this.pages.on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', this.classNames ,this.afterAnimation);
        $(this.pages[this.currentPageIndex]).addClass(this.shownClass);
    },
    afterAnimation: function(event){
        if($(this).hasClass(event.data.next.hide) || $(this).hasClass(event.data.prev.hide)){
            $(this).removeClass(event.data.shown + ' ' + event.data.next.hide + ' ' + event.data.prev.hide);
        }else{
            $(this).removeClass(event.data.next.show + ' ' + event.data.prev.show);
        }
    },
    nextPage: function(){
        $(this.pages[this.currentPageIndex]).addClass(this.classNames.next.hide);
        $(this.pages[this.getNextIndex()]).addClass(this.shownClass + ' ' + this.classNames.next.show);
        this.currentPageIndex = this.getNextIndex();
    },
    prevPage: function(){
        $(this.pages[this.currentPageIndex]).addClass(this.classNames.prev.hide);
        $(this.pages[this.getPrevIndex()]).addClass(this.shownClass + ' ' + this.classNames.prev.show);
        this.currentPageIndex = this.getPrevIndex();
    },
    getNextIndex: function(){
        var _next = this.currentPageIndex + 1;
        if(_next >= this.pageCount){
            _next = 0;
        }
        return _next;
    },
    getPrevIndex: function(){
        var _prev = this.currentPageIndex - 1;
        if(_prev < 0){
            _prev = this.pageCount - 1;
        }
        return _prev;
    }
};