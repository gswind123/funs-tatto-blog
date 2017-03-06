/**
 * 获取索引页数据的服务
 * Created by yw_sun on 2017/01/28
 */

// const Resources = require('../utils/Resources.js');
// const LogUtil  =require('../utils/LogUtil.js');
// const FS = require('fs');
const BackendEngine = require('../backend/BackendEngine.js');

module.exports = function (req, res) {
    /*FS.readFile(Resources.getJsonFile('index_data.json'), 'utf-8', function(err, data) {
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
     });*/
    var indexData = {
        result: 1,
        data: []
    };
    function finalFunc() {
        res.header("Content-type", "application/json");
        res.send(indexData);
        res.end();
    }

    BackendEngine.Invoke('index_data_fetch')
        .then(function(dataObject) {
            if (dataObject) {
                indexData.data = dataObject.data;
                indexData.result = 0;
            }
            var a = null.invoke();
            finalFunc();
        })
        .catch(function(exp) {
            console.log(JSON.stringify(exp));
            finalFunc();
        });
};
