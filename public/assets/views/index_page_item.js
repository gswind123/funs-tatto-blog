/**
 * Created by yw_sun
 *
 * @NOTE:require("jquery")
 */

function IndexPageItem() {
    if(window.jQuery) {
        var $ = window.jQuery;

        var $element = $(
            "<div class='swipe-vertical-wrap-item index-page'>" +
                "<div class='index-img-container'>" +
                    "<img class='index-img'></img>" +
                "</div>" +
                "<div class='index-img-footer'></div>" +
                "<div class='index-title'></div>" +
                "<div class='index-desc'></div>" +
                "<div class='index-div-line-container'>" +
                    "<div class='index-div-line'></div>" +
                "</div>" +
            "</div>");
        this._$ele = $element;
        this._$indexImg = $element.find(".index-img");
        this._$indexImgFooter = $element.find('.index-img-footer');
        this._$indexTitle = $element.find(".index-title");
        this._$indexDesc = $element.find(".index-desc");
    } else {
        LogUtil.e("jQuery not support!");
    }
}

IndexPageItem.prototype.getHTMLNode = function() {
    return this._$ele.get(0);
};
IndexPageItem.prototype.setImgSrc = function(url) {
    this._$indexImg.attr('src', url);
    return this;
};
IndexPageItem.prototype.setTitle = function(title) {
    this._$indexTitle.html(title);
    return this;
};
IndexPageItem.prototype.setDesc = function(desc) {
    this._$indexDesc.html(desc);
    return this;
};
IndexPageItem.prototype.setImgFooter = function(text) {
    this._$indexImgFooter.html(text);
    return this;
};

window.IndexPageItem = IndexPageItem;
