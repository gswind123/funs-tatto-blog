/**
 * 用来处理请求参数公共业务的工具
 * Created by windning on 2017/03/10
 */

module.exports = {
    addRequestMiddleware : function(app) {
        if(app && app.use) {
            const BodyParser = require('body-parser');
            app.use(BodyParser.urlencoded({extended:false}));
            app.use(BodyParser.json({type:"application/json"}));
        }
    },
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
