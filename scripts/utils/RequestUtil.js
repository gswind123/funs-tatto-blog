/**
 * 用来处理请求参数公共业务的工具
 * Created by windning on 2017/03/10
 */

module.exports = {
    getParam :  function(request, name) {
        if(request.method.toLowerCase() === 'post') {
            return request.body[name];
        } else if(request.method.toLowerCase() === 'get') {
            return request.query[name];
        } else {
            return null;
        }
    }
};
