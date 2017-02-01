/**
 * 用来管理移动端用户动作事件
 */

var clickTimer =

window.MotionUtil = {
    /**
     * 为可以滑动的组件设置点击事件
     * 这个点击事件会在用户拖动手指时不触发,做了双击保护
     * @param obj 事件接收对象
     * @param onClick function,this是obj
     */
    addOnClickListener : function(obj, onClick) {
        var isStart = false;
        var startPoint = {};
        var hasMoved = false;
        function reset() {
            isStart = false;
            hasMoved = false;
        }
        function start(event) {
            isStart = true;
            startPoint.x = event.screenX;
            startPoint.y = event.screenY;
        }
        function move(event) {
            if(isStart) {
                var delta_x = event.screenX - startPoint.x,
                    delta_y = event.screenY - startPoint.y;
                var delta = delta_x * delta_x + delta_y * delta_y;
                hasMoved = delta > 100; //移动超过10像素则认为是移动过
            }
        }
        function end(event) {
            if(isStart && !hasMoved) {
                onClick.call(obj);
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
