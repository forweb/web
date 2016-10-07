Engine.define('RoutesInfo', ['Dom', 'Word', 'FullPageApp'], function(){
    var Dom = Engine.require('Dom');
    var Word = Engine.require('Word');
    var FullPageApp = Engine.require('FullPageApp');

    function RoutesInfo(context, config, placeApplication){
        FullPageApp.apply(this, arguments);
        this.container = Dom.el('div');
        this.URL = 'routes-info';
        this.context = context;
        this.placeApplication = placeApplication;
        this.canStay();
    }
    RoutesInfo.prototype = Object.create(FullPageApp.prototype);

    RoutesInfo.prototype.canStay = function() {
        var app = this.context.request.params.app;
        if(!app) {
            Word('routes_info_content', this.container, 'html');
            return
        }
        switch (app) {
            case 'url-resolver':
                app = 'url_resolver';
                /*fall through*/
            case 'application':
            case 'dispatcher':
                Word('routes_' +app+ '_content', this.container, 'html');
                return true;
            default:
                return false;
        }
    };


    return RoutesInfo
});