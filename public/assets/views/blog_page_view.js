/**
 * 内容页面
 * Created by yw_sun on 2017/02/01
 */

(function() {

function BlogPageView(blogId) {
    this._blogId = blogId;
    if(!blogId) {
        LogUtil.e("empty blog id");
    }
    if(window.jQuery) {
        var $element = $(
            "<div class='blog-page-container'>" +
            "   <div class='blog-page-content'></div>" +
            "</div>");
        var funsTitleBar = new window.FunsTitleBar();
        funsTitleBar.setLeftBtnImg('./assets/images/funs-left-arrow.png')
            .setTitle("").setRightBtnShow(false);
        $element.append(funsTitleBar.getHTMLNode());
        this._$ele = $element;

    } else {
        LogUtil.e('jQuery not support');
    }
}
BlogPageView.prototype.setViewModel = function(serviceModel) {
    console.log(JSON.stringify(serviceModel));
};

BlogPageView.prototype.getHTMLNode = function() {
    return this._$ele;
};
BlogPageView.prototype.onAttach = function() {
    var self = this;
    if(this._blogId) {
        var $ = window.jQuery;
        this._contentXhr = $.ajax({
            type : "POST",
            url : "../blog_content_search",
            contentType : "application/json",
            data : JSON.stringify({
                id : this._blogId
            }),
            success : function(data) {
                self.setViewModel(data);
            },
            error : function(err) {
                //显示错误信息
                LogUtil.e(JSON.stringify(err));
            },
            complete : function(data, xhr) {
                self._contentXhr = null;
            }
        });
    } else {
        //显示错误信息
        LogUtil.e('empty blog id');
    }
};
BlogPageView.prototype.onDetach = function() {
    /** 取消正在发送的服务 */
    if(this._contentXhr) {
        this._contentXhr.abort();
        this._contentXhr = null;
    }
};

var nodeProvider = {
    /**
     * @param param
     *      {
     *          blogId : 1000
     *      }
     */
    getNode : function(savedInstance, param) {
        if(savedInstance) {
            return savedInstance;
        } else {
            return new BlogPageView(param && param.blogId);
        }
    }
};

BlogPageView.getProvider = function() {
    return nodeProvider;
};

window.BlogPageView = BlogPageView;

})();
