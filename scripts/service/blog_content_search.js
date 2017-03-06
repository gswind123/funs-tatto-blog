const BackendEngine = require('./../backend/BackendEngine.js');

module.exports = function (req, res) {
    var blogId = req.body.id;
    var response = {
        result: 1,
        data: []
    };
    function finalFunc() {
        res.headers("Content-type", "application/json");
        res.send(response);
        res.end();
    }

    if (blogId) {
        BackendEngine.Invoke('blog_content_fetch', blogId)
            .then(function(dataObj) {
                if (dataObj) {
                    response.data = dataObj.data;
                    response.result = 0;
                }
                finalFunc();
            })
            .then(function(err) {
                finalFunc();
            });
    }
};
