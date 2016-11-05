Engine.define('Page404', ['Dom', 'Word'], function(){
    var Dom = Engine.require('Dom');
    var Word = Engine.require('Word');
    
    function Page404(context){
        this.container = Dom.el('div');
        Word('page_404_content', this.container, 'html');
    }
    
    return Page404
});