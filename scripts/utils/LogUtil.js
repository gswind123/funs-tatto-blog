/**
 * 服务器日志记录工具类
 * Created by yw_sun on 2017/01/28
 */
module.exports = {
    logError : function(e) {
        console.log('ERROR:');
        if(e.stack) {
            console.log(e.stack);
        } else {
            console.log(e);
        }
    },
    logObject : function(obj) {
        console.log('VERBOSE:');
        console.log(JSON.stringify(obj));
    }
};
