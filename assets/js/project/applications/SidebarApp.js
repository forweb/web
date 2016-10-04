Engine.define('SidebarApp', 'FullPageApp', function(FullPageApp){
    
    function SidebarApp(config, context, placeApplication) {
        FullPageApp.apply(this, arguments);
    }
    SidebarApp.prototype = Object.create(FullPageApp.prototype);
    
    SidebarApp.prototype.handleSidebar = function() {
        Dom.removeClass(this.context.sidebar, 'hidden');
    };
    return SidebarApp;
});