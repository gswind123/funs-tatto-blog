/**
 * 各页面使用的公共控件
 * Created by yw_sun on 2017/02/06
 */


(function() {

/**
 * 页面顶部导航栏
 */
function FunsTitleBar() {
    if(window.jQuery) {
        var $ = window.jQuery;
        var $element = $(
            "<div class='funs-title-bar'>" +
            "   <div class='funs-title-bar-bkg vertical-black-gradient'></div>" +
            "   <div class='funs-title-bar-text-container'>" +
            "       <span class='funs-title-bar-text'></span>" +
            "   </div>" +
            "   <div class='funs-title-bar-left-btn'>" +
            "       <img class='funs-title-bar-left-btn-img'></img>" +
            "   </div>" +
            "   <div class='funs-title-bar-right-btn'>" +
            "       <img class='funs-title-bar-right-btn-img'></img>" +
            "   </div>" +
            "</div>");
        this._$text = $element.find('.funs-title-bar-text');
        this._$leftBtnImg = $element.find('.funs-title-bar-left-btn-img');
        this._$rightBtnImg = $element.find('.funs-title-bar-right-btn-img');
        this._$ele = $element;
    } else {
        LogUtil.e("jQuery not support!");
    }
}

FunsTitleBar.prototype.setTitle = function(title) {
    this._$text.html(title);
    return this;
};
FunsTitleBar.prototype.setLeftBtnImg = function(url) {
    this._$leftBtnImg.attr('src', url);
    return this;
};
FunsTitleBar.prototype.setRightBtnImg = function(url) {
    this._$rightBtnImg.attr('src', url);
    return this;
};
FunsTitleBar.prototype.setLeftBtnShow = function(isShow) {
    if(isShow) {
        this._$leftBtnImg.removeClass('hidden');
    } else {
        this._$leftBtnImg.addClass('hidden');
    }
    return this;
};
FunsTitleBar.prototype.setRightBtnShow = function(isShow) {
    if(isShow) {
        this._$rightBtnImg.removeClass('hidden');
    } else {
        this._$rightBtnImg.addClass('hidden');
    }
    return this;
};

FunsTitleBar.prototype.getHTMLNode = function() {
    return this._$ele.get(0);
};

window.FunsTitleBar = FunsTitleBar;

})();
