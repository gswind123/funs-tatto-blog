/**
 * 内容页面
 * Created by yw_sun on 2017/02/01
 */

(function() {

function BlogPageView() {
    if(window.jQuery) {
        var $element = $(
            "<div class='blog-page'>" +
            "   <div></div>" +
            "</div>");
        this._$ele = $element;
    } else {
        LogUtil.e('jQuery not support');
    }
}

BlogPageView.prototype.getHTMLNode = function() {
    return this._$ele;
};

var nodeProvider = {
    getNode : function(savedInstance) {
        if(savedInstance) {
            return savedInstance;
        } else {
            return new BlogPageView();
        }
    }
};

BlogPageView.getProvider = function() {
    return nodeProvider;
};

window.BlogPageView = BlogPageView;

})();
