/**
 * 获取索引页数据接口
 * Created by hasee on 2017/3/5.
 */

const Resources = require('../utils/Resources.js');
const FS = require('fs');
const Promise = require('promise');

var getIndexDataByFile = function () {
    return new Promise(function (resolve, reject) {
        FS.readFile(Resources.getJsonFile('index_data.json'), 'utf-8', function (err, data) {
            var dataObj = {
                data: []
            };
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

var getIndexDataByDB = function () {
    var dataObj = {
        data: []
    };

    return dataObj;
};

module.exports = getIndexDataByFile;