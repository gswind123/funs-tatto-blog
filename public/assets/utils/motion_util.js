/**
 * 用来管理移动端用户动作事件
 */

(function() {

var DoubleClickInter = 500;

var TimerHashCount = 0;

function ClickTimer() {
    this._prevTime= (new Date()).getTime();
    this.hash = TimerHashCount++;
}
ClickTimer.prototype.isDoubleClick = function () {
    var curTime = (new Date()).getTime();
    var res = (curTime - this._prevTime) < DoubleClickInter;
    this._prevTime = curTime;
    return res;
};

/**
 * 模式锁,用来实现"如果接受了一种逻辑,那么就不再接受另一种"
 * 这里是用来解决一些手机鼠标/触摸事件都触发,防止重复出发的情况
 *
 * 每次调用PatternLock的lock方法,传入一个用来生成模式的参数,锁会生成一个模式
 * 当生成的模式和第一次调用lock生成的一致时,返回true,否则返回false
 *
 * @param genPattern function(param)
 *      在调用{@link #PatternLock#lock}时,用来根据参数生成当前所属的pattern
 *      返回值会被用来使用"==="进行比较
 */
function PatternLock(genPattern) {
    this._pattern = null;
    this._genPattern = genPattern;
}
PatternLock.prototype.lock = function(param) {
    var genPattern = this._genPattern;
    if(genPattern) {
        var pattern = genPattern(param);
        if(this._pattern === null) {
            this._pattern = pattern;
            return true;
        } else {
            return this._pattern === pattern;
        }
    }
    return false;
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

        var click_timer = new ClickTimer();
        var cur_loc = [0, 0];

        function reset() {
            isStart = false;
            hasMoved = false;
        }

        function genPattern(evt) {
            return isMouseEvent(evt);
        }
        var startLock = new PatternLock(genPattern),
            moveLock = new PatternLock(genPattern),
            endLock = new PatternLock(genPattern),
            cancelLock = new PatternLock(genPattern);

        function start(event) {
            if(!startLock.lock(event)) {
                return ;
            }
            event = wrapTouchModeEvent(event);
            cur_loc[0] = event.pageX;
            cur_loc[1] = event.pageY;
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
            if(!moveLock.lock(event)) {
                return ;
            }
            event = wrapTouchModeEvent(event);
            cur_loc[0] = event.pageX;
            cur_loc[1] = event.pageY;
            if(isStart) {
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
            if(!endLock.lock(event)) {
                return ;
            }
            if (isStart && !hasMoved) {
                if(touchListener.onClick) {
                    if (!click_timer.isDoubleClick()) {
                        touchListener.onClick(
                            createEvent4TouchListener(cur_loc[0], cur_loc[1], obj)
                        );
                    }
                }
            }
            reset();
            if(touchListener.onTouchRelease) {
                touchListener.onTouchRelease(
                    createEvent4TouchListener(cur_loc[0], cur_loc[1], obj)
                );
            }
        }

        function cancel(event) {
            if(!cancelLock.lock(event)) {
                return ;
            }
            reset();
            if(touchListener.onTouchCancel) {
                touchListener.onTouchCancel(
                    createEvent4TouchListener(cur_loc[0], cur_loc[1], obj)
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
