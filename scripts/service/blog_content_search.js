const getBlogContent = require('./blog_content_middleware');

module.exports = function (req, res) {
    var blogId = req.body.id;
    var response = {
        result: 0,
        data: []
    };
    if (blogId) {
        var dataObject = getBlogContent(blogId);

        if (dataObject.success) {
            response.data = dataObject.data;
        } else {
            response.result = 1;
        }
    }
    res.headers("Content-type", "application/json");
    res.send(response);
    res.end();
};
