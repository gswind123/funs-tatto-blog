const BackendEngine = require('./../backend/BackendEngine.js');
const RequestUtil = require('../utils/RequestUtil.js');
const LogUtil = require("../utils/LogUtil.js");

module.exports = function (req, res) {
    var blogId = RequestUtil.getParam(req, "id");
    var response = {
        result: 1,
        error: "",
        data: []
    };
    function finalFunc() {
        res.header("Content-type", "application/json");
        res.send(response);
        res.end();
    }

    BackendEngine.Invoke('blog_content_fetch', blogId)
        .then(function(dataObj) {
            if (dataObj) {
                response.data = dataObj.data;
                response.result = 0;
            }
            finalFunc();
        }, function(error) {
            response.result = 1;
            response.error = error;
            finalFunc();
        })
        .catch(function(exception) {
            LogUtil.logError(exception);
            finalFunc();
        });
};
