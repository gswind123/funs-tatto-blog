window.LogUtil = {
    e : function(exception) {
        console.log(exception);
    }
};

window.URLUtil = {
    /**
     * 获取当前URL中的参数,如 protocol:location.com?param=1中的param
     * @param name 参数名称
     * @return 经过URL解码处理后的对象,如果参数是个JSON,则会返回JSON对应的JS对象
     */
    getQueryParam : function(name) {
        var href = window.location.href;
        var quesIndex = href.indexOf('?');
        if(quesIndex < 0) {
            return null;
        }
        var search_phase = '';
        try{
            search_phase = href.substr(quesIndex+1);
        }catch(e){}
        if(!search_phase) {
            return null;
        }
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        var r = search_phase.match(reg);
        var res = null;
        try{
            res = JSON.parse(decodeURI(r[2]));
        }catch(e){}
        return res;
    }
};
