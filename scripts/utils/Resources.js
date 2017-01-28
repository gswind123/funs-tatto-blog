/**
 * 管理服务器私有资源的工具类
 * Created by yw_sun on 2017/01/28
 */

const Path = require('path');

const resDir = Path.join(__dirname, '../../res');
const scriptDir = Path.join(__dirname, '../../scripts');

var Resources = {
    getJsonFile: function (name) {
        return Path.join(resDir, 'json', name);
    },
    getScript: function (name) {
        return Path.join(scriptDir, name);
    }

};

module.exports = Resources;
