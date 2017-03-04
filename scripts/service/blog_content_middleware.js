/**
 * Created by hasee on 2017/2/28.
 */
const Resources = require('../utils/Resources.js');
const FS = require('fs');

var getBlogContentByFile = function (blogId) {
    var dataObject = {
        success: true,
        data: []
    };
    //其实这里应该按照blogId来读取博客内容，有待商榷
    FS.readFile(Resources.getJsonFile('blog_content_search.json'), 'utf-8', function (err, data) {
        if (err) {
            dataObject.success = false;
        } else {
            dataObject.data = JSON.parse(data);
        }
    });
    return dataObject;
}

var getBlogContentByDB = function (blogId) {
    var dataObject = {
        success: true,
        data: []
    };

    return dataObject;
}

module.exports = function (blogId) {
    return getBlogContentByFile(blogId);
}