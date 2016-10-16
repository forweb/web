Engine.define('EngineInfo', ['Dom', 'Word'], function(){
    var Dom = Engine.require('Dom');
    var Word = Engine.require('Word');
    
    function EngineInfo(context, placeApplication){
        this.container = Dom.el('div');
        Word('engine_info_content', this.container, 'html');
    }
    
    return EngineInfo
});