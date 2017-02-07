
module.exports = function(req, res) {
    var blogId = req.body.id;
    var response = {};
    if(blogId) {
        
    }
    res.headers("Content-type", "application/json");
    res.send(response);
    res.end();
};
