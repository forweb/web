Engine.define("GenericFormSamples", ['GenericForm', 'StringUtils', 'Textarea', 'Word'], function(){
    var GenericForm = Engine.require('GenericForm');
    var StringUtils = Engine.require('StringUtils');
    var Textarea = Engine.require('Textarea');
    var Word = Engine.require('Word');
    var Dom = Engine.require('Dom');

    function GenericFormSamples(context) {
        var renderWarning = Dom.el('p', 'warning', "You should take care about onchange event.");
        Word("generic_form_render_warning", renderWarning);
        this.container = Dom.el('div', 'content', [
            this.generateExample("simpleExample"),
            this.generateExample("ignoreExample"),
            this.generateExample("typeExample"),
            this.generateExample("renderExample"),
            renderWarning,
            this.generateExample("wrapperExample"),
            this.generateExample("contentBeforeAndAfterExample"),
            this.generateExample("eventsExample"),
            this.generateExample("validationsExample"),
            this.generateExample("labelExample"),
            this.generateExample("wordExample"),
            this.generateExample("optionsExample"),
            this.generateExample("fieldsetExample"),
        ])
    }

    GenericFormSamples.prototype.generateExample = function(functionName) {
        return [
            Dom.el('h3', null, StringUtils.normalizeText(functionName)),
            Dom.el('code', null, this[functionName].toString()),
            this[functionName]()
        ]
    };
    GenericFormSamples.prototype.simpleExample = function() {
        var person = {
            firstName: 'John',
            lastName: 'Doe',
            smoker: true
        };
        var console = Dom.el('div', 'console');
        var form = new GenericForm(
            person,
            function(){
                console.innerHTML = "submit event: " + JSON.stringify(person);
            }
        );
        return Dom.el('div', 'sample', [form, console]);
    };

    GenericFormSamples.prototype.fieldsetExample = function() {
        var person = {
            firstName: 'John',
            lastName: 'Doe',
            address: {
                state: 'NV',
                city: 'Reno',
                address: 'cross of 71 Lincoln street and 10 ave, 14 building, room 1',
                houseOwner: true
            },
            smoker: true
        };
        var console = Dom.el('div', 'console');
        var form = new GenericForm(
            person,
            {
                address: {
                    legend: 'Address',
                    metaData: {
                        state: {
                            validations: 'length:2:2'
                        },
                        address: 'textarea'
                    }
                }
            },
            function(){
                console.innerHTML = "submit event: " + JSON.stringify(person);
            }
        );
        return Dom.el('div', 'sample', [form, console]);
    };
    GenericFormSamples.prototype.optionsExample = function() {
        var person = {
            firstName: 'John',
            lastName: 'Doe',
            gender: 'M',
            smoker: 'N'
        };
        var console = Dom.el('div', 'console');
        var form = new GenericForm(
            person,
            {
                gender: {options: [
                    {value: 'M', label: 'Male'},
                    {value: 'F', label: 'Female'}
                ]},
                smoker: {options: [
                    {value: 'N', label: 'Not a smoker'},
                    {value: 'Y5', label: 'Smoke 5 times a day'},
                    {value: 'Y10', label: 'Smoke 10 times a day'},
                    {value: 'Y20', label: 'Smoke 20 times a day'}
                ]}
            },
            function(){
                console.innerHTML = "submit event: " + JSON.stringify(person);
            }
        );
        return Dom.el('div', 'sample', [form, console]);
    };
    GenericFormSamples.prototype.wordExample = function() {
        var person = {
            firstName: 'John',
            lastName: 'Doe',
            smoker: true
        };
        var console = Dom.el('div', 'console');
        var form = new GenericForm(
            person,
            {
                firstName: {
                    validations: 'required'
                },
                lastName: {
                    wordKey: 'last_name',
                    validations: {required: true, length: [3, 20]},
                    wordErrorKey: {required: 'error_last_name_required', length: 'error_last_name_length'}
                }
            },
            {
                onSubmit: function(){
                    console.innerHTML = "submit event: " + JSON.stringify(person);
                },
                wordKey: 'sample_generic_form'
            }
        );
        return Dom.el('div', 'sample', [form, console]);
    };
    GenericFormSamples.prototype.labelExample = function() {
        var person = {
            firstName: 'John',
            lastName: 'Doe',
            smoker: true,
            comments: 'Favorite User'
        };
        var console = Dom.el('div', 'console');
        var form = new GenericForm(
            person,
            {
                firstName: {
                    label: Dom.el('span', {style: 'color: red'}, 'Login')
                },
                comments: {
                    label: false,
                    type: 'textarea'
                }
            },
            function(){
                console.innerHTML = "submit event: " + JSON.stringify(person);
            }
        );
        return Dom.el('div', 'sample', [form, console]);
    };
    GenericFormSamples.prototype.validationsExample = function() {
        var person = {
            firstName: 'John',
            lastName: 'Doe',
            smoker: true
        };
        var console = Dom.el('div', 'console');
        var form = new GenericForm(
            person,
            {
                firstName: {validations: 'required', errorMessages: 'First Name is required'},
                lastName: {validations: {length:[3,20], required: 1}, errorMessages: {required: 'This is required field', length: 'Last Name should be between 3 and 20 characters. Sorry.'}}
            },
            function(){
                console.innerHTML = "submit event: " + JSON.stringify(person);
            }
        );
        return Dom.el('div', 'sample', [form, console]);
    };
    GenericFormSamples.prototype.contentBeforeAndAfterExample = function() {
        var person = {
            firstName: 'John',
            lastName: 'Doe',
            smoker: true
        };
        var console = Dom.el('div', 'console');
        var form = new GenericForm(
            person,
            {
                firstName: {
                    contentBefore: 'Here is content before first name',
                    contentAfter: Dom.el('div', null, 'Here is content after first name')
                },
                lastName: {
                    contentBefore: 'Here is content before last name',
                    contentAfter: [Dom.el('span', null, 'Here is'), Dom.el('span', null, 'content after last name')]
                }
            },
            function(){
                console.innerHTML = "submit event: " + JSON.stringify(person);
            }
        );
        return Dom.el('div', 'sample', [form, console]);
    };
    GenericFormSamples.prototype.wrapperExample = function() {
        var person = {
            firstName: 'John',
            lastName: 'Doe',
            smoker: true
        };
        var wrapper = Dom.el('fieldset', null, Dom.el('legend', null, 'Person Form'));
        var console = Dom.el('div', 'console');
        var form = new GenericForm(
            person,
            {
                firstName: {wrapper: wrapper},
                smoker: {wrapper: wrapper}
            },
            function(){
                console.innerHTML = "submit event: " + JSON.stringify(person);
            }
        );
        return Dom.el('div', 'sample', [form, console]);
    };
    GenericFormSamples.prototype.renderExample = function() {
        var person = {
            firstName: 'John',
            lastName: 'Doe',
            smoker: true,
            comment: 'Favorite User'
        };
        var console = Dom.el('div', 'console');
        var form = new GenericForm(
            person,
            {comment: {render: function(){
                return new Textarea({name: 'comment', value: person.comment, onchange: function(event){
                    person.comment = event.target.value;
                }})
            }}},
            function(){
                console.innerHTML = "submit event: " + JSON.stringify(person);
            }
        );
        return Dom.el('div', 'sample', [form, console]);
    };
    GenericFormSamples.prototype.typeExample = function() {
        var person = {
            firstName: 'John',
            lastName: 'Doe',
            smoker: true,
            comment: 'Favorite User'
        };
        var console = Dom.el('div', 'console');
        var form = new GenericForm(
            person,
            {comment: {type: 'textarea'}},
            function(){
                console.innerHTML = "submit event: " + JSON.stringify(person);
            }
        );
        return Dom.el('div', 'sample', [form, console]);
    };

    GenericFormSamples.prototype.eventsExample = function() {
        var person = {
            firstName: 'John',
            lastName: 'Doe',
            smoker: true
        };
        var console = Dom.el('div', 'console');
        var form = new GenericForm(
            person,
            {
                firstName: {listeners: function(event){
                    console.innerHTML = "If listeners is function, it will listen 'onchange' event: " + JSON.stringify({firstName: person.firstName});
                }},
                lastName: {listeners: {onkeyup: function(event){
                    console.innerHTML = "data in person object will be updated only after 'onchange' event.<br/>" +
                        "So, actual data stored in input<br/>" +
                        "lastName onkeyup event: " + JSON.stringify({lastName: form.fields.lastName.getValue()}) + "<br/>" +
                        "person object: " + JSON.stringify(person);
                }}}
            },
            function(){
                console.innerHTML = "submit event: " + JSON.stringify(person);
            }
        );
        return Dom.el('div', 'sample', [form, console]);
    };


    GenericFormSamples.prototype.ignoreExample = function() {
        var person = {
            id: 1,
            isNew: false,
            firstName: 'John',
            lastName: 'Doe',
            smoker: true
        };
        var console = Dom.el('div', 'console');
        var form = new GenericForm(
            person,
            {
                id: false,
                isNew: {ignore: true}
            },
            function(){
                console.innerHTML = "submit event: " + JSON.stringify(person);
            }
        );
        return Dom.el('div', 'sample', [form, console]);
    };



    return GenericFormSamples;
});