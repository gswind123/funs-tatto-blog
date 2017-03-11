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
        this._sendResult = Sender.post('blog_content_search', {
            id : this._blogId
        }, function(serviceData) { //success
            self.setViewModel(serviceData)
        }, function(err) { //error
            //显示错误信息
            LogUtil.e(JSON.stringify(err));
        }, function() { //final
            self._sendResult = null;
        });
    } else {
        //显示错误信息
        LogUtil.e('empty blog id');
    }
};
BlogPageView.prototype.onDetach = function() {
    /** 取消正在发送的服务 */
    if(this._sendResult) {
        this._sendResult.cancel();
        this._sendResult = null;
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
