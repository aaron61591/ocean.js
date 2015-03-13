'use strict';

(function () {
    var oceanPrefix = 'o-',
        keyCodeIgnored = [16, 17, 37, 38, 39, 40, 91], // shift, ctl, left, up, right, down, cmd
        varsIgnored = ['true', 'false', 'undefined', 'null', 'NaN'],
        isDebug = false;


    /*
     * ocean vm definition
     */
    var Vm = function (option) {

        this.$option = {};
        this.$name = {};
        this.$data = {};
        this.$methods = {};
        this._watchers = [];
        this._initial(option);
    };

    Vm.prototype = {

        _initial: function (option) {

            this._checkOption(option);
            this.$option = option;
            this.$name = option.name;
            this.$data = option.data || {};
            this.$methods = option.methods || {};
        },

        _checkOption: function (option) {

            var pro;

            if (!option.name && !option.name.trim().length) {
                throw new ErrorOptionInvalid();
            }

            if (option.data && option.methods) {
                for (pro in option.data) {

                    if (option.methods[pro]) {
                        throw new ErrorNameConflict(option, pro);
                    }
                }
            }
        },

        _watch: function (key, watcher) {

            var that = this;

            if (!this._watchers[key]) {
                this._watchers[key] = {
                    value: this.$data[key],
                    list: []
                };

                Object.defineProperty(this.$data, key, {

                    set: function (val) {

                        var oldValue = that._watchers[key].value;
                        that._watchers[key].value = val;
                        for (var i = that._watchers[key].list.length - 1; i >= 0; i--) {
                            that._watchers[key].list[i](val, oldValue);
                        }
                    },

                    get: function () {

                        return that._watchers[key].value;
                    }
                });
            }
            this._watchers[key].list.push(watcher);
        }
    };

    window.ocean = {

        component: function (option) {

            bindComponent(option);
            return;
        },

        log: function (msg) {
            if (isDebug) {
                console.log(msg);
            }
        },
    };


    function bindComponent(option) {

        var els = document.getElementsByTagName(oceanPrefix + option.name),
            i = 0;

        while (i < els.length) {

            ocean.log('component:' + els[i].tagName);

            parseElement(els[i], new Vm(option));
            ++i;
        }
    }

    function parseElement(element, vm) {

        for (var i = element.attributes.length - 1; i >= 0; i--) {
            parseAttribute(element, element.attributes[i], vm);
        }

        for (i = element.children.length - 1; i >= 0; i--) {
            if (element.children[i].tagName.toLowerCase().indexOf(oceanPrefix) === -1) {
                parseElement(element.children[i], vm);
            }
        }
    }

    function parseAttribute(element, attr, vm) {

        if (attr.name.indexOf(oceanPrefix) === 0) {
            attr.value = attr.value.trim();
            if (attr.value) {
                var type = attr.name.slice(2);
                switch (type) {
                case 'value':
                    bindValue(element, attr.value, vm);
                    break;
                case 'text':
                    bindText(element, attr.value, vm);
                    break;
                case 'click':
                    bindClick(element, attr.value, vm);
                    break;
                case 'show':
                    bindShow(element, attr.value, vm);
                    break;
                case 'if':
                    bindIf(element, attr.value, vm);
                    break;
                case 'class':
                    bindClass(element, attr.value, vm);
                    break;
                case 'style':
                    bindStyle(element, attr.value, vm);
                    break;
                case 'attr':
                    bindAttribute(element, attr.value, vm);
                    break;
                }
            }
        }
    }

    function bindValue(element, key, vm) {

        ocean.log('binding value:' + key);

        element.onkeyup = function (e) {

            if (keyCodeIgnored.indexOf(e.keyCode) === -1) {
                vm.$data[key] = getValue(element.value);
            }
        };

        element.onpaste = function () {

            vm.$data[key] = getValue(element.value);
        };

        updateViewValue(vm.$data[key]);

        function updateViewValue(value) {

            element.value = value;
        }

        function getValue(value) {
            var m = matchNumber(value);
            m = m && m[1];
            return m ? parseFloat(m) : value;
        }
    }

    function bindText(element, key, vm) {

        ocean.log('binding text:' + key);

        var dependency = [],
            dependencyMethod = [];

        watchByExpression(vm, key, updateViewTextByExp, null, dependency, dependencyMethod);

        function updateViewTextByExp() {

            updateViewText(calExpression(key, dependency, dependencyMethod, vm));
        }

        function updateViewText(value) {

            element.innerText = value;
        }
    }

    function bindClick(element, key, vm) {

        ocean.log('binding click:' + key);

        var methodName = getMethodName(key),
            method = getMethod(vm, methodName),
            args = getArgs(methodName, key);

        if (method) {
            if (window.addEventListener) {
                element.addEventListener('click', clickHandler);
            } else {
                element.attachEvent('click', clickHandler);
            }
        } else {
            throw new ErrorNoMethod(vm, methodName);
        }

        function clickHandler() {

            method.apply(vm, args.map(function (arg) {

                var t = getArg(arg);
                if (!t) {
                    return vm.$data[arg];
                } else {
                    return t;
                }
            }));
        }
    }

    function bindShow(element, key, vm) {

        ocean.log('binding show:' + key);

        var dependency = [],
            dependencyMethod = [];

        watchByExpression(vm, key, updateViewShow, null, dependency, dependencyMethod);

        function updateViewShow() {

            var value = calExpression(key, dependency, dependencyMethod, vm);

            if (value) {
                element.style.display = 'block';
            } else {
                element.style.display = 'none';
            }
        }
    }

    function bindIf(element, key, vm) {

        ocean.log('binding if:' + key);

        var dependency = [],
            dependencyMethod = [],
            parentNode = element.parentNode,
            refer = document.createComment('ocean-if');

        watchByExpression(vm, key, updateViewIf, null, dependency, dependencyMethod);

        function updateViewIf() {

            var value = calExpression(key, dependency, dependencyMethod, vm);

            if (value && !element.parentNode) {
                parentNode.insertBefore(element, refer);
                parentNode.removeChild(refer);
            } else if (!value && element.parentNode) {
                parentNode.insertBefore(refer, element);
                element = parentNode.removeChild(element);
            }
        }
    }

    function bindClass(element, key, vm) {

        ocean.log('binding class:' + key);

        var keyPair = getKeyPair(key),
            dependency = [],
            dependencyMethod = [];

        watchPairByExpression(vm, keyPair, dependency, dependencyMethod, updateViewClass);

        function updateViewClass(pair) {

            var value = calExpression(pair.expression, dependency, dependencyMethod, vm);

            if (value && !reg(pair.props).test(element.className)) {
                if (element.className === '') {
                    element.className = pair.props;
                } else {
                    element.className += ' ' + pair.props;
                }
            } else if (!value) {
                element.className = element.className.replace(new RegExp('\\s+' + pair.props + '|' + pair.props + '\\s+|^' + pair.props + '$'), '');
            }
        }

        function reg(className) {

            return new RegExp('^' + className + '\\s+|\\s+' + className + '\\s+|\\s+' + className + '$|^' + className + '$');
        }
    }

    function bindStyle(element, key, vm) {

        ocean.log('binding style:' + key);

        var keyPair = getKeyPair(key),
            dependency = [],
            dependencyMethod = [];

        watchPairByExpression(vm, keyPair, dependency, dependencyMethod, updateViewStyle);

        function updateViewStyle(pair) {

            element.style[pair.props] = calExpression(pair.expression, dependency, dependencyMethod, vm);
        }

    }

    function bindAttribute(element, key, vm) {

        ocean.log('binding attribute:' + key);

        var keyPair = getKeyPair(key),
            dependency = [],
            dependencyMethod = [];

        watchPairByExpression(vm, keyPair, dependency, dependencyMethod, updateViewAttr);

        function updateViewAttr(pair) {

            element.setAttribute(pair.props, calExpression(pair.expression, dependency, dependencyMethod, vm));
        }
    }

    function getMethodName(key) {

        return key.match(/[^\(]*/)[0];
    }

    function getMethod(vm, methodName) {

        return vm.$methods[methodName];
    }

    function getArgs(methodName, key) {

        var m = key.match(getMethodReg(methodName));

        if (m) {
            m = m[1].split(',').map(function (arg) {
                return arg.trim();
            });
            return m;
        } else {
            return [];
        }
    }

    function getMethodReg(methodName) {

        return new RegExp(methodName + '\\(([^\\)]*)\\)');
    }

    function getArg(arg) {

        var m = arg.match(/^'([^']*)'$/) || matchNumber(arg);
        m = m && m[1];
        return m;
    }

    function matchNumber(e) {

        return e.match(/^(\d+)$/) || e.match(/^(\d+.\d+)$/);
    }

    function getKeyPair(key) {

        var keys = key.split(','),
            stylePair = [],
            i, t, pair;

        for (i = 0; i < keys.length; ++i) {
            t = keys[i].split(':');
            pair = {
                props: t[0].trim(),
                expression: t[1].trim()
            };
            if (pair.props && pair.expression) {
                stylePair.push(pair);
            }
        }
        return stylePair;
    }

    function watchPairByExpression(vm, keyPair, dependency, dependencyMethod, callback) {

        keyPair.map(function (pair) {

            watchByExpression(vm, pair.expression, callback, pair, dependency, dependencyMethod);
        });
    }

    function watchByExpression(vm, expression, callback, callbackArgs, dependency, dependencyMethod) {

        var t = expression.replace(/'[^']*'/g, ''),
            vars = t.match(/[A-Za-z_\$][\w]*(\([^\)]*\)){0,1}/g);

        if (vars) {
            vars.map(function (e) {

                var methodName = getMethodName(e);

                if (varsIgnored.indexOf(e) === -1) {
                    if (!getMethod(vm, methodName)) {
                        vm._watch(e, function () {

                            callback(callbackArgs);
                        });

                        dependency.push(e);
                    } else {
                        var args = getArgs(methodName, e);

                        args.map(function (arg) {

                            if (!getArg(arg)) {
                                vm._watch(arg, function () {

                                    callback(callbackArgs);
                                });
                            }
                        });

                        dependencyMethod.push(methodName);
                    }
                }
            });
        }

        callback(callbackArgs);
    }

    function calExpression(expression, dependency, dependencyMethod, vm) {

        var i;

        for (i = 0; i < dependencyMethod.length; ++i) {
            var res = getDependMethodRes(dependencyMethod[i]);
            expression = expression.replace(getMethodReg(dependencyMethod[i]), res);
        }

        for (i = 0; i < dependency.length; ++i) {
            if (typeof vm.$data[dependency[i]] === 'string') {
                expression = expression.replace(getDependReg(dependency[i]), '\'' + vm.$data[dependency[i]] + '\'');
            } else {
                expression = expression.replace(getDependReg(dependency[i]), vm.$data[dependency[i]]);
            }
        }

        /* jslint evil: true */
        return eval(expression);

        function getDependMethodRes(dependencyMethod) {

            return vm.$methods[dependencyMethod].apply(vm, getArgs(dependencyMethod, expression).map(function (arg) {
                if (!getArg(arg)) {
                    return vm.$data[arg];
                } else {
                    return getArg(arg);
                }
            }));
        }

        function getDependReg(dependName) {
            var b = '[^\\w\\$]';
            return new RegExp('^' + dependName + b + '|' + b + dependName + b + '|' + b + dependName + '$|^' + dependName + '$');
        }
    }

    var ErrorOptionInvalid = function () {

            this.message = '[oceanjs]: option name invalid';
        },
        ErrorNoMethod = function (vm, key) {

            this.message = '[oceanjs]: method named \'' + key + '\' is not defined in component \'' + vm.$name + '\'';
        },
        ErrorNameConflict = function (option, key) {

            this.message = '[oceanjs]: method name \'' + key + '\' is conflict in component \'' + option.name + '\'';
        },
        errorToString = function () {

            return this.message;
        };

    ErrorOptionInvalid.prototype.toString =
        ErrorNoMethod.prototype.toString =
        ErrorNameConflict.prototype.toString = errorToString;
})();