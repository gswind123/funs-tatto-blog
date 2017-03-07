/**
 * 提供高效率动画的工具类
 * Created by yw_sun on 2017/02/10
 * require common_util.js
 */

(function(){

function style_setDuration(duration, timingFunc) {
    this.webkitTransitionDuration =
        this.MozTransitionDuration =
            this.msTransitionDuration =
                this.OTransitionDuration =
                    this.transitionDuration = duration + 'ms';
    if(timingFunc) {
        this.webkitTransitionTimingFunction =
            this.MozTransitionTimingFunction =
                this.msTransitionTimingFunction =
                    this.OTransitionTimingFunction =
                        this.transitionTimingFunction = timingFunc;
    }

}

function style_addTranslate(x, y, unit) {
    if(!unit) {
        unit = 'px';
    }
    this.webkitTransform += 'translate(' + x + unit + ',' + y + unit + ')' + 'translateZ(0)';
    var commonTransform = 'translateX(' + x + unit + ') translateY(' + y + unit +')';
    this.msTransform += commonTransform;
    this.MozTransform += commonTransform;
    this.OTransform += commonTransform;
}
function style_addScale(x, y) {
    this.webkitTransform += 'scale(' + x + ',' + y + ')';
    var commonTransform = 'scaleX(' + x + ') scaleY(' + y + ')';
    this.msTransform += commonTransform;
    this.MozTransform += commonTransform;
    this.OTransform += commonTransform;
}
function style_clearTransform() {
    this.webkitTransform = '';
    this.msTransform =
        this.MozTransform =
            this.OTransform = '';
}

window.AnimationUtil = {
    /**
     * 以当前位置为起点,平滑移动一个dom节点
     * @param dom 需要移动的dom节点
     * @param x 水平移动的距离
     * @param y 垂直移动的距离
     * @param duration 动画时长
     * @param timingFunc 动画函数,同css3 transition支持的timingFunction
     */
    animTranslate : function(dom, x, y, duration, timingFunc) {
        var style = dom && dom.style;

        if (!style) return;
        style_clearTransform(style);
        style_setDuration.call(style, duration, timingFunc);
        style_addTranslate.call(style, x, y)
    },
    /**
     * 在特定位置触发一个展开点击效果
     * @param centerX 展开动画中心点,相对于dom的px
     * @param centerY 展开动画中心点,相对于dom的px
     */
    animOnClick_Expand : function(dom, centerX, centerY, duration) {
        var $ = window.jQuery;
        var WindowUtil = window.WindowUtil;
        var sprite_size_rem = 16;
        var sprite_size_px = WindowUtil.getPixelFromRem(sprite_size_rem);
        var half_size_px = sprite_size_px/2;
        var $sprite = $("<div></div>");
        var trans_x = centerX - half_size_px;
        var trans_y = centerY - half_size_px;
        $sprite.css({
            width: sprite_size_rem + "rem",
            height: sprite_size_rem + "rem",
            position : "fixed",
            left:trans_x,
            top:trans_y,
            backgroundColor : '#000000',
            borderRadius : half_size_px,
            opacity : 0.2
        });
        var sprite = $sprite.get(0);
        var style = sprite.style;
        if(!style)
            return;

        dom.appendChild && dom.appendChild(sprite);
        //init translate and scale
        style_clearTransform.call(style);
        style_setDuration.call(style, 0);
        style_addScale.call(style, 0.1, 0.1);
        //start real translate and scale
        setTimeout(function() {
            style_clearTransform.call(style);
            style_setDuration.call(style, duration * 2, 'linear');
            style_addScale.call(style, 1, 1);
        }, 0);
        //start change opacity
        $sprite.animate({
           opacity : 0
        }, duration, 'linear');
        //add timer to remove animation
        setTimeout(function() {
            $sprite.remove();
        }, duration + 300);
    }

};

})();
