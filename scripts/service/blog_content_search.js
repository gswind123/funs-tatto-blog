const BackendEngine = require('./../backend/BackendEngine.js');

module.exports = function (req, res) {
    var blogId = req.body.id;
    var response = {
        result: 1,
        data: []
    };

    if (blogId) {
        var dataObject = BackendEngine.Invoke('blog_content_fetch', blogId);
        if (dataObject) {
            response.data = dataObject.data;
            response.result = 0;
        }
    }

    res.headers("Content-type", "application/json");
    res.send(response);
    res.end();
};
