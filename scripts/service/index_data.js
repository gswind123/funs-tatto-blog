/**
 * 获取索引页数据的服务
 * Created by yw_sun on 2017/01/28
 */

const Resources = require('../utils/Resources.js');
const LogUtil  =require('../utils/LogUtil.js');
const FS = require('fs');

module.exports = function(req, res) {
    FS.readFile(Resources.getJsonFile('index_data.json'), 'utf-8', function(err, data) {
        var indexData = {
            result : 0,
            data : []
        };
        if(err) {
            LogUtil.logError({
                path : 'index_data',
                error : err
            });
            indexData.result = 1;
        } else {
            indexData.data = JSON.parse(data);
        }
        res.header("Content-type", "application/json");
        res.send(indexData);
        res.end();
    });
};
