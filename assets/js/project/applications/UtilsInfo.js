Engine.define('UtilsInfo', ['Dom', 'Word', 'Menu'], function(){
    var Dom = Engine.require('Dom');
    var Word = Engine.require('Word');
    var Menu = Engine.require('Menu');

    function UtilsInfo(context){
        this.context = context;
        this.content = Dom.el('div', 'content');
        var menu = new Menu(function(appName){context.dispatcher.placeApplication(appName)});
        var m = menu.menu('utils-info/ajax', 'Ajax');
        Word("menu_utils_ajax", m.link);
        m = menu.menu('utils-info/rest', 'Rest');
        Word("menu_utils_rest", m.link);
        m = menu.menu('utils-info/dom', 'Dom');
        Word("menu_utils_dom", m.link);
        m = menu.menu('utils-info/config', 'Config');
        Word("menu_utils_config", m.link);
        m = menu.menu('utils-info/string-utils', 'StringUtils');
        Word("menu_utils_string_utils", m.link);
        m = menu.menu('utils-info/url-utils', 'UrlUtils');
        Word("menu_utils_url_utils", m.link);
        m = menu.menu('utils-info/screen-utils', 'ScreenUtils');
        Word("menu_utils_screen_utils", m.link);
        this.sidebar = Dom.el('div', 'sidebar', menu.container);
        this.container = Dom.el('div', null, [this.sidebar, this.content]);
        this.canStay();
    }

    UtilsInfo.prototype.canStay = function() {
        var app = this.context.request.params.app;
        if(!app) {
            Word('utils_info_content', this.content, 'html');
            return
        }
        switch (app) {
            case 'string-utils':
            case 'url-utils':
            case 'screen-utils':
                app = app.replace("-", "_");
                /*fall through*/
            case 'ajax':
            case 'rest':
            case 'dom':
            case 'config':
                Word('utils_info_' +app+ '_content', this.content, 'html');
                return true;
            default:
                return false;
        }
    };


    return UtilsInfo
});