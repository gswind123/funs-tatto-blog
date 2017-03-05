/**
 * 用于提供统一接口的桥
 * Created by hasee on 2017/3/5.
 */

var engineTable = [
    {
        name: 'blog_content_fetch',
        path: './blog_content_fetch.js'
    },
    {
        name: 'index_data_fetch',
        path: './index_data_fetch.js'
    }
];

var BackendEngine = {
    Invoke: function (name, parameter) {
        var tableLength = engineTable.length;
        for (var i = 0; i < tableLength; i++) {
            var item = engineTable[i];
            if (name === item.name) {
                return require(item.path)(parameter);
            }
        }
        return false;
    }
};

module.exports = BackendEngine;