/**
 * Created by yw_sun
 *
 * @NOTE:require("jquery")
 */

function onIndexPageItemClick(indexPageItem) {
    PageManager.jumpToPage("blog_page", {
        content:"博客内容"
    });
}

function IndexPageItem() {
    if(window.jQuery) {
        var $ = window.jQuery;

        var $element = $(
            "<div class='swipe-vertical-wrap-item index-page'>" +
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
        this._$indexImg = $element.find(".index-img");
        this._$indexImgFooter = $element.find('.index-img-footer-tag');
        this._$indexTitle = $element.find(".index-title");
        this._$indexDesc = $element.find(".index-desc");
        /** 设置跳转点击事件 */
        var self = this;
        window.MotionUtil.addOnClickListener($element.get(0), function() {
            onIndexPageItemClick(self);
        });
    } else {
        LogUtil.e("jQuery not support!");
    }
}

function convertStrToHTML(str) {
    return str.replace('\n', '<br />');
}

IndexPageItem.prototype.getHTMLNode = function() {
    return this._$ele.get(0);
};
IndexPageItem.prototype.setImgSrc = function(url) {
    this._$indexImg.attr('src', url);
    return this;
};
IndexPageItem.prototype.setTitle = function(title) {
    this._$indexTitle.html(convertStrToHTML(title));
    return this;
};
IndexPageItem.prototype.setDesc = function(desc) {
    this._$indexDesc.html(convertStrToHTML(desc));
    return this;
};
IndexPageItem.prototype.setImgFooter = function(text) {
    this._$indexImgFooter.html(convertStrToHTML(text));
    return this;
};

function IndexPageSwipe() {
    this._viewModel = {
        data : [],
        error : ''
    };
    if(window.jQuery) {
        var $ = window.jQuery;
        this._$ele = $(
            "<div id='page_container' class='swipe-vertical'>" +
            "   <div id='pages' class='swipe-vertical-wrap'>" +
            "   </div>" +
            "</div>");
        this._$pages = this._$ele.find('#pages');
    } else {
        LogUtil.e("jQuery not support!");
    }
}

/**
 * 得到IndexPageView的HTML节点
 */
IndexPageSwipe.prototype.getHTMLNode = function() {
    return this._$ele.get(0);
};

/**
 * 根据服务下发的数据,更新ViewModel
 * @param serviceModel 服务下发的index_page数据
 */
IndexPageSwipe.prototype.setViewModel = function(serviceModel) {
    if(serviceModel.result === 0) { //服务成功
        this._viewModel.data = serviceModel.data;
        this._viewModel.error = '';
    } else {
        this._viewModel.error = "服务器正在更新\n请稍候刷新页面";
    }
    //根据新ViewModel情况更新DOM
    IndexPageSwipe_update.call(this);
};

/**
 * 设置非服务端错误到ViewModel
 * @param error 前端错误
 */
IndexPageSwipe.prototype.notifyError = function(error) {
    this._viewModel.error = error;
};

//private
function IndexPageSwipe_update() {
    this._$pages.html('');
    /** 刷新View数据 */
    var viewModel = this._viewModel;
    if(viewModel.error) {
        this._$pages.append((new IndexPageItem()).setTitle(viewModel.error).getHTMLNode());
    } else {
        var dataAry = viewModel.data;
        for(var i=0; i<dataAry.length; i++) {
            var dataItem = dataAry[i];
            var viewItem = new IndexPageItem();
            viewItem.setTitle(dataItem.title)
                .setImgSrc(dataItem.imgSrc)
                .setDesc(dataItem.desc)
                .setImgFooter(dataItem.imgFooter);
            this._$pages.append(viewItem.getHTMLNode());
        }
    }
    /** 更新swipe状态 */
    var pageContainer = this._$ele.get(0);
    pageContainer.setAttribute("style",window.innerHeight+"px");

    this._swipe = new Swipe(pageContainer,{
        startSlide: 0,
        speed: 400,
        autoStart:false,
        orientation:"vertical",
        auto: 0,
        draggable: true,
        continuous: false,
        disableScroll: true,
        stopPropagation: false,
        slideHeight : window.innerHeight
    });
};

/**
 * @param resolve function(serviceData)
 * @param reject function(error)
 */
 function sendIndexDataSearch(resolve, reject) {
    var $ = window.jQuery;
    $.ajax({
        url : '../index_data',
        type : 'POST',
        dataType : 'json',
        success : function(serviceData) {
            resolve(serviceData);
        },
        error: function(err) {
            reject("当前浏览器\n不支持本页面");
        }
    });
};

function IndexPageView() {
    if(window.jQuery) {
        var $ = window.jQuery;
        this._$ele = $(
            "<div class='index-page-view-container'>" +
            "   <div id='page_body'></div>" +
            "   <div class='index-page-title-bar vertical-black-gradient'></div>" +
            "</div>");
        this._$pageBody = this._$ele.find('#page_body');
    } else {
        LogUtil.e("jQuery not support");
    }
}

IndexPageView.prototype.getHTMLNode = function() {
    return this._$ele.get(0);
};

var nodeProvider = {
    getNode:function(savedInstance) {
        if(savedInstance) {
            return savedInstance;
        }
        var indexPageView = new IndexPageView();
        var $pageBody = indexPageView._$pageBody;
        var indexPageSwipe = new IndexPageSwipe();
        $pageBody.append(indexPageSwipe.getHTMLNode());
        sendIndexDataSearch(function(serviceDatas){
            indexPageSwipe.setViewModel(serviceDatas);
        },function() {
            indexPageSwipe.notifyError("服务器正在维护\n请稍候重试");
        });
        return indexPageView.getHTMLNode();
    },

    getEnterAnimation : function(pageName, isNewPage) {
        if(isNewPage) {
            return PageManager.animLeftInAdd;
        } else {
            return PageManager.animRightInAdd;
        }
    },

    getExitAnimation : function(pageName, isNewPage) {
        if(isNewPage) {
            return PageManager.animRightOutRemove;
        } else {
            return PageManager.animLeftOutRemove;
        }
    }
};

IndexPageView.getProvider = function() {
    return nodeProvider;
};

window.IndexPageView = IndexPageView;
