/**
 * 获取文章数据接口
 * Created by hasee on 2017/2/28.
 */

const Resources = require('../utils/Resources.js');
const FS = require('fs');

var getBlogContentByFile = function (blogId) {
    return new Promise(function (resolve, reject) {
        if(!blogId) {
            reject("Blog id shouldn't be null");
            return ;
        }
        var dataObj = {
            // success: true,
            data: []
        };
        //这里修改为根据blogId选择对应的JSON文件，但是要不要做一个文件的桥，还需商榷
        var blogName =  'blog_content_search.json';
        FS.readFile(Resources.getJsonFile(blogName), 'utf-8', function (err, data) {
            if (err) {
                dataObj = false;
                reject(err);
            } else {
                dataObj.data = JSON.parse(data);
                resolve(dataObj);
            }
        });
    });
};

var getBlogContentByDB = function (blogId) {
    var dataObject = {
        // success: true,
        data: []
    };

    return dataObject;
};

module.exports = getBlogContentByFile;