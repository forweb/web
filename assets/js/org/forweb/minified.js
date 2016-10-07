var Engine = (function(){

    var modules = {};
    var afterModuleLoad = {};
    var loaded = {};

    function Notification(message, type, time) {
        if(!document.body) {
            console.log(message);
            return;
        }
        if(!type)type = 'S';
        if(!time)time = 3000;
        var container = document.createElement('div');
        var style = "padding:10px;margin:5px;border-radius: 3px;";
        switch (type) {
            case 'S':
                style += 'color:#3c763d;background-color:#dff0d8;border-color:#d6e9c6;';
                break;
            case 'I':
                style += 'color: #31708f;background-color: #d9edf7;border-color: #9acfea;';
                break;
            case 'W':
                style += 'color: #8a6d3b;background-color: #fcf8e3;border-color: #f5e79e;';
                break;
            case 'E':
                style += 'color:#a94442;background-color:#f2dede;border-color:#ebccd1;';
                break;
            default:
                throw 'Undefined message type: ' + type;
        }
        container.setAttribute('style', style);
        container.innerHTML = message;
        Notification.container.appendChild(container);
        if(Notification.container.parentNode == null) {
            document.body.appendChild(Notification.container);
        }
        setTimeout(function(){
            container.remove();
            if(Notification.container.innerHTML === '') {
                Notification.container.remove();
            }
        }, time)
    }
    Notification.container = document.createElement('div');
    Notification.container.setAttribute('style', 'position: fixed; right: 0; top: 0; width: 200px;');


    var Engine = {
        pathBuilder: null,
        limit: 500,
        log: true,
        modules: {},
        load: function (module, clb) {
            if (modules[module]) {
                clb();
            } else {
                if (!afterModuleLoad[module]) {
                    afterModuleLoad[module] = [];
                }
                afterModuleLoad[module].push(clb);
                _load(module);
            }
        },
        define: function (name, imports, module) {
            if (!module) {
                //module have no dependencies, can be initialized by default
                _initModule(name, imports, []);
                return;
            } else if (!imports) {
                imports = [];
            }
            var i;
            var requirements = [];
            if (imports) {
                if (typeof imports === 'string') {
                    if (!modules[imports]) {
                        requirements.push(imports);
                    }
                } else {
                    for (i = 0; i < imports.length; i++) {
                        if (modules[imports[i]] === undefined) {
                            requirements.push(imports[i]);
                        }
                    }
                }
            }
            if (requirements.length > 0) {
                var clb = function () {
                    Engine.define(name, imports, module);
                };
                clb.toString = function () {
                    return "Callback for " + name + " when all dependencies resolved";
                };
                _loadClasses(name, requirements, clb);
            } else {
                var args = [];
                if (imports) {
                    if (typeof imports === 'string') {
                        args = [Engine.require(imports)];
                    } else {
                        for (i = 0; i < imports.length; i++) {
                            args.push(Engine.require(imports[i]));
                        }
                    }
                }
                _initModule(name, module, args);
            }
        },
        require: function (name) {
            if (modules[name] === undefined) {
                throw "Module not instantiated " + name;
            } else {
                return modules[name];
            }
        },
        notify: function (message, type, time) {
            new Notification(message, type, time);
        },
        findPath: function(module) {
            var out;
            if(typeof Engine.pathBuilder === 'function') {
                out = Engine.pathBuilder(module);
                if(out) {
                    return out;
                }
            } else {
                for (var i = 0; i < Engine.pathBuilder.length; i++) {
                    var pathBuilder = Engine.pathBuilder[i];
                    out = pathBuilder.buildPath(module);
                    if (out) {
                        return out;
                    }
                }
            }
            throw "Can't find module " + module;
        }
    };


    function _load(module, clb) {
        var path;
        if (Engine.pathBuilder !== null) {
            path = Engine.findPath(module);
        } else {
            path = "assets/js/" + module + ".js";
        }
        if (!path) {
            throw "Can't load module " + module + " because path is undefined ";
        } else {
            var script = document.createElement('script');
            script.onload = clb;
            script.src = path;
            document.getElementsByTagName('head')[0].appendChild(script);
        }
    }

    function _initModule (name, module, arguments) {
        if (typeof module === 'function') {
            modules[name] = module.apply(window, arguments);
        } else {
            modules[name] = module;
        }
        if (loaded[name] && loaded[name].deferredCallbacks) {
            for (var i = loaded[name].deferredCallbacks.length - 1; i >= 0; i--) {
                //after this deferred callbacks queue must be cleaned
                (loaded[name].deferredCallbacks.pop())();
            }
        }
        if (afterModuleLoad[name]) {
            for (var j = 0; j < afterModuleLoad[name].length; j++) {
                (afterModuleLoad[name].pop())();
            }
        }
    }
    function _loadClasses (parentName, requirements, callback) {
        Engine.limit--;
        if (Engine.limit < 1) {
            throw "Something wrong, too much modules in project! It look like circular dependency. Othervise, please change Engine.limit property";
        }
        if (requirements.length === 0) {
            callback();
        } else {
            var module = requirements.pop();
            var dependencyCallback = function () {
                _loadClasses(parentName, requirements, callback);
            };
            dependencyCallback.toString = function () {
                return "Callback for " + parentName;
            };

            if (!loaded[module]) {
                loaded[module] = {
                    afterLoad: dependencyCallback,
                    callers: [],
                    deferredCallbacks: []
                };
                _load(module, function () {
                    if(Engine.log) {
                        Engine.notify("Script " + module + " was loaded as dependency for: " + parentName, 'S');
                    }
                    loaded[module].afterLoad();
                });

            } else if (modules[module]) {
                dependencyCallback();
            } else if (loaded[module].callers.indexOf(parentName) === -1) {
                loaded[module].callers.push(parentName);
                loaded[module].deferredCallbacks.push(dependencyCallback);
            }
        }
    }

    return Engine;
})();

Engine.define('Ajax', (function () {
    var out = {
        /**
         * @var object with key-value pairs with default ajax headers
         */
        headers: null
    };
    out.ajax = function (data, resolve, reject) {
        var xhr = out.getXhr();
        xhr.open(data.type, data.url, true);
        var headers = out.headers;
        if (headers) {
            for (var i in headers) {
                if (headers.hasOwnProperty(i)) {
                    xhr.setRequestHeader(i, headers[i]);
                }
            }
        }
        xhr.onload = function () {
            if (xhr.status == 200) {
                resolve(out.process(xhr, data.responseType), xhr);
            } else if (reject) {
                reject(xhr)
            }
        };
        xhr.send(data.data);
        return xhr;
    };
    out.process = function (xhr, t) {
        var response = xhr.responseText;
        if(t === 'text' || !response) {
            return response;
        } else {
            return JSON.parse(xhr.responseText);
        }
    };
    /**
     * @returns XMLHttpRequest
     */
    out.getXhr = function () {
        var xmlhttp = null;
        try {
            xmlhttp = new XMLHttpRequest();
        } catch (e) {
            try {
                xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                try {
                    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (E) {
                    alert('Hey man, are you using browser?');
                }
            }
        }
        return xmlhttp;
    };
    return out;
}));

Engine.define('Rest', 'Ajax', (function () {
    var Ajax = Engine.require('Ajax');

    var Rest = {
        host: null
    };
    Rest.doGet = function (url, responseType) {
        return Rest._onRequest(url, 'get', null, responseType)
    };
    Rest.doPost = function (url, data, responseType) {
        return Rest._onRequest(url, 'post', data, responseType)
    };
    Rest.doPut = function (url, data, responseType) {
        return Rest._onRequest(url, 'put', data, responseType)
    };
    Rest.doDelete = function (url, data, responseType) {
        return Rest._onRequest(url, 'delete', data, responseType)
    };
    Rest._onRequest = function (url, type, data, responseType) {
        if (Rest.host !== null) {
            url = Rest.host + url;
        }
        return new Promise(function (resolve, reject) {
            Ajax.ajax({
                responseType: responseType ? responseType : 'json',
                type: type,
                url: url,
                data: typeof data === 'string' || typeof data === 'number' ? data : JSON.stringify(data)
            }, resolve, reject)
        })
    };
    return Rest;
}));

Engine.define("Config", (function () {
    function Config(configName) {
        this.configName = configName;
        try {
            this.storage = JSON.parse(localStorage.getItem(configName));
        } catch (e) {
            this.storage = null;
        }
        if (this.storage == null) {
            this.storage = {};
        }
    }
    Config.prototype.get = function (name) {
        return this.storage[name];
    };
    Config.prototype.has = function(name) {
        return this.get(name) !== undefined;
    };
    Config.prototype.set = function (name, value) {
        this.storage[name] = value;
        localStorage.setItem(this.configName, JSON.stringify(this.storage));
    };
    Config.prototype.remove = function (name) {
        delete(this.storage[name]);
        localStorage.setItem(this.configName, JSON.stringify(this.storage));
    };
    Config.prototype.toString = function() {
        return 'Config instance';
    };
    return Config;
}));
Engine.define('Dom', (function () {
    var Dom = {};
    /**
     * @param type string
     * @param attr object|null
     * @param content string|Element|Element[]
     * @returns {Element}
     */
    Dom.el = function (type, attr, content) {
        var o = document.createElement(type);
        Dom.update(o, attr);
        Dom.append(o, content);
        return o;
    };
    Dom.addClass = function (el, clazz) {
        if (el.className) {
            if (el.className.indexOf(clazz) === -1) {
                el.className += ' ' + clazz;
            } else if (el.className.split(' ').indexOf(clazz) === -1) {
                el.className += ' ' + clazz;
            }
        } else {
            el.className = clazz;
        }
    };
    Dom.removeClass = function (el, clazz) {
        var cl = el.className;
        if (cl && cl.indexOf(clazz) > -1) {
            var p = cl.split(' ');
            var i = p.indexOf(clazz);
            if (i > -1) {
                p.splice(i, 1);
                el.className = p.join(' ');
            }
        }
    };
    Dom.hasClass = function (el, clazz) {
        var cl = el.className;
        if (cl.indexOf(clazz) > -1) {
            return cl.split(' ').indexOf(clazz) > -1;
        } else {
            return false;
        }
    };
    Dom.id = function (id) {
        return document.getElementById(id);
    };
    Dom.update = function (el, attr) {
        if (typeof attr === 'string') {
            el.className = attr;
        } else if (attr)for (var i in attr) {
            if (!attr.hasOwnProperty(i))continue;
            if (typeof attr[i] == 'function') {
                var key = i;
                if (key.indexOf("on") === 0) {
                    key = key.substring(2);
                }
                el.addEventListener(key, attr[i]);
            } else {
                el.setAttribute(i, attr[i])
            }
        }
    };
    Dom.append = function (o, content) {
        if (content) {
            if (typeof content === 'string' || typeof content === 'number') {
                o.appendChild(document.createTextNode(content + ""));
            } else if (content.length && content.push && content.pop) {
                for (var i = 0; i < content.length; i++) {
                    var child = content[i];
                    if (child) {
                        Dom.append(o, child);
                    }
                }
            } else {
                o.appendChild(content)
            }
        }
    };
    function iterateListeners(el, listeners, clb) {
        for(var key in listeners) {
            if(!listeners.hasOwnProperty(key))continue;
            var wrapper = listeners[key];
            var listnerName = key.indexOf('on') === 0 ? key.substring(2) : key;
            if(typeof wrapper === "function") {
                clb(el, listnerName, wrapper)
            } else {
                for(var i = 0; i < wrapper.length; i++) {
                    clb(el, listnerName, wrapper[i]);
                }
            }
        }
    }
    Dom.addListeners = function(el, listeners) {
        if(!listeners) {
            listeners = el;
            el = window;
        }
        iterateListeners(el, listeners, function(el, key, listener){
            el.addEventListener(key, listener, false);
        })
    };
    /**
     * Remove event listners
     * @param el Node|object
     * @param listeners object|null
     */
    Dom.removeListeners = function(el, listeners) {
        if(!listeners) {
            listeners = el;
            el = window;
        }
        iterateListeners(el, listeners, function(el, key, listener){
            el.removeEventListener(key, listener, false);
        })
    };

    Dom.calculateOffset = function (elem) {
        var top = 0, left = 0;
        if (elem.getBoundingClientRect) {
            var box = elem.getBoundingClientRect();

            var body = document.body;
            var docElem = document.documentElement;

            var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
            var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

            var clientTop = docElem.clientTop || body.clientTop || 0;
            var clientLeft = docElem.clientLeft || body.clientLeft || 0;

            top = box.top + scrollTop - clientTop;
            left = box.left + scrollLeft - clientLeft;

            return {top: Math.round(top), left: Math.round(left)}
        } else {
            while (elem) {
                top = top + parseInt(elem.offsetTop);
                left = left + parseInt(elem.offsetLeft);
                elem = elem.offsetParent
            }
            return {top: top, left: left}
        }
    };
    Dom.insert = function(el, content, before) {
        if(el.innerHTML === '') {
            Dom.append(el, content);
            return;
        }
        if(!before)before = el.childNodes[0];

        if (content) {
            if (typeof content === 'string' || typeof content === 'number') {
                el.insertBefore(document.createTextNode(content + ""), before);
            } else if (content.length && content.push && content.pop) {
                for (var i = 0; i < content.length; i++) {
                    var child = content[i];
                    if (child) {
                        Dom.insert(el, child, before);
                    }
                }
            } else {
                el.insertBefore(content, before);
            }
        }
    };
    Dom.animate = function (el, values, time, frame, clb, timeToWait) {
        if (!timeToWait)timeToWait = 0;
        if (!frame)frame = 10;

        var animate = function (el, values, time, frame) {
            var intervals = [];
            for (var style in values) {
                if (!values.hasOwnProperty(style))continue;

                var from = el.style[style];
                if (!from && from !== 0) {
                    from = getComputedStyle(el)[style];
                }
                if (!from) {
                    el.style[style] = 0;
                    from = 0;
                } else {
                    from = parseInt(from);
                }
                var to = values[style];
                (function (style, from, step) {
                    el.style[style] = from + 'px';
                    intervals.push(setInterval(function () {
                        from += step;
                        el.style[style] = from + 'px';
                    }, frame));
                })(style, from, (to - from) * frame / time);
            }
            setTimeout(function () {
                for (var i = 0; i < intervals.length; i++) {
                    clearInterval(intervals[i]);
                }
            }, time);
        };
        setTimeout(function () {
            animate(el, values, time, frame, clb)
        }, timeToWait);

        timeToWait += time;

        return {
            animate: function (el, values, time, frame, clb) {
                return Dom.animate(el, values, time, frame, clb, timeToWait);
            },
            then: function (clb) {
                setTimeout(function(){clb()}, timeToWait);
            }
        };
    };
    return Dom
}));
Engine.define('KeyboardUtils', {
    translateButton: function(code) {
        switch (code) {
            case 9: return 'tab';
            case 13: return 'enter';
            case 16: return 'shift';
            case 17: return 'ctrl';
            case 18: return 'alt';
            case 20: return 'caps lock';
            case 27: return 'esc';
            case 32: return 'space';
            case 33: return 'pg up';
            case 34: return 'pg dn';
            case 35: return 'end';
            case 36: return 'home';
            case 37: return 'ar left';
            case 38: return 'ar top';
            case 39: return 'ar right';
            case 40: return 'ar bottom';
            case 45: return 'ins';
            case 46: return 'del';
            case 91: return 'super';
            case 96: return 'num 0';
            case 97: return 'num 1';
            case 98: return 'num 2';
            case 99: return 'num 3';
            case 100: return 'num 4';
            case 101: return 'num 5';
            case 102: return 'num 6';
            case 103: return 'num 7';
            case 104: return 'num 8';
            case 105: return 'num 9';
            case 106: return '*';
            case 107: return '+';
            case 109: return '-';
            case 111: return '/';
            case 112: return 'f2';
            case 113: return 'f3';
            case 114: return 'f4';
            case 115: return 'f5';
            case 116: return 'f6';
            case 117: return 'f7';
            case 119: return 'f8';
            case 120: return 'f9';
            case 121: return 'f10';
            case 122: return 'f11';
            case 123: return 'f12';
            case 144: return 'num lock';
            case 186: return ';';
            case 187: return '=';
            case 188: return ',';
            case 189: return '-';
            case 190: return '.';
            case 191: return '/';
            case 192: return '~';
            case 219: return '[';
            case 220: return '\\';
            case 221: return ']';
            case 222: return '\'';
            default: return String.fromCharCode(code);
        }
    }
});
Engine.define('ScreenUtils', {
    window: function () {
        var e = window, a = 'inner';
        if (!( a + 'Width' in window )) {
            a = 'client';
            e = document.documentElement || document.body;
        }
        return {width: e[ a+'Width' ], height : e[ a+'Height' ]};
    },
    monitor: function () {
        return {width: outerWidth, height: outerHeight}
    }
});
Engine.define('StringUtils', (function () {

    var NORMAL_TEXT_REGEXP = /([a-z])([A-Z])/g;
    var REMOVE_FIRST_LAST_SLASHES = /^(\/)|(\/)$/g;
    var LOW_DASH = /\_/g;
    var DASH = /\-/g;

    var StringUtils = {
        unique: function (l) {
            return Math.random().toString(36).substring(2, l ? l + 2 : 7);
        },
        removeSlashes: function (str){
            return str.replace(REMOVE_FIRST_LAST_SLASHES, '');
        },
        capitalize: function(str){
            if(!str)return str;
            return str[0].toUpperCase() + str.substring(1);
        },
        normalizeText: function(str, glue){
            if(glue === undefined) {
                glue = ' ';
            }
            if(!str)str = '';
            if(str.indexOf('_') > -1) {
                str = str.replace(LOW_DASH, ' ');
            }
            if(str.indexOf('-') > -1) {
                str = str.replace(DASH, ' ');
            }
            if(str.match(NORMAL_TEXT_REGEXP)) {
                str = str.replace(NORMAL_TEXT_REGEXP, '$1 $2');
            }
            if(str.indexOf(' ') > -1) {
                var p = str.split(' ');
                var out = '';
                for (var i = 0; i < p.length; i++) {
                    if (!p[i])continue;
                    out += StringUtils.capitalize(p[i]) + (i !== p.length - 1 ? glue : '');
                }
                return out;
            } else {
                return StringUtils.capitalize(str);
            }
        }
    };

    return StringUtils;
}));
Engine.define('UrlUtils', 'StringUtils', function(){
    var StringUtils = Engine.require('StringUtils');

    var UrlUtils = {
        /**
         * Get path from document.location without trailing slashes
         * example:
         * (without arguments)
         * http://mysite.com/some/path/here/
         * UrlUtils.getPath() => some/path/here
         *
         * (with argument)
         * http://mysite.com/some/path/here/
         * UrlUtils.getPath(1) => some
         * UrlUtils.getPath(2) => path
         *
         * @returns string
         */
        getPath: function (index) {
            var path = StringUtils.removeSlashes(document.location.pathname);
            if(index) {
                return path.split('/')[index - 1];
            } else {
                return path;
            }
        },
        /**
         * Fetch query value from document.location
         *
         * example:
         * http://mysite.com?param=argument
         * UrlUtils.getQuery('param') => argument  (decoded)
         *
         * @param paramName
         * @returns string|null
         */
        getQuery: function(paramName) {
            var queryString = document.location.search.replace(QUESTION_CHAR, '');
            var queryArray = queryString.split('&');
            if(queryArray.length > 0) {
                var eqParamName = paramName + "=";
                for(var i = 0; i < queryArray.length; i++) {
                    if(queryArray[i].indexOf(eqParamName) === 0) {
                        return decodeURIComponent(queryArray[i].substring(eqParamName.length));
                    } else if(queryArray[i] === eqParamName || queryArray[i] === paramName) {
                        return "";
                    }
                }
            }
            return null;
        },

        appendQuery: function(name, value) {
            var path = UrlUtils.getPath();
            var oldValue = UrlUtils.getQuery(name);
            name = encodeURIComponent(name);
            var eqName = name + "=";
            var append = value || value === 0 ? eqName + encodeURIComponent(value) : name;

            var search = document.location.search;
            if(oldValue === null && search === "") {
                search = "?" + append;
            } else {
                var parts = search.replace(/^\?/, '').split("&");
                var done = false;
                if(search.indexOf(name) > -1) {
                    for (var i = parts.length - 1; i >= 0; i--) {
                        if (parts[i].indexOf(eqName) === 0 || parts[i] === name) {
                            parts[i] = append;
                            done = true;
                            break;
                        }

                    }
                }
                if(!done) {
                    parts.push(append);
                }
                search = "?" + parts.join("&");
            }
            history.push(path + search);
        },
        removeQuery: function(paramName){
            if(paramName) {
                var queryString = document.location.search.replace(QUESTION_CHAR, '');
                var queryArray = queryString.split('&');
                if(queryArray.length > 0) {
                    var eqParamName = paramName + "=";
                    for(var i = 0; i < queryArray.length; i++) {
                        if(queryArray[i].indexOf(eqParamName) === 0 || queryArray[i] === paramName) {
                            queryArray.splice(i, 1);
                            var path = UrlUtils.getPath();
                            history.push(path + (queryArray.length ? "?" + queryArray.join("&") : ''));
                            break;
                        }
                    }

                }
            }
        }
    };
    return UrlUtils;
});
Engine.define('Tabs', ['Dom'], (function(Dom) {

    var Tabs = function () {
        this.header = Dom.el('div', 'tabs-header');
        this.content = Dom.el('div', 'tabs-body');
        this.container = Dom.el('div', 'tabs', [this.header, this.content]);
        this.tabs = [];
    };
    Tabs.prototype.addTab = function (name, content) {
        var active = !this.tabs.length;
        var tab = {
            title: Dom.el('a', {href: '#', 'class': 'tab-name ' + (active ? 'active' : '')}, name),
            body: Dom.el('div', 'tab-content' + (active ? '' : ' hidden'), content)
        };
        this.tabs.push(tab);
        var me = this;
        tab.title.onclick = function (e) {
            e.preventDefault();
            for (var i = 0; i < me.tabs.length; i++) {
                Dom.addClass(me.tabs[i].body, 'hidden');
                Dom.removeClass(me.tabs[i].title, 'active');
            }
            Dom.removeClass(tab.body, 'hidden');
            Dom.addClass(tab.title, 'active');
        };
        this.header.appendChild(tab.title);
        this.content.appendChild(tab.body);
        return this.tabs.length - 1;
    };
    Tabs.prototype.removeTab = function (index) {
        var tab = this.tabs.splice(index, 1);
        tab.title.remove(true);
        tab.body.remove(true);
    };
    return Tabs;
}));
Engine.define('Pagination', ['Dom'], (function (Dom) {

    var Pagination = function (onOpenPage, pageNumber) {
        if (!onOpenPage || !pageNumber) {
            throw "Pagination instantiation error";
        }
        var me = this;
        this.refreshButton = Dom.el('input', {type: 'button', value: "Refresh"});
        this.refreshButton.onclick = function (e) {
            me.refresh(e)
        };

        this.page = Dom.el('input', {type: 'text', value: pageNumber});
        this.page.onkeyup = function (e) {
            me.onChange(e)
        };
        this.pageNumber = pageNumber;
        this.onOpenPage = onOpenPage;

        this.previousButton = Dom.el('input', {type: 'button', value: 'Previous page'});
        this.previousButton.onclick = function (e) {
            me.previous(e)
        };

        this.nextButton = Dom.el('input', {type: 'button', value: 'Next page'});
        this.nextButton.onclick = function (e) {
            me.next(e)
        };

        this.container = Dom.el(
            'form',
            {'class': 'pagination'},
            [this.refreshButton, this.previousButton, this.page, this.nextButton]
        );
        this.container.onsubmit = function (e) {
            me.refresh(e)
        };
    };
    Pagination.prototype.refresh = function (e) {
        if (e)e.preventDefault();
        this.openPage(this.pageNumber);
    };
    Pagination.prototype.previous = function (e) {
        if (e)e.preventDefault();
        this.openPage(this.pageNumber > 1 ? this.pageNumber - 1 : 1);
    };
    Pagination.prototype.next = function (e) {
        if (e)e.preventDefault();
        this.openPage(this.pageNumber + 1);
    };
    Pagination.prototype.openPage = function (page) {
        this.pageNumber = page;
        this.page.value = page;
        this.onOpenPage(page)
    };
    Pagination.prototype.regexp = /^\d*$/;

    Pagination.prototype.onChange = function () {
        if (this.regexp.test(this.page.value)) {
            this.pageNumber = parseInt(this.page.value);
            this.openPage(this.pageNumber);
        } else {
            this.page.value = this.pageNumber;
        }
    };
    return Pagination;
}));
Engine.define('Popup', ['Dom', 'ScreenUtils'], function () {

    var Dom = Engine.require('Dom');
    var ScreenUtils = Engine.require('ScreenUtils');

    var zIndex = 1000;
    var style = 'position:fixed;z-index' + zIndex + ';left:0;top:0;width:100%;height:100%;background: rgba(0,0,0,0.4)';
    var overlay = Dom.el('div', {style: style});
    var overlayShown = false;
    var count = 0;

    function Popup(params) {
        params = params || {};
        var me = this;
        this.title = Dom.el('div', null, params.title);
        this.isOpen = params.isOpen || false;
        this.minimized = params.minimized || false;
        this.withOverlay = params.withOverlay !== false;
        this.drag = {
            active: false,
            x: 0,
            y: 0,
            mx: 0,
            my: 0
        };
        this.listeners = {
            onmousemove: function (e) {
                me.onMouseMove(e);
            },
            onkeyup: function (e) {
                me.onKeyUp(e);
            }
        };

        this.initHeader(params);

        this.body = Dom.el('div', 'panel-body' + (this.minimized ? ' minimized' : ''), params.content);
        this.container = Dom.el('div', {class: 'Popup panel'}, [this.header, this.body]);
        if (params.isOpen) {
            this.show()
        }
    }


    Popup.prototype.initHeader = function (params) {
        var buttons = Dom.el('div', 'control-buttons', [

            params.controlMinimize === false ? null :
                Dom.el('button', {
                        class: 'success small Popup-minimize',
                        onclick: function () {
                            if (me.minimized) {
                                Dom.removeClass(me.container, 'minimized')
                            } else {
                                Dom.addClass(me.container, 'minimized')
                            }
                            me.minimized = !me.minimized;
                        }
                    },
                    Dom.el('span', null, '_')
                ),
            params.controlClose === false ? null : Dom.el('button', {
                    class: 'danger small Popup-close',
                    onclick: function () {
                        me.hide();
                    }
                },
                Dom.el('span', null, 'x')
            )
        ]);
        var content = [
            buttons,
            this.title
        ];
        this.header = Dom.el('div', 'panel-heading', content);
        var me = this;
        Dom.addListeners(this.header, {
            onmousedown: function (e) {
                if (e) {
                    e.preventBubble = true;
                    e.stopPropagation();
                    e.preventDefault();
                }
                me.onDragStart(e);
            },
            onmouseup: function (e) {
                if (e) {
                    e.preventBubble = true;
                    e.stopPropagation();
                    e.preventDefault();
                }
                me.onDragEnd();
            }
        });
    };
    Popup.prototype.onMouseMove = function (e) {
        if (this.drag.active) {
            var b = document.body;
            this.container.style.left = this.drag.x + (e.clientX - this.drag.mx + b.scrollLeft) + 'px';
            this.container.style.top = this.drag.y + (e.clientY - this.drag.my + b.scrollTop) + 'px';
        }
    };
    Popup.prototype.onDragEnd = function (e) {
        this.drag.active = false;
    };
    Popup.prototype.onDragStart = function (e) {
        if (!this.drag.active) {
            this.drag.active = true;
            this.drag.x = parseInt(this.container.style.left);
            this.drag.y = parseInt(this.container.style.top);

            var b = document.body;
            this.drag.mx = e.clientX + b.scrollLeft;
            this.drag.my = e.clientY + b.scrollTop;
        }
    };
    Popup.prototype.show = function () {
        if (this.withOverlay && !overlayShown) {
            document.body.appendChild(overlay);
        }
        count++;
        this.container.style.zIndex = ++zIndex;
        document.body.appendChild(this.container);
        Dom.addListeners(this.listeners);
        if(!this.isOpen) {
            this.isOpen = true;
            this.container.style.top = (document.body.scrollTop + 30) + 'px';
            this.container.style.left = ((ScreenUtils.window().width - this.container.offsetWidth) / 2) + 'px'
        }
    };
    Popup.prototype.setContent = function (content) {
        this.body.innerHTML = '';
        Dom.append(this.body, content);
    };
    Popup.prototype.setTitle = function (content) {
        this.title.innerHTML = '';
        Dom.append(this.title, content)
    };
    Popup.prototype.onKeyUp = function (e) {
        if (this.isOpen && e.keyCode == 27) {
            e.preventDefault();
            this.hide();
        }
    };
    Popup.prototype.hide = function () {
        count--;
        this.isOpen = false;
        if (count < 0) {
            count = 0;
        }
        if (count === 0) {
            overlay.remove();
        }
        this.container.remove();
        Dom.removeListeners(this.listeners);
    };

    Popup.getParams = function () {
        return {
            isOpen: false,
            minimized: false,
            content: null,
            title: null,
            controlClose: true,
            controlMinimize: true,
            withOverlay: true
        }
    };

    return Popup;
});
Engine.define('Menu', ['Dom', 'StringUtils'], function(Dom, StringUtils){

    function Menu(defaultCallback, params){
        this.container = Dom.el('div', params || 'menu');
        this.defaultCallback = defaultCallback;
        this.menus = [];
    }

    Menu.prototype.hide = function() {
        Dom.addClass(this.container, 'hidden');
    };
    Menu.prototype.show = function() {
        Dom.removeClass(this.container, 'hidden');
    };
    Menu.prototype.diactivateAll = function() {
        for(var i = 0; i < this.menus.length; i++) {
            Dom.removeClass(this.menus[i], 'active');
        }
    };

    Menu.prototype.menu = function(className, label, callback, _parentActivate) {
        var me = this;
        if(typeof label === 'function' && !callback) {
            callback = label;
            label = null;
        }
        if(className && !label) {
            label = StringUtils.normalizeText(className);
        }
        if(!callback && this.defaultCallback) {
            callback = this.defaultCallback;
        }
        var link = null;
        var item = Dom.el('div', 'menu-item');
        this.menus.push(item);
        var activate = function(e){
            if(!_parentActivate) {
                e.preventDefault();
                me.diactivateAll();
            } else {
                _parentActivate(e);
            }
            Dom.addClass(item, 'active');
        };
        if(className) {
            var params = {href: '/' + StringUtils.normalizeText(className, '-')};
            params.onclick = function (e) {
                activate(e);
                if (callback) {
                    callback(className, e);
                }
            };
            link = Dom.el('a', params, label);
            item.appendChild(link);
        }
        var subMenuHolder = null;

        this.container.appendChild(item);
        return {
            menu: function (cn, l, c) {
                return me.menu(cn, l, c, activate);
            },
            subMenu: function (cn, l, c) {
                var out = me.menu(cn, l, c, activate);
                if(subMenuHolder === null) {
                    subMenuHolder = Dom.el('ul');
                    item.appendChild(subMenuHolder);
                }
                var childActivate = out.activate;
                out.activate = function (e) {
                    activate(e);
                    childActivate(e);
                };
                if(out.link) {
                    // Dom.removeListeners(out.link, {onclick: oldActivate});
                    Dom.addListeners(out.link, {onclick: activate});
                }
                subMenuHolder.appendChild(Dom.el('li', 'submenu', out.item));
                return out;
            },
            item: item,
            link: link
        }
    };
    return Menu;
});
Engine.define('Grid', ['Dom', 'Pagination', 'StringUtils'], function(){

    var Dom = Engine.require('Dom');
    var Pagination = Engine.require('Pagination');
    var StringUtils = Engine.require('StringUtils');

    function Grid(params){
        var me = this;
        this.header = Dom.el('thead');
        this.body = Dom.el('tbody');
        this.footer = Dom.el('tfoot');
        if(!params.columns) {
            throw 'columns is required parameter for grid';
        }
        var attr = {};
        this.params = params;

        if(params.class) {
            attr.class = params.class;
        }
        if(params.id) {
            attr.id = params.id;
        }
        this.table = Dom.el('table', null, [this.header, this.body, this.footer]);
        if(params.data) {
            this.data = params.data;
        } else {
            this.data = [];
        }
        var pagination = null;
        if(params.onOpenPage) {
            this.pagination = new Pagination(function(page){
                params.onOpenPage(
                    page
                ).then(function(info){
                    me.data = info.data;
                    me.update();
                })
            }, params.page || 1);
            pagination = this.pagination.container;
            this.pagination.refresh();
        }
        this.fullUpdate();
        this.container = Dom.el('div', null, [pagination, this.table]);
    }

    Grid.prototype.buildRow = function(index){
        if(this.params.rowRender) {
            return this.params.rowRender(index);
        } else {
            var cl = index % 2 ? 'odd' : 'even';
            return Dom.el('tr', cl);
        }
    };
    Grid.prototype.fullUpdate = function(){
        this.update();
        var params = this.params;
        if(params.class) {
            Dom.addClass(this.container, this.params.class);
        }
        if(params.id) {
            Dom.update(this.container, {id: params.id})
        }
        this.header.innerHTML = '';
        this.footer.innerHTML = '';
        var header = Dom.el('tr');
        var footer = Dom.el('tr');
        for(var i = 0; i < this.params.columns.length; i++) {
            var col = this.params.columns[i];
            var title = col.title || StringUtils.normalizeText(col.name);
            Dom.append(header, Dom.el('th', null, title));
            if(col.footer){
                Dom.append(footer, col.footer);
            }
        }
        this.header.appendChild(header);
        if(footer.innerHTML) {
            this.footer.appendChild(footer);
        }
    };
    Grid.prototype.update = function(){
        this.body.innerHTML = '';
        var cols = this.params.columns;
        var ds = this.data;
        for(var r = 0; r < ds.length; r++) {
            var row = this.buildRow(r);
            for(var c = 0; c < cols.length; c++) {
                var col = cols[c];
                var data = ds[r][col.name];
                if(col.render) {
                    Dom.append(row, Dom.el('td', col.class, col.render(data, ds[r])));
                } else {
                    Dom.append(row, Dom.el('td', col.class, data));
                }
            }
            Dom.append(this.body, row);
        }
    };


    return Grid;
});
Engine.define("AbstractInput", ['Dom', 'StringUtils'], (function(Dom, StringUtils){

    function AbstractInput(params) {
        if(!params.name)throw "Name is reqired for input";
        this.input = Dom.el(this.getElementType(), this.prepareAttributes(params), this.prepareContent(params));
        this.label = this.buildLabel(params);
        this.container = Dom.el('div', 'formfield-holder ' + (params.class || ''), [this.label, this.input]);
        this.errors = null;
        this.errorsData = null;
    }

    AbstractInput.prototype.addError = function(errors) {
        if(this.errors === null) {
            this.errors = Dom.el('div', 'formfield-errors');
            this.container.appendChild(this.errors);
            this.errorsData = {};
        } else {
            this.errors.innerHTML = '';
        }
        if(typeof errors === 'string') {
            this.errorsData.custom = errors;
        } else {
            for(var ek in errors) {
                if(errors.hasOwnProperty(ek)) {
                    this.errorsData[ek] = errors[ek];
                }
            }
        }

        for(var k in this.errorsData) {
            if(this.errorsData.hasOwnProperty(k) && this.errorsData[k]) {
                this.errors.appendChild(Dom.el('div', 'err', this.errorsData[k]));
            }
        }
    };

    AbstractInput.prototype.buildLabel = function(params) {
        var content;
        if(params.noLabel === true) {
            content = null;
        } else if(params.label) {
            content = params.label;
        } else {
            content = StringUtils.normalizeText(params.name);
        }
        var attr = {};
        if(params.id) {
            attr.id = params.id;
        } else if(params.formId) {
            attr.id = params.formId + "_" + params.name;
        } else {
            attr.id = params.name;
        }
        return Dom.el('label', attr, content);
    };
    AbstractInput.prototype.getInputType = function() {
        throw "This function must be overrided";
    };
    AbstractInput.prototype.getElementType = function() {
        throw "This function must be overrided";
    };
    AbstractInput.prototype.prepareContent = function(params) {
        return null;
    };
    AbstractInput.prototype.prepareAttributes = function(params) {
        var out = {
            value: params.value || "",
            name: params.name,
            type: this.getInputType(),
            id: params.id || StringUtils.unique()
        };
        if(out.type === null) {
            delete out.type;
        }
        if(params.attr) {
            for(var key in params.attr) {
                if(params.attr.hasOwnProperty(key)) {
                    out[key] = params.attr[key];
                }
            }
        }
        for(var k in params) {
            if(!params.hasOwnProperty(k))continue;
            if(k.indexOf('on') === 0) {
                out[k] = params[k];
            }
        }
        return out;
    };

    AbstractInput.prototype.getValue = function() {
        return this.input.value;
    };
    AbstractInput.prototype.setValue = function(value) {
        this.input.value = value;
    };
    return AbstractInput;
}));
Engine.define('Checkbox', ['Dom', 'AbstractInput'], function(Dom, AbstractInput) {
    function Checkbox(params) {
        AbstractInput.apply(this, arguments);
        Dom.insert(this.label, this.input);
        this.input.checked = this._initChecked;
        delete(this._initChecked);
    }
    Checkbox.prototype = Object.create(AbstractInput.prototype);

    Checkbox.prototype.getElementType = function() {
        return 'input'
    };
    Checkbox.prototype.getInputType = function() {
        return 'checkbox';
    };

    Checkbox.prototype.getValue = function() {
        return this.input.checked;
    };
    Checkbox.prototype.setValue = function(value) {
        this.input.checked = value;
    };
    Checkbox.prototype.prepareAttributes = function(params) {
        var out = AbstractInput.prototype.prepareAttributes.apply(this, arguments);
        this._initChecked = !!params.value;
        delete out.value;
        return out;
    };
    Checkbox.prototype.constructor = Checkbox;
    return Checkbox;
});
Engine.define('FieldMeta', function(){
    function FieldMeta(params){
        if(!params)params = {};
        this.ignore = params.ignore || false;//this field will be ignored
        this.render = params.render || null;//render for current field. Should be component with container
        this.wrapper = params.wrapper || null;//if defined, all content will be putted inside of it. DOM node or function
        this.contentBefore = params.contentBefore || null;
        this.contentAfter = params.contentAfter || null;
        this.onchange = params.onchange || null;//callback function for onchange
        this.validations = params.validations || null;//validation rules
    }
    return FieldMeta;
});
Engine.define('Text', ['Dom', 'AbstractInput'], function(Dom, AbstractInput) {
    function Text(params) {
        AbstractInput.apply(this, arguments);
    }
    Text.prototype = Object.create(AbstractInput.prototype);

    Text.prototype.getElementType = function() {
        return 'input'
    };
    Text.prototype.getInputType = function() {
        return 'text';
    };
    Text.prototype.constructor = Text;
    return Text;
});
Engine.define('Select', ['Dom', 'AbstractInput'], function(Dom, AbstractInput) {
    function Select(params) {
        AbstractInput.apply(this, arguments);
        this.input.remove();
        delete this.input;

        this.params = params;
        this.options = params.options;
        this.update(params.value);
    }
    Select.prototype = Object.create(AbstractInput.prototype);
    Select.prototype.constructor = Select;

    Select.prototype.update = function(value) {
        this.input.innerHTML = '';
        for(var i = 0; i < this.options.length; i++) {
            var opt = this.options[i];
            var option = Dom.el('option', {value: opt.value}, opt.label);
            Dom.update(this.input, option);
        }
    };
    Select.prototype.getElementType = function() {
        return 'select'
    };
    Select.prototype.getInputType = function() {
        return null;
    };

    return Select;
});
Engine.define('Radio', ['Dom', 'AbstractInput'], function(Dom, AbstractInput) {
    function Radio(params) {
        AbstractInput.apply(this, arguments);
        this.input.remove();
        delete this.input;

        this.params = params;
        this.options = params.options;
        this.inputs = null;
        this.optionsContainer = Dom.el('div');
        this.update(params.value);
        this.container.appendChild(this.optionsContainer);
        Dom.insert(this.label, this.input);
    }
    Radio.prototype = Object.create(AbstractInput.prototype);
    Radio.prototype.constructor = Radio;

    Radio.prototype.update = function(value) {
        this.optionsContainer.innerHTML = '';
        this.inputs = [];
        var name = this.params.name;
        for(var i = 0; i < this.options.length; i++) {
            var opt = this.options[i];
            var input = Dom.el('input', {
                type: 'radio',
                id: name + "_" + opt.value,
                name: name,
                value: opt.value
            });
            if(opt.value === this.getValue() || opt.value === value) {
                input.checked = true;
            }
            var listeners = {};
            for(var key in this.params) {
                if(!this.params.hasOwnProperty(key))continue;
                if((key + "").indexOf('on') === 0 && typeof this.params[key] === 'function'){
                    listeners[key] = this.params[key];
                }
            }
            Dom.addListeners(input, listeners);
            this.inputs.push(input);
            this.optionsContainer.appendChild(
                Dom.el('label', {for: name + '_' + opt.value}, [input, opt.label])
            );
        }
    };
    Radio.prototype.getElementType = function() {
        return 'input'
    };
    Radio.prototype.getInputType = function() {
        return '';
    };

    Radio.prototype.getValue = function() {
        for(var i = 0; i < this.inputs.length; i++) {
            if(this.inputs[i].checked) {
                return this.inputs[i].value;
            }
        }
        return '';
    };
    return Radio;
});
Engine.define('Password', ['Dom', 'AbstractInput'], function(Dom, AbstractInput) {
    function Password(params) {
        AbstractInput.apply(this, arguments);
        this.showChars = params.showChars || false;
        var me = this;
        this.toggler = Dom.el('a', {href: '#', onclick: function(e){
            e.preventDefault();
            me.toggleInput();
        }}, [this.getTogglerContent()]);
        this.container.appendChild(this.toggler);
    }
    Password.prototype = Object.create(AbstractInput.prototype);

    Password.prototype.getElementType = function() {
        return 'input'
    };
    Password.prototype.toggleInput = function() {
        this.showChars = !this.showChars;
        this.input.type = this.getInputType();
        this.toggler.innerHTML = this.getTogglerContent();
    };
    Password.prototype.getTogglerContent = function() {
        return this.showChars ? 'Hide' : 'Show';
    };
    Password.prototype.getInputType = function() {
        return this.showChars ? 'text' : 'password';
    };
    Password.prototype.constructor = Password;
    return Password;
});
Engine.define('GenericForm', ['Dom', 'Text'], function(){

    var Dom = Engine.require('Dom');
    var Text = Engine.require('Text');

    function GenericForm(data, meta, onSubmit) {
        if(!onSubmit)throw 'onSubmit is required for generic form';
        var html = [];
        var me = this;
        this.fields = [];
        this.model = {};
        this.onSubmitSuccess = onSubmit;
        if(!meta) {
            meta = {};
        }
        this.meta = meta;
        for(var key in data) {
            if(!data.hasOwnProperty(key))continue;
            var value = data[key];
            this.model[key] = value;
            var field;
            if(meta[key]) {
                var m = meta[key];
                if(m.ignore)continue;
                field = m.render ?
                    (typeof m.render === "function" ? m.render(this.onChange, key, value) : m.render) :
                    this.buildText(key, value, m.onchange);
                this.fields.push(field);
                var content = [
                    typeof m.contentBefore === 'function' ? m.contentBefore(key, value) : m.contentBefore,
                    field.container,
                    typeof m.contentAfter === 'function' ? m.contentAfter(key, value) : m.contentAfter
                ];
                if(m.wrapper) {
                    if(typeof m.wrapper === 'function') {
                        html.push(m.wrapper(content, key, value));
                    } else {
                        Dom.append(m.wrapper(content));
                        html.push(m.wrapper);
                    }
                } else {
                    html = html.concat(content);
                }
            } else {
                field = this.buildText(key, value);
                this.fields.push(field);
                html.push(field.container)
            }
        }

        this.submit = Dom.el('div', null, Dom.el('input', {type: 'submit', class: 'primary', value: 'Submit'}));
        this.container = Dom.el('form', null, [html, this.submit]);
        this.container.onsubmit = function(e){
            me.onSubmit(e)
        }
    }

    GenericForm.prototype.onSubmit = function(e){
        if(e)e.preventDefault();
        if(this.validate) {
            this.onSubmitSuccess(this.model)
        }
    };
    GenericForm.prototype.validate = function(){
        if(this.meta) {
            for(var key in this.meta) {
                if(!this.meta.hasOwnProperty(key))continue;
                var m = this.meta[key];
                if(m.validations) {

                }
            }
            return true;
        } else {
            return true;
        }
    };
    GenericForm.prototype.onChange = function(key, value){
        this.model[key] = value;
    };
    GenericForm.prototype.buildText = function(key, value, onchange){
        var me = this;
        var out = new Text({name: key, value: value, onchange: function(e){
            me.onChange(key, out.getValue());
            if(onchange){
                onchange();
            }
        }});
        return out;
    };

    return GenericForm;
});

Engine.define('UrlResolver', ['StringUtils'], function(StringUtils) {
    /**
     *
     * @type {{app:string, data:[{dynamic:boolean,name:string}]}}
     */
    var mapping = [];
    return {
        regex: /(^\/)|(\/$)/,
        strategy: 'path',
        resolve: function (url) {
            url = StringUtils.removeSlashes(url);
            if(url === '') {
                url = 'home';
            }
            var parts = url.split('/');
            var params;
            var app = null;

            for(var k = 0; k < mapping.length; k++) {
                var compatible = false;
                params = {};
                var route = mapping[k];
                var data = route.data;
                if(data.length === parts.length || data[data.length - 1] === '*') {
                    compatible = true;
                    app = route.app;
                    params = {};
                    for (var i = 0; i < data.length; i++) {
                        var item = data[i];
                        if(item.dynamic) {
                            params[item.name] = parts[i];
                        } else if(item.name === parts[i] || item.name === '*'){
                        } else {
                            compatible = false;
                            break;
                        }
                    }
                }
                if(compatible) {
                    app = route.app;
                    break;
                } else {
                    params = {};
                    app = '';
                }
            }
            if(url === 'home') {
                url = '';
            }
            return {params: params, app: app, url: url};
        },
        addMapping: function(className, url){
            if(typeof className !== 'string' || typeof url !== 'string') {
                throw 'Invalid arguments exception';
            }
            var urlData = this.parseUrl(url);
            for(var i = 0; i< mapping; i++) {
                var data = mapping[i].data;
                var same = data.length === urlData.length;
                if(same) {
                    for(var d = 0; d < data.length; d++) {
                        var oldItem = data[d];
                        var newItem = urlData[d];
                        if(!oldItem.dynamic && !newItem.dynamic) {
                            if(oldItem.name !== newItem.name) {
                                same = false;
                                break;
                            }
                        }
                    }
                }
                if(same) {
                    throw "Can't put two items with same request mapping: " + url;
                }
            }
            mapping.push({
                app: className,
                data: urlData
            });
        },
        parseUrl: function(url){
            url = StringUtils.removeSlashes(url);
            var parts = url.split("/");
            var out = [];
            for(var i = 0; i < parts.length; i++) {
                var name = parts[i];
                var dynamic = name[0] == ':';
                if(dynamic) {
                    name =  name.substring(1);
                }
                out.push({name: name, dynamic: dynamic});
            }
            return out;
        }
    }
});
Engine.define('Dispatcher', ['Dom', 'UrlResolver', 'UrlUtils'], function () {

    var Dom = Engine.require('Dom');
    var UrlUtils = Engine.require('UrlUtils');
    var UrlResolver = Engine.require('UrlResolver');

    var Dispatcher = function(appNode, context, config, urlResolver){
        this.app = typeof appNode === 'string' ? Dom.id(appNode) : appNode;
        this.context = context || {};
        this.config = config || {};
        this.applications = {};
        this.applicationName = null;
        this.activeApplication = null;
        this.history = history;
        this.urlResolver = urlResolver || UrlResolver;
        var me = this;
        var openApplication = function(){
            if(me.urlResolver) {
                var path = UrlUtils.getPath();
                me.placeApplication(path);
            }
        };
        Dom.addListeners({onpopstate: openApplication});
        this.events = null;
    };

    Dispatcher.prototype.addMapping = function(className, url) {
        this.urlResolver.addMapping(className, url);
    };

    Dispatcher.prototype.addListener = function(name, listner) {
        if(!listner) {
            listner = name;
            name = 'afterOpen';
        }
        switch (name) {
            case 'beforeOpen':
            case 'afterOpen':
            case 'beforeClose':
            case 'afterClose':
                break;
            default:
                throw 'Unknown event: ' + name;
        }
        if(this.events === null) {
            this.events = {};
        }
        if(!this.events[name]) {
            this.events[name] = [];
        }
        this.events[name].push(listner);
    };

    Dispatcher.prototype.placeApplication = function (url, directives) {
        if(!url) {
            url = UrlUtils.getPath();
        }
        var me = this;
        var request = me.urlResolver.resolve(url);
        var applicationName;
        if(request.app) {
            applicationName = request.app;
        } else {
            applicationName = 'Page404';
        }
        var application = me.applications[applicationName];
        if(application) {
            explodeApplication(me, request, applicationName, directives);
        } else {
            Engine.load(applicationName, function() {
                me.applications[applicationName] = Engine.require(applicationName);
                explodeApplication(me, request, applicationName, directives);
            })
        }
    };

    Dispatcher.prototype.fireEvent = function(eventType, applicationName){
        if(this.events === null) return;
        if(!this.events[eventType])return;
        var events = this.events[eventType];
        for(var i = 0; i < events.length; i++) {
            events[i](applicationName);
        }
    };


    //private functions

    function explodeApplication(dispatcher, request, applicationName, directives) {
        var applicationClass = dispatcher.applications[applicationName];
        if (!applicationClass) {
            throw "Undefined application " + applicationName;
        }
        var contextUpdate = function(){
            if(dispatcher.context) {
                dispatcher.context.request = request
            }
        };
        var windowUpdate = function(app){
            var title = getTitle(app);
            var path = UrlUtils.getPath();
            if(request.url !== path) {
                var hash = document.location.hash;
                this.history.pushState({}, title, (request.url || '/') + (hash || ''));
            }
        };

        if(dispatcher.applicationName === applicationName && dispatcher.activeApplication.canStay) {
            contextUpdate();
            windowUpdate(dispatcher.activeApplication);
            var isCanStay = dispatcher.activeApplication.canStay();
            if(isCanStay !== false) {
                return;
            }
        }
        closeApplication(dispatcher, applicationName);
        contextUpdate();
        var app = initApplication(dispatcher, applicationClass);
        windowUpdate(app);
        openApplication(dispatcher, app, request.params, directives, applicationName);
    }

    function initApplication (dispatcher, contructor) {
        var application;
        if(dispatcher.applicationName)
            var placeApplication = function(applicationName, directives){
                dispatcher.placeApplication(applicationName, directives);
            };
        if(typeof contructor == "function") {
            application = new contructor(dispatcher.context, dispatcher.config, placeApplication);
        } else {
            application = contructor;
            if(application.init) {
                application.init(dispatcher.context, dispatcher.config, placeApplication);
            }
        }
        return application;
    }

    function closeApplication(dispatcher) {
        var app = dispatcher.activeApplication;
        if (app) {
            var appName = dispatcher.applicationName;
            dispatcher.fireEvent('beforeClose', appName);
            if (app.beforeClose) {
                app.beforeClose();
            }
            dispatcher.app.innerHTML = '';
            if (app.afterClose) {
                app.afterClose();
            }
            dispatcher.fireEvent('afterClose', appName);
        }
    }
    function getTitle(app) {
        if(app.getTitle) {
            return app.getTitle();
        } else if (app.TITLE || app.title) {
            return app.TITLE || app.title;
        } else {
            return '';
        }
    }
    function openApplication(dispatcher, app, params, directives, applicationName){
        dispatcher.fireEvent('beforeOpen', applicationName);
        dispatcher.activeApplication = app;
        dispatcher.applicationName = applicationName;
        if (app.beforeOpen) {
            app.beforeOpen(params, directives);
        }
        if(app.container) {
            dispatcher.app.appendChild(app.container);
        }
        if (app.afterOpen) {
            app.afterOpen(params, directives);
        }
        dispatcher.fireEvent('afterOpen', applicationName);
    }

    return Dispatcher;
});
Engine.define('Word', ['Rest'], function(){
    var Rest = Engine.require('Rest');
    var onLoad = {};
    var enLaguageLoaded = false;

    var Word = function(key, module, container, strategy) {
        if(!strategy && typeof container === 'string') {
            strategy = container;
            container = module;
            module = 'default';
        }
        if(typeof module !== 'string' && !container) {
            container = module;
            module = 'default';
        }

        var clb = function(text){
            if(strategy && strategy != 'text') {
                if(strategy == 'append') {
                    container.appendChild(document.createTextNode(text));
                } else {
                    container.innerHTML = text;
                }
            } else {
                container.innerText = text;
            }
        };
        if(Word.languageLoaded(Word.language)) {
            clb(Word.get(key, module));
        } else {
            Word.loadLanguage(Word.language, function(){
                clb(Word.get(key, module))
            });
        }
    };
    Word.dictionaries = {};
    Word.dictionariesPath = 'assets/js/word/';

    Word.get = function(key, module, language){
        if(!language) language = Word.language;
        if(!module)module = 'default';
        var lang = Word.dictionaries[language];
        if(lang) {
            var mod = lang[module] || lang['default'] || {};
            return mod[key];
        } else {
            return null;
        }
    };

    Word.languageLoaded = function(language){
        if(!language) language = Word.language;
        return Word.dictionaries[language] !== undefined;
    };

    Word.loadLanguage = function(language, clb){
        if(typeof language === 'function' && !clb) {
            clb = language;
            language = Word.language;
        } else if(!language) {
            language = Word.language;
        }
        if(!onLoad[language]) {
            if(typeof clb === 'function') {
                onLoad[language] = [clb];
            } else {
                onLoad[language] = clb;
            }
        } else {
            if(typeof clb === 'function') {
                onLoad[language].push(clb);
            } else {
                onLoad[language] = onLoad[language].concat(clb);
            }
            return;
        }
        if(Word.loader) {
            Word.loader(language, onLoad[language]);
        } else {
            Rest.doGet(Word.dictionariesPath + language + '.json').then(
                function(dictionary){
                    var norm = {};
                    for(var k in dictionary) {
                        if(!dictionary.hasOwnProperty(k)) continue;
                        var value = dictionary[k];
                        if(typeof value === 'string') {
                            if(!norm.default) {
                                norm.default = {};
                            }
                            norm.default[k] = value;
                        } else {
                            norm[k] = value;
                        }
                    }
                    Word.dictionaries[language] = norm;
                    Word.language = language;
                    for(var i = 0; i < onLoad[language].length; i++) {
                        onLoad[language][i]();
                    }
                },
                function(){
                    if(!enLaguageLoaded) {
                        enLaguageLoaded = true;
                        Word.loadLanguage('en', onLoad[language]);
                        delete(onLoad[language]);
                    } else {
                        Engine.notify("Can't load language - " + language, 'E');
                    }
                }
            );

        }
    };
    Word.translate = function(language, node) {
        if(!language) language = Word.language;
        if(!node)node = document.body;
        function clb() {
            var words = node.getElementsByClassName('word');
            for(var i = 0; i < words.length; i++) {
                var w = words[i];
                var key = w.getAttribute('data-w-key');
                var module = w.getAttribute('data-w-module');
                var strategy = w.getAttribute('data-w-strategy');
                if(key) {
                    Word(key, module, w, strategy);
                }
            }
        }
        if(Word.languageLoaded(language)) {
            Word.language = language;
            clb();
        } else {
            Word.loadLanguage(language, clb);
        }
    };

    Word.create = function(defaultModule, defaultContainer) {
        var out = function(key, module, container, strategy){
            if(typeof module !== 'string') {
                container = module;
                module = null;
            }
            return Word(key, module || defaultModule, container || defaultContainer, strategy)
        };
        out.get = function(key, language){
            return Word.get(key, defaultModule, language);
        };
        out.languageLoaded = Word.languageLoaded;
        out.loadLanguage = Word.loadLanguage;
        out.translate = Word.translate;
        return out;
    };

    Word.language = navigator.language || navigator.userLanguage || 'en';
    return Word;
});