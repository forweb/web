Engine.define('Page404', ['Dom', 'Word', 'FullPageApp'], function(){
    var Dom = Engine.require('Dom');
    var Word = Engine.require('Word');
    var FullPageApp = Engine.require('FullPageApp');
    
    function Page404(context, config, placeApplication){
        FullPageApp.apply(this, arguments);
        this.container = Dom.el('div');
        this.URL = 'engine-info';
        Word('page_404_content', this.container, 'html');
    }
    Page404.prototype = Object.create(FullPageApp.prototype);
    
    return Page404
});