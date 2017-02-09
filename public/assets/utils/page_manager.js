/**
 * 页面跳转管理器
 * require('jquery.min.js')
 * require('director.min.js')
 * require('utils/common_util.js');
 * Created by yw_sun on 2017/01/31
 *
 * 如何使用:
 * 1. 初始化一个PageManager实例mgr
 * 2. 调用mgr.register(pageName, NodeProvider)
 * 3. 执行mgr.init()
 * 4. 当url发生变化,或者调用PageManager#jumpToPage时,如果页面名字已经注册,则前端路由到对应页面
 *
 * 关于NodeProvider:
 * 当注册一个页面时,需要提供一个NodeProvider
 *
 *  NodeProvider#getNode(prevNode, param)
 *      根据上一次的Node实例和页面参数,生成一个页面实例
 *      这个方法用来更新Node,如果是通过PageManager#jumpToPage跳转,则param为其所带的参数param
 *      如果是新生成一个页面,则prevNode为空
 *
 *  关于Node :
 *      Node必须提供一个getHTMLNode方法,用来返回渲染页面的额DOM;
 *      当切换到一个node时,会调用它的onAttach方法;
 *      当一个node被从返回栈清除时,会调用它的onDetach方法;
 *      通过定制Node,可以存储一些页面状态
 *
 *  NodeProvider#getEnterAnimation(prevPageName, isNewPage)
 *
 *  NodeProvider#getExitAnimation(prevPageName, isNewPage)
 *
 *  关于Animation:
 *      function($curNode, container, Node)
 *      curNode为当前页面的HTML DOM, container为页面容器, Node为页面的Node对象
 */

(function() {

/**
 * @param container 进行页面切换效果的DOM
 * @param options 配置参数
 * {
 *    defaultPage : <pageName>, //当路径匹配不到时默认跳转到的页面
 * }
 */
function PageManager(container, options) {
    this._container = container;
    this._options = options || {};

    /**========================
     this._backStack = [
          {
            pageName : 'page1',
            prevNode : <Node>,
            provider : <NodeProvider>
          }
      ]
     ========================*/
    this._backStack = [];

    /**========================
     this._pageProviderMap = {
        pageName : nodeProvider
     }
     ========================*/
    this._pageProviderMap = {};
}

/**
 * 注册一个页面的实例生成器,以备跳转到这个页面时使用
 * @param pageName
 * @param nodeProvider
 *
 *     getNode(prevInstance, param) 返回一个Node,表示pageName对应的页面内容
 *     Node应当具备一个getHTMLNode方法,用来生成用渲染视图的html DOM
 *     参数prevInstance,为上次已经生成了的这个页面的HTML节点;如果页面实例还没生成过,则为null
 *     参数param,为本次跳转时带的参数
 *
 *     getEnterAnimation(pageName, isNewPage) return function($obj, $container, node) 用上一个页面的pageName生成进入动画,
 *     isNewPage表示本次动作是否要跳转到一个新页面,如果是false,则意味着本次跳转是回到一个旧页面
 *
 *     getExitAnimation(pageName, isNewPage) return function($obj, $container, node) 用下一个页面的pageName生成退出动画,
 *     isNewPage表示本次动作是否要跳转到一个新页面,如果是false,则意味着本次跳转是回到一个旧页面
 *
 *
 */
PageManager.prototype.register = function (pageName, nodeProvider) {
    this._pageProviderMap[pageName] = nodeProvider;
};

function PageManager_getPageOnTop() {
    var length = this._backStack.length;
    if (!length) {
        return null;
    } else {
        return this._backStack[length - 1];
    }
}

//private
function PageManager_popPageFromStack(pageName) {
    var backStack = this._backStack;
    var targetItem, index;
    for (var i = backStack.length - 1; i >= 0; i--) {
        var item = backStack[i];
        if (item.pageName === pageName) {
            index = i;
            targetItem = item;
            break;
        }
    }
    /** 没有找到需要的页面,返回空 */
    if (!targetItem) {
        return null;
    } else { /** 将需要的页面弹出栈,返回目标页面的后退栈节点 */
        for (var i = index + 1; i < backStack.length; i++) {
            var prevNode = backStack[i].prevNode;
            if (prevNode.onDetach) {
                prevNode.onDetach();
            }
        }
        backStack.length = index + 1;
        return targetItem;
    }
}

/**
 * 验证一个Node是否合法
 * 只有具备getHTMLNode方法,才是一个合法Node
 * @return true 合法 | false 不合法
 */
function isValidNode(pageName, node) {
    if (!node.getHTMLNode) {
        LogUtil.e({
            error: "Node from [getNode] should support [getHTMLNode] in switchPageAnim",
            cls: "PageManager",
            pageName: pageName
        });
        return false;
    }
    return true;
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
    if (!nodeProvider || !nodeProvider.getNode || typeof(nodeProvider.getNode) !== 'function') {
        //页面未注册,不跳转
        return;
    }
    var prevTop = PageManager_getPageOnTop.call(this);
    var prevProvider = null;
    var prevPageName = null;
    var prevPageNode = null;
    if (prevTop) {
        prevProvider = prevTop.provider;
        prevPageName = prevTop.pageName;
        prevPageNode = prevTop.prevNode;
    }

    var targetItem = PageManager_popPageFromStack.call(this, pageName);
    var isNeedAnim, isNewPage, enterAnimation, exitAnimation, newPageNode;
    if (!targetItem) { //原页面不存在,创建一个新的插入后退栈,并跳转
        var node = nodeProvider.getNode(null, param);
        if (!isValidNode(pageName, node)) {
            return;
        }
        var stackItem = {
            pageName: pageName,
            prevNode: node,
            provider: nodeProvider
        };
        this._backStack.push(stackItem);
        newPageNode = stackItem.prevNode;
        isNeedAnim = !!prevTop; //如果原先已经有个页面,则需要切换动画
        isNewPage = true;
    } else { //原页面存在,更新并返回到原页面
        newPageNode = nodeProvider.getNode(targetItem.prevNode, param);
        if (!isValidNode(targetItem.pageName, newPageNode)) {
            return;
        }
        isNeedAnim = (targetItem != prevTop); //如果需要移除原先的页面,则需要切换动画
        isNewPage = false;
        targetItem.prevNode = newPageNode;
    }
    if (nodeProvider.getEnterAnimation) {
        enterAnimation = nodeProvider.getEnterAnimation(prevPageName, isNewPage);
    }
    if (prevProvider && prevProvider.getExitAnimation) {
        exitAnimation = prevProvider.getExitAnimation(pageName, isNewPage);
    }
    if (newPageNode.onAttach) {
        newPageNode.onAttach();
    }
    switchPageAnim(this._container, prevPageNode, newPageNode, isNeedAnim, isNewPage,
        enterAnimation, exitAnimation);
};

var AnimDuration = 333;
var AnimInterpolate = 'swing';

PageManager.animLeftOutRemove = function ($obj, $container, node) {
    var container = $container.get(0);
    $obj.css({
        position: 'absolute',
        left: '0px',
        width: container.offsetWidth + "px",
        height: container.offsetHeight + "px"
    });
    $obj.animate({
        left: -container.offsetWidth + "px"
    }, AnimDuration, AnimInterpolate, function () {
        $obj.remove();
    });
};
PageManager.animRightOutRemove = function ($obj, $container, node) {
    var container = $container.get(0);
    $obj.css({
        position: 'absolute',
        left: '0px',
        width: container.offsetWidth + "px",
        height: container.offsetHeight + "px"
    });
    $obj.animate({
        left: container.offsetWidth + "px"
    }, AnimDuration, AnimInterpolate, function () {
        $obj.remove();
    });
};
PageManager.animRightInAdd = function ($obj, $container, node) {
    var container = $container.get(0);
    $obj.css({
        position: 'absolute',
        left: container.offsetWidth + "px",
        width: container.offsetWidth + "px",
        height: container.offsetHeight + "px"
    });
    $container.append($obj);
    $obj.animate({
        left: '0px'
    }, AnimDuration, AnimInterpolate);
};
PageManager.animLeftInAdd = function ($obj, $container, node) {
    var container = $container.get(0);
    $obj.css({
        position: 'absolute',
        left: -container.offsetWidth + "px",
        width: container.offsetWidth + "px",
        height: container.offsetHeight + "px"
    });
    $container.append($obj);
    $obj.animate({
        left: '0px'
    }, AnimDuration, AnimInterpolate);
};

PageManager.AnimDuration = AnimDuration;

/**
 * @param prevPageNode 被移除页面的Node
 * @param newPageNode 被添加页面的Node
 * @param isNeedAnim 是否需要动画
 * @param isNewPage 本次切换是否是打开新页面(否则是回到旧页面)
 * @param enterAnimation 进入动画函数
 * @param exitAnimation 退出动画函数
 */
function switchPageAnim(container, prevPageNode, newPageNode, isNeedAnim, isNewPage, enterAnimation, exitAnimation) {
    if (!enterAnimation) {
        enterAnimation = isNewPage ? PageManager.animRightInAdd : PageManager.animLeftInAdd;
    }
    if (!exitAnimation) {
        exitAnimation = exitAnimation || isNewPage ? PageManager.animLeftOutRemove : PageManager.animRightOutRemove;
    }
    var $ = window.jQuery;
    var $container = $(container);
    var $removePage = $container.children('div');
    var $addPage = $('<div></div>').append(newPageNode.getHTMLNode());
    if (isNeedAnim) {
        enterAnimation($addPage, $container, newPageNode);
        exitAnimation($removePage, $container, prevPageNode);
    } else {
        $addPage.css({
            position: 'absolute',
            left: '0px',
            width: container.offsetWidth + "px",
            height: container.offsetHeight + "px"
        });
        $container.append($addPage);
    }
}

function genDirectorURL4Jump(pageName, param) {
    var url = "#" + pageName;
    var paramStr = "";
    try {
        paramStr = JSON.stringify(param);
    } catch (e) {
    }
    if (paramStr) {
        url += "?param=" + encodeURI(paramStr);
    }
    return url;
}

/**
 * 当所有页面注册工作结束后,调用init方法应用路由表
 */
PageManager.prototype.init = function () {
    this._container.innerHTML = '';
    var providerMap = this._pageProviderMap;
    var self = this;
    var routeMap = {
        ":pageName": function (pageName) {
            var param = URLUtil.getQueryParam("param");
            var defaultPage = self._options.defaultPage;
            if (providerMap[pageName]) {
                PageManager_jump.call(self, pageName, param);
            } else if (defaultPage) {
                if (providerMap[defaultPage]) {
                    PageManager_jump.call(self, defaultPage);
                }
            }
        }
    };
    this._router = new Router(routeMap);
    this._router.configure({
        notfound: function () {
            var defaultPage = self._options.defaultPage;
            if (providerMap[defaultPage]) {
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
PageManager.jumpToPage = function (pageName, param) {
    window.history.pushState(null, null, window.location.href);
    window.location.href = genDirectorURL4Jump(pageName, param);
};

window.PageManager = PageManager;


})();
