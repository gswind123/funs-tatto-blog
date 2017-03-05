/**
 * 用来管理移动端用户动作事件
 */

(function() {

var DoubleClickInter = 800;

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

function createEvent4TouchListener( x, y, param) {
    return {
        x : x,
        y : y,
        param : param
    };
}

window.MotionUtil = {
    /**
     * 为可以滑动的组件设置点击事件
     * 这个点击事件会在用户拖动手指时不触发,做了双击保护
     * @param obj 事件接收对象
     * @param touchListener
     *      {
     *          onClick : function(event),
     *          onTouchStart : function(event),
     *          onTouchMove : function(event),
     *          onTouchRelease : function(event),
     *          onTouchCancel : function(event)
     *      }
     *
     *      NOTE : event :
     *          {
     *              x : number,
     *              y : number,
     *              param : 参数传入的obj
     *          }
     */
    addTouchEventListener: function (obj, touchListener) {
        var isStart = false;
        var startPoint = {};
        var hasMoved = false;


        var click_timer = {
            _prevTime: (new Date()).getTime(),
            isDoubleClick: function () {
                var curTime = (new Date()).getTime();
                var res = (curTime - this._prevTime) < DoubleClickInter;
                this._prevTime = curTime;
                return res;
            }
        };

        function reset() {
            isStart = false;
            hasMoved = false;
        }

        function start(event) {
            event = wrapTouchModeEvent(event);
            isStart = true;
            startPoint.x = event.pageX;
            startPoint.y = event.pageY;
            if(touchListener.onTouchStart) {
                touchListener.onTouchStart(
                    createEvent4TouchListener(event.pageX, event.pageY, obj)
                );
            }
        }

        function move(event) {
            if(isStart) {
                event = wrapTouchModeEvent(event);
                if (!hasMoved) {
                    var delta_x = event.pageX - startPoint.x,
                        delta_y = event.pageY - startPoint.y;
                    var delta = delta_x * delta_x + delta_y * delta_y;
                    hasMoved = delta > 100; //移动超过10像素则认为是移动过
                }
                if(touchListener.onTouchMove) {
                    touchListener.onTouchMove(
                        createEvent4TouchListener(event.pageX, event.pageY, obj)
                    );
                }
            }
        }

        function end(event) {
            event = wrapTouchModeEvent(event);
            if (isStart && !hasMoved) {
                if(touchListener.onClick) {
                    if (!click_timer.isDoubleClick()) {
                        touchListener.onClick(
                            createEvent4TouchListener(event.pageX, event.pageY, obj)
                        );
                    }
                }
            }
            reset();
            if(touchListener.onTouchRelease) {
                touchListener.onTouchRelease(
                    createEvent4TouchListener(event.pageX, event.pageY, obj)
                );
            }
        }

        function cancel(event) {
            reset();
            event = wrapTouchModeEvent(event);
            if(touchListener.onTouchCancel) {
                touchListener.onTouchCancel(
                    createEvent4TouchListener(event.pageX, event.pageY, obj)
                );
            }
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
