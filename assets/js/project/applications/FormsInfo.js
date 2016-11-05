Engine.define('FormsInfo', ['Dom', 'Word', 'Menu', 'StringUtils', 'Text', 'Radio', 'Textarea', 'Checkbox', 'Select', 'GenericFormSamples'], function(){
    var Dom = Engine.require('Dom');
    var Word = Engine.require('Word');
    var Menu = Engine.require('Menu');
    var Text = Engine.require('Text');
    var Radio = Engine.require('Radio');
    var Select = Engine.require('Select');
    var Textarea = Engine.require('Textarea');
    var Checkbox = Engine.require('Checkbox');
    var StringUtils = Engine.require('StringUtils');
    var GenericFormSamples = Engine.require('GenericFormSamples');

    function FormsInfo(context){
        this.context = context;
        this.content = Dom.el('div', 'content');
        this.examples = Dom.el('div');
        this.menu = new Menu(function(appName){context.dispatcher.placeApplication(appName)});
        this.createMenu('AbstractInput');
        this.createMenu('Text');
        this.createMenu('Textarea');
        this.createMenu('Radio');
        this.createMenu('Checkbox');
        this.createMenu('Select');
        this.createMenu('Validation');
        this.createMenu('FieldMeta');
        this.createMenu('GenericForm');
        this.sidebar = Dom.el('div', 'sidebar', this.menu.container);


        this.container = Dom.el('div', null, [this.sidebar, this.content, this.examples]);
        this.canStay();
    }

    FormsInfo.prototype.createMenu = function(menuName) {
        var dashedName = StringUtils.normalizeText(menuName, '-').toLowerCase();
        var lcName = StringUtils.normalizeText(menuName, '_').toLowerCase();
        var m = this.menu.menu('forms-info/' + dashedName, menuName);
        Word("menu_forms_" + lcName, m.link);
        return m;
    };

    FormsInfo.prototype.canStay = function() {
        var app = this.context.request.params.app;
        if(!app) {
            Word('forms_info_content', this.content, 'html');
            return
        } else {
            app = app.replace(/-/g, "_");
        }

        switch (app) {
            case 'abstract_input':
            case 'text':
            case 'textarea':
            case 'radio':
            case 'checkbox':
            case 'select':
            case 'validation':
            case 'field_meta':
            case 'generic_form':
                Word('forms_' +app+ '_content', this.content, 'html');
                this.examples.innerHTML = '';
                Dom.append(this.examples, this.prepareExample(app));
                return true;
            default:
                return false;
        }
    };

    FormsInfo.prototype.initTextExample = function() {
        var console = Dom.el('div');
        var text = new Text({name: 'example', attr: {onkeyup: function(){
            console.innerHTML = text.getValue();
        }}});
        return Dom.el('div', "content", [
            Dom.el('code', null, "var Dom = Engine.require('Dom');\n" +
                "var console = Dom.el('div');\n" +
                "var text = new Text({name: 'example', onkeyup: function(){\n"+
                "    console.innerHTML = text.getValue();\n" +
                "}});\n" +
                "Dom.append(document.body, text.container);\n" +
                "Dom.append(document.body, console);"),
            Dom.el('code', null, [text.container, console])
        ])
    };
    FormsInfo.prototype.initTextareaExample = function() {
        var console = Dom.el('div');
        var textarea = new Textarea({name: 'example', onkeyup: function(){
            console.innerHTML = textarea.getValue();
        }});
        return Dom.el('div', "content", [
            Dom.el('code', null, "var Dom = Engine.require('Dom');\n" +
                "var console = Dom.el('div');\n" +
                "var textarea = new Textarea({name: 'example', onkeyup: function(){\n"+
                "    console.innerHTML = text.getValue();\n" +
                "}});\n" +
                "Dom.append(document.body, textarea.container);\n" +
                "Dom.append(document.body, console);"),
            Dom.el('code', null, [textarea.container, console])
        ])
    };
    FormsInfo.prototype.initCheckboxExample = function() {
        var console = Dom.el('div');
        var checkbox = new Checkbox({name: 'example', onchange: function(){
            console.innerHTML = checkbox.getValue() ? 'checked' : 'not checked';
        }});
        return Dom.el('div', "content", [
            Dom.el('code', null, "var Dom = Engine.require('Dom');\n" +
                "var console = Dom.el('div');\n" +
                "var checkbox = new Checkbox({name: 'example', onchange: function(){\n"+
                "    console.innerHTML = text.getValue();\n" +
                "}});\n" +
                "Dom.append(document.body, checkbox.container);\n" +
                "Dom.append(document.body, console);"),
            Dom.el('code', null, [checkbox.container, console])
        ])
    };
    FormsInfo.prototype.initSelectExample = function() {
        var console = Dom.el('div');
        var select = new Select({name: 'example', onchange: function(){
            console.innerHTML = select.getValue();
        }, options: [
            {value: '', label: 'Please select'},
            {value: 'M', label: 'Male'},
            {value: 'F', label: 'Female'}
        ]});
        return Dom.el('div', "content", [
            Dom.el('code', null, "var Dom = Engine.require('Dom');\n" +
                "var console = Dom.el('div');\n" +
                "var select = new Select({name: 'example', onchange: function(){\n"+
                "    console.innerHTML = text.getValue();\n" +
                "}, options: [\n"+
                "    {value: '', label: 'Please select'},\n"+
                "    {value: 'M', label: 'Male'},\n"+
                "    {value: 'F', label: 'Female'}\n"+
                "]});\n" +
                "Dom.append(document.body, select.container);\n" +
                "Dom.append(document.body, console);"),
            Dom.el('code', null, [select.container, console])
        ])
    };
    FormsInfo.prototype.initRadioExample = function() {
        var console = Dom.el('div');
        var checkbox = new Radio({name: 'example', onchange: function(){
            console.innerHTML = checkbox.getValue();
        }, options: [
            {value: 'M', label: 'Male'},
            {value: 'F', label: 'Female'}
        ]});
        return Dom.el('div', "content", [
            Dom.el('code', null, "var Dom = Engine.require('Dom');\n" +
                "var console = Dom.el('div');\n" +
                "var radio = new Radio({name: 'example', onchange: function(){\n"+
                "    console.innerHTML = text.getValue();\n" +
                "}, options: [\n"+
                "    {value: 'M', label: 'Male'},\n"+
                "    {value: 'F', label: 'Female'}\n"+
                "]});\n" +
                "Dom.append(document.body, Radio);\n" +
                "Dom.append(document.body, console);"),
            Dom.el('code', null, [checkbox.container, console])
        ])
    };


    FormsInfo.prototype.initGenericFormExample = function() {
        return new GenericFormSamples();
    };

    FormsInfo.prototype.prepareExample = function(app) {
        var clazz = null;
        switch (app){
            case 'text':
                return this.initTextExample();
                break;
            case 'textarea':
                return this.initTextareaExample();
                break;
            case 'checkbox':
                return this.initCheckboxExample();
                break;
            case 'select':
                return this.initSelectExample();
                break;
            case 'radio':
                return this.initRadioExample();
                break;
            case 'generic_form':
                return this.initGenericFormExample();
                break;
        }
    }



    return FormsInfo
});