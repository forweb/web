Engine.define('EngineInfo', ['Dom', 'Word', 'FullPageApp'], function(){
    var Dom = Engine.require('Dom');
    var Word = Engine.require('Word');
    var FullPageApp = Engine.require('FullPageApp');
    
    function EngineInfo(context, config, placeApplication){
        FullPageApp.apply(this, arguments);
        this.container = Dom.el('div');
        this.URL = 'engine-info';
        Word('engine_info_content', this.container, 'html');
    }
    EngineInfo.prototype = Object.create(FullPageApp.prototype);
    
    return EngineInfo
});