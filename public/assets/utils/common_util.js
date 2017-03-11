/**
 * 一些分散的简单的基本功能工具类
 * Created by yw_sun on 2017/02/10
 */

(function(){

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

window.FormatUtil = {
    str2html : function(str) {
        return str.replace('\n', '<br />');
    }
};

window.WindowUtil = {
    /**
     * 根据当前页面的对角线长度,重置rem单位的基准像素值
     * 这个方法不频繁调用,实现效率可以奢侈一点
     * NOTE: 在对角线736.3px时(360x640),font-size是10px;二者等比增大
     */
    adjustRemBaseUnit: function () {
        if(window.jQuery) {
            var w = window.innerWidth, h = window.innerHeight;
            var diagonal = Math.sqrt(w*w+h*h);
            var htmlFontSize = Math.round(10 * (diagonal/736.3)) ;
            var $ = window.jQuery;
            $('html').css('font-size', htmlFontSize+'px');
        }
    },

    /**
     * 根据rem获取pixel
     * NOTE:是根据查询html节点得到的rem到pixel转换率
     */
    getPixelFromRem : function(rem) {
        var fontSize = $('html').css('font-size');
        fontSize = fontSize && fontSize.replace(/px/g, '');
        fontSize = Number.parseFloat(fontSize);
        return rem * fontSize;
    }
};

function sendAjax(serviceName, method, param, success, error, final) {
    var ajaxParam = {};
    ajaxParam.url = '../' + serviceName; //只考虑用在index.html单页应用的情况
    if(method.toLowerCase() === 'post') {
        ajaxParam.type = 'POST';
        ajaxParam.contentType = 'application/json';
        if(typeof(param) === 'object') {
            ajaxParam.data = JSON.stringify(param);
        } else {
            ajaxParam.data = param;
        }
    } else {
        ajaxParam.type = 'GET';
        ajaxParam.data = param;
    }
    ajaxParam.success = success;
    ajaxParam.error = error;
    ajaxParam.complete = final;
    ajaxParam.dataType = 'json';
    var $xhr = window.jQuery.ajax(ajaxParam);
    return {
        _$xhr : $xhr,
        cancel : function() {
            if(this._$xhr) {
                this._$xhr.abort();
                this._$xhr = null;
            }
        }
    };
}
window.Sender = {
    /**
     * 发送一个get请求
     * @return sendResult 拥有cancel方法,可以取消正在发送的服务
     */
    get : function(serviceName, param, success, error, final) {
        return sendAjax(serviceName, 'GET', param, success, error, final);
    },

    /**
     * 发送一个post请求
     * @return sendResult 拥有cancel方法,可以取消正在发送的服务
     */
    post : function(serviceName, param, success, error, final) {
        return sendAjax(serviceName, 'POST', param, success, error, final);
    }
};

})();