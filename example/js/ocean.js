'use strict';

(function () {
    var oceanPrefix = 'o-',
        keyCodeIgnore = [16, 17, 37, 38, 39, 40, 91]; // shift, ctl, left, up, right, down, cmd

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

            if (!option.name && !option.name.trim().length) {
                throw new ErrorOptionInvalid();
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

            console.log(msg);
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
            parseElement(element.children[i], vm);
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

        var methodName = getMethodName(key);

        if (!getMethod(vm, methodName)) {
            vm._watch(key, function (value) {

                updateViewValue(value);
            });

            element.onkeyup = function (e) {

                if (keyCodeIgnore.indexOf(e.keyCode) === -1) {
                    vm.$data[key] = element.value;
                }
            };

            element.onpaste = function () {

                vm.$data[key] = element.value;
            };

            updateViewValue(vm.$data[key]);
        } else {
            var args = getArgs(key);
            args.map(function (arg) {

                if (!getArg(arg)) {
                    vm._watch(arg, function () {

                        updateViewValueByMethod(args);
                    });
                }
            });

            updateViewValueByMethod(args);
        }

        function updateViewValueByMethod(args) {

            updateViewValue(vm.$methods[methodName].apply(vm, args.map(function (arg) {
                if (!getArg(arg)) {
                    return vm.$data[arg];
                } else {
                    return getArg(arg);
                }
            })));
        }

        function updateViewValue(value) {

            if (element.tagName === 'INPUT') {
                element.value = value;
            } else {
                element.innerText = value;
            }
        }
    }

    function bindClick(element, key, vm) {

        ocean.log('binding click:' + key);

        var methodName = getMethodName(key),
            method = getMethod(vm, methodName),
            args = getArgs(key);

        if (method) {
            element.addEventListener('click', function () {

                method.apply(vm, args.map(function (arg) {

                    var t = getArg(arg);
                    if (!t) {
                        return vm.$data[arg];
                    } else {
                        return t;
                    }
                }));
            });
        } else {
            throw new ErrorNoMethod(vm, key);
        }
    }

    function bindShow(element, key, vm) {

        ocean.log('binding show:' + key);


        // if (!isMethod(key)) {
        vm._watch(key, function (value) {

            updateViewShow(value);
        });

        updateViewShow(vm.$data[key]);
        // } else {

        //     var methodName = getMethodName(key),
        //         method = getMethod(vm, methodName),
        //         args = getArgs(key);

        //     if (method) {
        //         args.map(function (arg) {
        //             if (!getArg(arg)) {
        //                 vm._watch(arg, function () {
        //                     updateViewIfByMethod(args);
        //                 });
        //             }
        //         });
        //         updateViewIfByMethod(args);
        //     } else {
        //         throw new ErrorNoMethod(vm, key);
        //     }
        // }


        // function updateViewIfByMethod(args) {

        //     updateViewShow(vm.$methods[methodName].apply(vm, args.map(function (arg) {
        //         var t = getArg(arg);
        //         if (!t) {
        //             return vm.$data[arg];
        //         } else {
        //             return t;
        //         }
        //     })));
        // }

        function updateViewShow(value) {

            if (value) {
                element.style.display = 'block';
            } else {
                element.style.display = 'none';
            }
        }
    }

    function bindIf(element, key, vm) {

        ocean.log('binding if:' + key);

        var parentNode = element.parentNode,
            refer = document.createComment('ocean-if');

        // if (!isMethod(key)) {
        vm._watch(key, function (value) {
            updateViewIf(value);
        });

        if (!vm.$data[key]) {
            updateViewIf(false);
        }
        // } else {

        //     var methodName = getMethodName(key),
        //         method = getMethod(vm, methodName),
        //         args = getArgs(key);

        //     if (method) {
        //         args.map(function (arg) {
        //             if (!getArg(arg)) {
        //                 vm._watch(arg, function () {
        //                     updateViewIf(updateViewIfByMethod(args));
        //                 });
        //             }
        //         });
        //         if (!updateViewIfByMethod(args)) {
        //             updateViewIf(false);
        //         }
        //     } else {
        //         throw new ErrorNoMethod(vm, key);
        //     }
        // }

        // function updateViewIfByMethod(args) {

        //     return vm.$methods[methodName].apply(vm, args.map(function (arg) {
        //         var t = getArg(arg);
        //         if (!t) {
        //             return vm.$data[arg];
        //         } else {
        //             return t;
        //         }
        //     }));
        // }

        function updateViewIf(value) {

            if (value) {
                parentNode.insertBefore(element, refer);
                parentNode.removeChild(refer);
            } else {
                parentNode.insertBefore(refer, element);
                parentNode.removeChild(element);
            }
        }
    }

    function bindClass(element, key, vm) {

        ocean.log('binding class:' + key);

        var classPair = getKeyPair(key);

        classPair.map(function (pair) {

            vm._watch(pair.expression, function (value) {

                updateViewClass(value, pair);
            });

            updateViewClass(vm.$data[pair.expression], pair);
        });

        function updateViewClass(value, pair) {

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
            args = [];

        watchByPair(vm, keyPair, args, updateViewClass);

        function updateViewClass(pair) {

            element.style[pair.props] = calExpression(pair.expression, args, vm);
        }

    }

    function bindAttribute(element, key, vm) {

        ocean.log('binding attribute:' + key);

        var keyPair = getKeyPair(key),
            args = [];

        watchByPair(vm, keyPair, args, updateViewAttr);

        function updateViewAttr(pair) {

            element.setAttribute(pair.props, calExpression(pair.expression, args, vm));
        }
    }

    // function isMethod(key) {

    //     return new RegExp(/\([^\)]*\)/).test(key);
    // }

    function getMethodName(key) {

        return key.match(/[^\(]*/)[0];
    }

    function getMethod(vm, methodName) {

        return vm.$methods[methodName];
    }

    function getArgs(key) {

        var m = key.match(/\(([^\)]*)\)/);
        if (m) {
            m = m[1].split(',').map(function (arg) {
                return arg.trim();
            });
            return m;
        } else {
            return [];
        }
    }

    function getArg(arg) {

        var m = arg.match(/^'([^']*)'$/) || arg.match(/^(\d+)$/) || arg.match(/^(\d+.\d+)$/);
        m = m && m[1];
        return m;
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

    function watchByPair(vm, keyPair, args, callback) {

        keyPair.map(function (pair) {

            var t = pair.expression.replace(/'[^']*'/g, ''),
                vars = t.match(/([\d\w]+)/g);

            if (vars) {
                vars.map(function (e) {

                    vm._watch(e, function () {

                        callback(pair);
                    });
                    args.push(e);
                });
            }

            callback(pair);
        });
    }

    function calExpression(expression, args, vm) {

        for (var i = 0; i < args.length; ++i) {
            if (typeof vm.$data[args[i]] === 'string') {
                expression = expression.replace(args[i], '\'' + vm.$data[args[i]] + '\'');
            } else {
                expression = expression.replace(args[i], vm.$data[args[i]]);
            }
        }
        /*jslint evil: true */
        return eval(expression);
    }

    var ErrorOptionInvalid = function () {

            this.message = '[oceanjs]: option name invalid';
        },
        ErrorNoMethod = function (vm, key) {

            this.message = '[oceanjs]: method named \'' + key + '\' is not defined in component \'' + vm.$name + '\'';
        },
        errorToString = function () {

            return this.message;
        };

    ErrorOptionInvalid.prototype.toString =
        ErrorNoMethod.prototype.toString = errorToString;
})();