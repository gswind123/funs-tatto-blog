/**
 * 获取索引页数据接口
 * Created by hasee on 2017/3/5.
 */

const Resources = require('../utils/Resources.js');
const FS = require('fs');

var getIndexDataByFile = function () {
    var dataObj = {
        data: []
    };

    FS.readFile(Resources.getJsonFile('index_data.json'), 'utf-8', function (err, data) {
        if (err) {
            dataObj = false;
        } else {
            dataObj.data = JSON.parse(data);
        }
    });

    return dataObj;
};

var getIndexDataByDB = function () {
    var dataObj = {
        data: []
    };

    return dataObj;
};

module.exports = function () {
    return getIndexDataByFile();
};