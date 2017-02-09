/**
 * 用来管理移动端用户动作事件
 */

(function() {

var DoubleClickInter = 800;
var clickTimer = {
    _prevTime: (new Date()).getTime(),
    isDoubleClick: function () {
        var curTime = (new Date()).getTime();
        var res = (curTime - this._prevTime) < DoubleClickInter;
        this._prevTime = curTime;
        return res;
    }
};

function isMouseEvent(e) {
    return /^mouse/.test(e.type);
}

function wrapTouchModeEvent(event) {
    var touches;
    if (isMouseEvent(event)) {
        touches = event;
    } else {
        touches = event.touches[0];
    }
    return touches;
}

window.MotionUtil = {
    /**
     * 为可以滑动的组件设置点击事件
     * 这个点击事件会在用户拖动手指时不触发,做了双击保护
     * @param obj 事件接收对象
     * @param onClick function,this是obj
     */
    addOnClickListener: function (obj, onClick) {
        var isStart = false;
        var startPoint = {};
        var hasMoved = false;

        function reset() {
            isStart = false;
            hasMoved = false;
        }

        function start(event) {
            event = wrapTouchModeEvent(event);
            isStart = true;
            startPoint.x = event.pageX;
            startPoint.y = event.pageY;
        }

        function move(event) {
            if (isStart && !hasMoved) {
                event = wrapTouchModeEvent(event);
                var delta_x = event.pageX - startPoint.x,
                    delta_y = event.pageY - startPoint.y;
                var delta = delta_x * delta_x + delta_y * delta_y;
                hasMoved = delta > 100; //移动超过10像素则认为是移动过
            }
        }

        function end(event) {
            if (isStart && !hasMoved) {
                if (!clickTimer.isDoubleClick()) {
                    onClick.call(obj);
                }
            }
            reset();
        }

        function cancel(event) {
            reset();
        }

        obj.addEventListener('mousedown', start);
        obj.addEventListener('touchstart', start);
        obj.addEventListener('mousemove', move);
        obj.addEventListener('touchmove', move);
        obj.addEventListener('mouseup', end);
        obj.addEventListener('touchend', end);
        obj.addEventListener('touchcancel', cancel);
        obj.addEventListener('mouseout', cancel);
    }
};

})();
