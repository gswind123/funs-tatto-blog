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


/**
 * 索引页和内容页的标题图片区域
 */
function FunsBlogTitleImage() {
    if(window.jQuery) {
        var $ = window.jQuery;
        var $element = $(
            "<div style=''>" +
            "   <div class='index-img-container'>" +
            "       <img class='index-img'></img>" +
            "   </div>" +
            "   <div class='index-img-footer'>" +
            "       <div class='index-img-footer-line'></div>" +
            "       <span class='index-img-footer-tag'></span>" +
            "   </div>" +
            "</div>");
        this._$titleImg = $element.find('.index-img');
        this._$footerTag = $element.find('.index-img-footer-tag');
        this._$footerLine = $element.find('.index-img-footer-line');
        this._$ele = $element;
    } else {
        LogUtil.e("jQuery not support!");
    }
}
FunsBlogTitleImage.prototype.setTitleImage = function(url) {
    var $img = this._$titleImg;
    $img && $img.attr('src', url);
    return this;
};
FunsBlogTitleImage.prototype.setFooterTag = function(tagText) {
    var $tag = this._$footerTag;
    $tag && $tag.html(FormatUtil.str2html(tagText));
    return this;
};
FunsBlogTitleImage.prototype.getHTMLNode = function() {
    return this._$ele && this._$ele.get(0);
};
FunsBlogTitleImage.prototype.setTagVisible = function(isVisible) {
    if(this._$footerTag) {
        if(!!isVisible) {
            this._$footerTag.show();
        } else {
            this._$footerTag.hide();
        }
    }
    return this;
};
window.FunsBlogTitleImage = FunsBlogTitleImage;

})();
