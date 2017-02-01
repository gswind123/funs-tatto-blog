/**
 * 页面跳转管理器
 * require('jquery.min.js')
 * require('director.min.js')
 * require('utils/common_util.js');
 * Created by yw_sun on 2017/01/31
 */

/**
 * @param container 进行页面切换效果的DOM
 * @param options 配置参数
 * {
 *     defaultPage : <pageName>, //当路径匹配不到时默认跳转到的页面
 * }
 */
function PageManager(container, options) {
    this._container = container;
    this._options = options || {};

    /**
     * this._backStack = [
     *     {
     *         pageName : 'page1',
     *         node : <HTML Node>
     *     }
     * ]
     */
    this._backStack = [];

    /**
     * this._pageMap = {
     *     pageName : nodeProvider
     * }
     */
    this._pageProviderMap = {};
}

/**
 * 注册一个页面的实例生成器,以备跳转到这个页面时使用
 * @param pageName
 * @param nodeProvider :
 * function(prevInstance, param) 返回一个用来插入到容器中的HTML节点,表示pageName对应的页面内容
 * 参数prevInstance,为上次已经生成了的这个页面的HTML节点;如果页面实例还没生成过,则为null
 * 参数param,为本次跳转时带的参数
 */
PageManager.prototype.register = function(pageName, nodeProvider) {
    this._pageProviderMap[pageName] = nodeProvider;
};

function PageManager_getPageOnTop() {
    var length = this._backStack.length;
    if(!length) {
        return null;
    } else {
        return this._backStack[length - 1];
    }
}

//private
function PageManager_popPageFromStack(pageName) {
    var backStack = this._backStack;
    var targetItem,index;
    for(var i=backStack.length-1; i>=0; i--) {
        var item = backStack[i];
        if(item.pageName === pageName) {
            index = i;
            targetItem = item;
            break;
        }
    }
    /** 没有找到需要的页面,返回空 */
    if(!targetItem) {
        return null;
    } else { /** 将需要的页面弹出栈,返回目标页面的后退栈节点 */
        backStack.length = index+1;
        return targetItem;
    }
}

/**
 * 跳转到一个页面
 * 如果这个页面不存在在后退栈中,则创建新实例并将它加入栈;
 * 如果页面已经存在,则弹出后退栈直到弹出这个页面,并展示这个页面;
 * @see register
 * @param pageName 需要跳转到的页面名称,这个页面必须被注册过
 */
//private
function PageManager_jump(pageName, param) {
    var nodeProvider = this._pageProviderMap[pageName];
    if(!nodeProvider) {
        //页面未注册,不跳转
        return ;
    }
    var prevTop = PageManager_getPageOnTop.call(this);
    var targetItem = PageManager_popPageFromStack.call(this, pageName);
    if(!targetItem) { //原页面不存在,创建一个新的插入后退栈,并跳转
        var stackItem = {
            pageName : pageName,
            node : nodeProvider(null, param)
        };
        this._backStack.push(stackItem);
        var isNeedAnim = !!prevTop; //如果原先已经有个页面,则需要切换动画
        switchPageHorizontally(this._container, stackItem.node, isNeedAnim, "RIFO");
    } else { //原页面存在,更新并返回到原页面
        targetItem.node = nodeProvider(targetItem.node, param);
        var isNeedAnim = (targetItem != prevTop); //如果需要移除原先的页面,则需要切换动画
        switchPageHorizontally(this._container, targetItem.node, isNeedAnim, "LIRO");
    }
};

var AnimDuration = 500;
var AnimInterpolate = 'swing';

function animLeftOutRemove($obj, container) {
    $obj.css({
        position : 'absolute',
        left : '0px',
        width: container.offsetWidth + "px",
        height : container.offsetHeight + "px"
    });
    $obj.animate({
        left : -container.offsetWidth + "px"
    }, AnimDuration, AnimInterpolate, function(){
        $obj.remove();
    });
}
function animRightOutRemove($obj, container) {
    $obj.css({
        position : 'absolute',
        left : '0px',
        width: container.offsetWidth + "px",
        height : container.offsetHeight + "px"
    });
    $obj.animate({
        left : container.offsetWidth + "px"
    }, AnimDuration, AnimInterpolate, function(){
        $obj.remove();
    });
}
function animRightInAdd($obj, container) {
    $obj.css({
        position : 'absolute',
        left : container.offsetWidth + "px",
        width: container.offsetWidth + "px",
        height : container.offsetHeight + "px"
    });
    $(container).append($obj);
    $obj.animate({
        left : '0px'
    }, AnimDuration, AnimInterpolate);
}
function animLeftInAdd($obj, container) {
    $obj.css({
        position : 'absolute',
        left : -container.offsetWidth + "px",
        width: container.offsetWidth + "px",
        height : container.offsetHeight + "px"
    });
    $(container).append($obj);
    $obj.animate({
        left : '0px'
    }, AnimDuration, AnimInterpolate);
}

/**
 * @param direction LIRO 左进右出 | RILO 右进左出
 */
function switchPageHorizontally(container, newPageNode, isNeedAnim, direction) {
    var $ = window.jQuery;
    var $container = $(container);
    var $removePage = $container.children('div');
    var $addPage = $('<div></div>').append(newPageNode);
    if(isNeedAnim) {
        if(direction === "LIRO") {
            animLeftInAdd($addPage, container);
            animRightOutRemove($removePage, container);
        } else {
            animLeftOutRemove($removePage, container);
            animRightInAdd($addPage, container);
        }
    } else {
        $addPage.css({
            position : 'absolute',
            left : '0px',
            width: container.offsetWidth + "px",
            height : container.offsetHeight + "px"
        });
        $container.append($addPage);
    }
}

function genDirectorURL4Jump(pageName, param) {
    var url = "#"+pageName;
    var paramStr = "";
    try{
        paramStr = JSON.stringify(param);
    }catch(e){}
    if(paramStr) {
        url += "?param="+encodeURI(paramStr);
    }
    return url;
}

/**
 * 当所有页面注册工作结束后,调用init方法应用路由表
 */
PageManager.prototype.init = function() {
    this._container.innerHTML = '';
    var providerMap = this._pageProviderMap;
    var self = this;
    var routeMap = {
        ":pageName" : function(pageName) {
            var param = URLUtil.getQueryParam("param");
            var defaultPage = self._options.defaultPage;
            if(providerMap[pageName]) {
                PageManager_jump.call(self, pageName, param);
            } else if(defaultPage) {
                if(providerMap[defaultPage]) {
                    PageManager_jump.call(self, defaultPage);
                }
            }
        }
    };
    this._router = new Router(routeMap);
    this._router.configure({
        notfound: function() {
            var defaultPage = self._options.defaultPage;
            if(providerMap[defaultPage]) {
                PageManager_jump.call(self, defaultPage);
            }
        }
    });
    this._router.init();
};

/**
 * 跳转到一个页面,需要页面中存在一个已经执行了init的PageManager实例
 * @param pageName
 * @param param 跳转携带的参数,会传入相应页面的nodeProvider里
 */
PageManager.jumpToPage = function(pageName, param) {
    window.history.pushState(null, null, window.location.href);
    window.location.href = genDirectorURL4Jump(pageName, param);
};

window.PageManager = PageManager;
