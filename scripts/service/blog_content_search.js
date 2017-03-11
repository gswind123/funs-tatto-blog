const BackendEngine = require('../utils/BackendEngine.js');
const RequestUtil = require('../utils/RequestUtil.js');
const LogUtil = require("../utils/LogUtil.js");

module.exports = function (req, res) {
    var blogId = RequestUtil.getParam(req, "id");
    var resBuilder = {
        build : function() {
            return {
                result : this.error,
                data : this.data,
                errorMessage : this.message
            };
        }
    };

    BackendEngine.Invoke('blog_content_fetch', blogId).then(function(dataObj) {
        if (dataObj) {
            resBuilder.data = dataObj.data;
            resBuilder.error = 0;
        } else {
            resBuilder.error = 1;
            resBuilder.message = "页面不存在或已被删除";
        }
    }, function(error) {
        resBuilder.error = 2;
        resBuilder.message = "查询出了个错:"+error;
    }).catch(function(exception) {
        LogUtil.logError(exception);
        resBuilder.error = 3;
        resBuilder.message = "服务器开小差了,请稍后重试";
    }).finally(function() {
        res.header("Content-type", "application/json");
        res.send(resBuilder.build());
        res.end();
    });
};
