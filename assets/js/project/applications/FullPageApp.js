Engine.define('FullPageApp', 'Dom', function(Dom){
    function FullPageApp(config, context, placeApplication) {
        this.config = config;
        this.context = context;
        this.placeApplication = placeApplication;
        
    }
    FullPageApp.prototype.handleSidebar = function() {
        Dom.addClass(this.context.sidebar, 'hidden');
    };
    return FullPageApp;
});