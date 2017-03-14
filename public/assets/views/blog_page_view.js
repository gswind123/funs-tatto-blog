/**
 * 内容页面
 * Created by yw_sun on 2017/02/01
 */

(function() {

function BlogPageView(blogId) {
    this._blogId = blogId;
    this._viewModel = {};
    if(!blogId) {
        LogUtil.e("empty blog id");
    }
    if(window.jQuery) {
        var $element = $(
            "<div class='blog-page-container'>" +
            "   <div class='blog-page-content'>" +
            "       <div class='blog-page-title-img-note'>" +
            "           <span class='blog-page-title-img-note-left'></span>" +
            "           <span class='blog-page-title-img-note-right'></span>" +
            "       </div>" +
            "       <div class='blog-page-content-main'>" +
            "           <h1 class='blog-page-content-title'></h1>" +
            "           <p class='blog-page-content-author'></p> " +
            "           <span class='blog-page-content-text-img'></span>" +
            "       </div>" +
            "   </div>" +
            "</div>");
        var funsTitleBar = (new window.FunsTitleBar())
            .setLeftBtnImg('./assets/images/funs-left-arrow.png')
            .setTitle("").setRightBtnShow(false);
        $element.append(funsTitleBar.getHTMLNode());
        var funsTitleImage = (new window.FunsBlogTitleImage()).setTagVisible(false);
        var $content = $element.find('.blog-page-content');
        $content.prepend(funsTitleImage.getHTMLNode());
        this._$ele = $element;
        this._$content = $content;
        this._$titleImg = $element.find('.blog-title-img');
        this._titleBar = funsTitleBar;
        this._titleImage = funsTitleImage;
        this._$titleImageNoteLeft = $element.find('.blog-page-title-img-note-left');
        this._$titleImageNoteRight = $element.find('.blog-page-title-img-note-right');
        this._$contentTitle = $element.find('.blog-page-content-title');
        this._$contentAuthor = $element.find('.blog-page-content-author');
        this._$contentTextImg = $element.find('.blog-page-content-text-img');
    } else {
        LogUtil.e('jQuery not support');
    }
}
BlogPageView.prototype.setViewModel = function(serviceModel) {
    this._viewModel.isDataValid = (serviceModel.result === 0);
    this._viewModel.data = serviceModel.data;
    BlogPageView_updateWithViewModel.call(this);
};
BlogPageView.prototype.getHTMLNode = function() {
    return this._$ele.get(0);
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

function BlogPageView_updateWithViewModel() {
    var viewModel = this._viewModel;
    if(viewModel.isDataValid) {
        var data = viewModel.data;
        this._titleImage.setTitleImage(data.imgSrc);
        this._$titleImageNoteLeft.html(FormatUtil.str2html(data.imgFooterLeft));
        this._$titleImageNoteRight.html(FormatUtil.str2html(data.imgFooterRight));
        this._$contentTitle.html(FormatUtil.str2html(data.title));
        this._$contentAuthor.html(FormatUtil.str2html(data.author));
        this._$contentTextImg.empty();//清除缓存的正文内容，重新添加
        // this._$contentTextImg.append("<br />");
        var blogContent = data.content;
        var length = blogContent.length;
        var temp = null;
        var $temp = null;
        for (var i = 0; i < length; i++) {
            temp = blogContent[i];
            if (temp.type === "text") {
                $temp = $("<p class='blog-page-content-text'></p>");
                $temp && $temp.append(FormatUtil.str2html(temp.data));
                this._$contentTextImg.append($temp);
            } else if (temp.type === "subtitle1") {
                $temp = $("<p class='blog-page-content-subtitle1'></p>");
                $temp && $temp.append(FormatUtil.str2html(temp.data));
                this._$contentTextImg.append($temp);
            } else if (temp.type === "subtitle2") {
                $temp = $("<p class='blog-page-content-subtitle2'></p>");
                $temp && $temp.append(FormatUtil.str2html(temp.data));
                this._$contentTextImg.append($temp);
            } else if (temp.type === "imgFootnote") {
                $temp = $("<p class='blog-page-content-imgFootnote'></p>");
                $temp && $temp.append(FormatUtil.str2html(temp.data));
                this._$contentTextImg.append($temp);
            } else if (temp.type === "img") {
                $temp = $("<img class='blog-page-content-img'></img>");
                $temp && $temp.attr('src', temp.data);
                this._$contentTextImg.append($temp);
            } else {
                LogUtil.e('后台数据类型错误！');
            }
            temp = null;
            $temp = null;
        }
    } else {
        alert("data invalid"); //TODO by yw_sun
    }
}

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
