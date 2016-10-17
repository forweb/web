Engine.define('RoutesInfo', ['Dom', 'Word', 'Menu'], function(){
    var Dom = Engine.require('Dom');
    var Word = Engine.require('Word');
    var Menu = Engine.require('Menu');

    function RoutesInfo(context, placeApplication){
        this.context = context;
        this.placeApplication = placeApplication;
        this.content = Dom.el('div', 'content');
        var menu = new Menu(placeApplication);
        var m = menu.menu('routes-info/dispatcher', 'Dispatcher');
        Word("menu_routes_dispatcher", m.link);

        m = menu.menu('routes-info/application', 'Application');
        Word("menu_routes_applications", m.link);
        m = menu.menu('routes-info/url-resolver', 'Url Resolver');
        Word("menu_routes_url_resolver", m.link);
        this.sidebar = Dom.el('div', 'sidebar', menu.container);


        this.container = Dom.el('div', null, [this.sidebar, this.content]);
        this.canStay();
    }

    RoutesInfo.prototype.canStay = function() {
        var app = this.context.request.params.app;
        if(!app) {
            Word('routes_info_content', this.content, 'html');
            return
        }
        switch (app) {
            case 'url-resolver':
                app = 'url_resolver';
                /*fall through*/
            case 'application':
            case 'dispatcher':
                Word('routes_' +app+ '_content', this.content, 'html');
                return true;
            default:
                return false;
        }
    };


    return RoutesInfo
});