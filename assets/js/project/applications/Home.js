Engine.define('Home', ['Dom', 'Word', 'FullPageApp'], function(){
    var Dom = Engine.require('Dom');
    var Word = Engine.require('Word');
    var FullPageApp = Engine.require('FullPageApp');
    
    function HomeInfo(context, config, placeApplication){
        FullPageApp.apply(this, arguments);
        this.URL = 'home';
        this.container = Dom.el('div');
        Word('home_info_content', this.container, 'html');
    }
    HomeInfo.prototype = Object.create(FullPageApp.prototype);
    return HomeInfo
});