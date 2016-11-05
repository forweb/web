Engine.define('Home', ['Dom', 'Word'], function(){
    var Dom = Engine.require('Dom');
    var Word = Engine.require('Word');
    
    function HomeInfo(context){
        this.container = Dom.el('div');
        Word('home_info_content', this.container, 'html');
    }
    return HomeInfo
});