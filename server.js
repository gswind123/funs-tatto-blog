/**
 * Created by yw_sun
 */
const LogUtil = require('./scripts/utils/LogUtil.js');
const Resources = require('./scripts/utils/Resources.js');

const express = require('express');
var app = express();

/** 注册静态资源地址 */
app.use('/public', express.static('public'));

/** 请求中间件 */
require('./scripts/utils/RequestUtil.js').addRequestMiddleware(app);

/**
 * 注册router中配置的服务到app
 */
var routerTable = require('./scripts/router.js').getTable();
var routerLength = routerTable.length;
for(var i=0; i < routerLength; i++) {
    var item = routerTable[i];
    try{
        var registerFunc = null;
        switch(item.type) {
            case 'get':
                registerFunc = app.get;
                break;
            case 'post':
                registerFunc = app.post;
                break;
            case 'use':
                registerFunc = app.use;
                break;
            default:break;
        }
        registerFunc.call(app, item.name, require(Resources.getScript(item.path)));
    }catch(e){
        LogUtil.logError({
            module : item.name,
            error : 'router config invalid',
            message: e.stack
        });
    }
}

app.listen(18080);

