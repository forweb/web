Engine.define('AppPathBuilder', function(){
    function AppPathBuilder(){

    }
    AppPathBuilder.prototype.buildPath = function(app){
        console.log(app);
        var path = '';
        switch (app) {
            case 'Home':
            case 'Page404':
            case 'WordInfo':
            case 'UtilsInfo':
            case 'FormsInfo':
            case 'RoutesInfo':
            case 'EngineInfo':
                path = 'applications/' + app;
                break;
            case 'Application':
                path = app;
                break;
        }

        if(path) {
            return '/assets/js/project/' + path + '.js'
        } else {
            return '';
        }
    };
    return AppPathBuilder;
})