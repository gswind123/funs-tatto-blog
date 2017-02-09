/**
 * 提供高效率动画的工具类
 * Created by yw_sun on 2017/02/10
 */

(function(){

window.AnimationUtil = {
    /**
     * 以当前位置为起点,平滑移动一个dom节点
     * @param dom 需要移动的dom节点
     * @param x 水平移动的距离
     * @param y 垂直移动的距离
     * @param duration 动画时长
     */
    animTranslate : function(dom, x, y, duration) {
        var style = dom && dom.style;

        if (!style) return;

        style.webkitTransitionDuration =
            style.MozTransitionDuration =
                style.msTransitionDuration =
                    style.OTransitionDuration =
                        style.transitionDuration = duration + 'ms';

        style.webkitTransform = 'translate(' + x + 'px,' + y + 'px)' + 'translateZ(0)';
        style.msTransform =
            style.MozTransform =
                style.OTransform = 'translateX(' + x + 'px) translateY(' + y + 'px)';
    }
};

})();
