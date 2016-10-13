Engine.define('Application', ['Dom', 'Menu', 'Word', 'Dispatcher', 'Config', 'Rest'], function(){

    var Word = Engine.require('Word');
    var Dom = Engine.require('Dom');
    var Rest = Engine.require('Rest');
    var Menu = Engine.require('Menu');
    var Config = Engine.require('Config');
    var Dispatcher = Engine.require('Dispatcher');

    function Application() {
        var context = {
            buildSidebar: this.buildSidebar
        };
        Rest.host = document.location.protocol + '//' + document.location.host + '/';
        this.initDispatcher(context);
        this.initMenu();
        Word.language = 'ru';
    }

    Application.prototype.initDispatcher = function(context){
        var config = new Config();
        this.dispatcher = new Dispatcher('application', context, config);
    };
    Application.prototype.initMenu = function(){
        var me = this;
        var mainMenu = new Menu(function(className){
            me.dispatcher.placeApplication(className);
        });
        var home = mainMenu.menu('home');
        me.dispatcher.addMapping('Home', 'home');
        Word('menu_home', home.link);

        var engine = mainMenu.menu('engine-info');
        me.dispatcher.addMapping('EngineInfo', 'engine-info');
        Word('menu_engine', engine.link);

       /* var utils = mainMenu.menu('utils-info');
        me.dispatcher.addMapping('UtilsInfo', 'utils-info');
        Word('menu_utils', utils.link);

        var forms = mainMenu.menu('forms-info');
        me.dispatcher.addMapping('FormsInfo', 'forms-info');
        Word('menu_forms', forms.link);

        var components = mainMenu.menu('components-info');
        me.dispatcher.addMapping('ComponentsInfo', 'components-info');
        Word('menu_components', components.link);

        var word = mainMenu.menu('word-info');
        me.dispatcher.addMapping('WordInfo', 'word-info');
        Word('menu_word', word.link);*/

        var routes = mainMenu.menu('routes-info');
        me.dispatcher.addMapping('RoutesInfo', 'routes-info');
        me.dispatcher.addMapping('RoutesInfo', 'routes-info/:app');
        Word('menu_routes', routes.link);

        me.dispatcher.placeApplication();
        this.mainMenu = mainMenu;
    };

    Application.prototype.run = function(){
        Dom.append(Dom.id('menu'), [this.mainMenu.container, Dom.el('div', 'clear')]);
    };

    return Application;
});
