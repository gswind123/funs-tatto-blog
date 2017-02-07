/**
 * 内容页面
 * Created by yw_sun on 2017/02/01
 */

function BlogPageView() {
    if(window.jQuery) {
        var $element = $(
            "<div class='index-page'>" +
            "   <div class='index-img-container'>" +
            "       <img class='index-img'></img>" +
            "   </div>" +
            "   <div class='index-img-footer'>" +
            "       <div class='index-img-footer-line'></div>" +
            "       <span class='index-img-footer-tag'></span>" +
            "   </div>" +
            "   <div class='index-title'></div>" +
            "   <div class='index-desc'></div>" +
            "   <div class='index-div-line-container'>" +
            "       <div class='index-div-line'></div>" +
            "   </div>" +
            "</div>");
        this._$ele = $element;
    } else {
        LogUtil.e('jQuery not support');
    }

}

window.BlogPageView = BlogPageView;
