/**
 * 用于注册服务的路由表
 * Created by yw_sun on 2017/01/28
 */

var routerTable = [
    {
        name : '/index_data',
        path : './service/index_data.js',
        type : 'use'
    },
    {
        name : '/blog_content_search',
        path : './service/blog_content_search.js',
        type : 'use'
    }
];

var Router = {
    /**
     * 路由表格式:
     * [
     *     {
     *         name : "index", //路径名 protocol://host:port/index
     *         path : "./service/index_service.js", //对应的脚本对象,导出的是一个路由处理函数;根路径位于scripts文件夹下
     *         type : "post" //服务类型,包含get,post,use
     *     }
     * ]
     */
    getTable : function() {
        return routerTable;
    }
};

module.exports = Router;
