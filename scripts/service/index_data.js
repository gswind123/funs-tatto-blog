/**
 * 获取索引页数据的服务
 * Created by yw_sun on 2017/01/28
 */
const LogUtil  =require('../utils/LogUtil.js');
const BackendEngine = require('../utils/BackendEngine.js');

module.exports = function (req, res) {
    var resBuilder = {
        build : function() {
            return {
                data : this.data,
                result : this.error,
                errorMessage : this.error
            };
        }
    };

    BackendEngine.Invoke('index_data_fetch').then(function(dataObject) {
        if (dataObject) {
            resBuilder.data = dataObject.data;
            resBuilder.error = 0;
        } else {
            resBuilder.error = 1;
            resBuilder.message = "没有任何内容可以展示";
        }
    }, function(error) {
        resBuilder.error =2;
        resBuilder.message = "查询错误:" + error;
    }).catch(function(exception) {
        LogUtil.logError(exception);
        resBuilder.error = 3;
        resBuilder.message = "服务器开小差了,请稍候重试";
    }).finally(function() {
        res.header('Content-Type', 'application/json');
        res.send(resBuilder.build());
        res.end();
    });
};
