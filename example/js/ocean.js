'use strict';

(function () {
    var moduleMap = {},
        Binder = {
            $watch: function (key, watcher) {
                if (!this.$watchers[key]) {
                    this.$watchers[key] = {
                        value: this[key],
                        list: []
                    };

                    Object.defineProperty(this, key, {
                        set: function (val) {
                            var oldValue = this.$watchers[key].value;
                            this.$watchers[key].value = val;
                            for (var i = this.$watchers[key].list.length - 1; i >= 0; i--) {
                                this.$watchers[key].list[i](val, oldValue);
                            }
                        },
                        get: function () {
                            return this.$watchers[key].value;
                        }
                    });
                }
                this.$watchers[key].list.push(watcher);
            }
        },
        noop = function () {},
        oceanPrefix = 'o-';
    // noop = function () {},
    // fileMap = {};
    window.ocean = {
        define: function (name, dependencies, factory) {
            if (!moduleMap[name]) {
                var module = {
                    name: name,
                    dependencies: dependencies,
                    factory: factory
                };
                moduleMap[name] = module;
            }
            return moduleMap[name];
        },
        use: function (name) {
            var module = moduleMap[name];
            if (!module.entity) {
                var args = [];
                for (var i = 0; i < module.dependencies.length; ++i) {
                    if (moduleMap[module.dependencies[i]].entity) {
                        args.push(moduleMap[module.dependencies[i]].entity);
                    } else {
                        args.push(this.use(module.dependencies[i]));
                    }
                }

                module.entity = module.factory.apply(noop, args);
            }
            return module.entity;
        },
        log: function (msg) {
            console.log(msg);
        },
        // require: function (path, callback) {
        //     if (!fileMap[path]) {
        //         var head = document.getElementsByTagName('head')[0],
        //             node = document.createElement('script');
        //         node.type = 'text/javascript';
        //         node.async = 'true';
        //         node.src = path + '.js';
        //         node.onload = function () {
        //             fileMap[path] = true;
        //             head.removeChild(node);
        //             callback();
        //         };
        //         head.appendChild(node);
        //     }
        // }
    };

    function parseElement(element, vm) {

        var model = vm,
            i;

        if (element.getAttribute(oceanPrefix + 'model')) {
            model = bindModel(element.getAttribute(oceanPrefix + 'model'));
        }

        for (i = element.attributes.length - 1; i >= 0; i--) {
            parseAttribute(element, element.attributes[i], model);
        }

        for (i = element.children.length - 1; i >= 0; i--) {
            parseElement(element.children[i], model);
        }
    }

    function bindModel(name) {

        ocean.log('binding model: ' + name);

        var Model = ocean.use(name);
        Model.prototype = Binder;
        var instance = new Model();
        instance.$watchers = {};
        return instance;
    }

    function parseAttribute(element, attr, model) {
        if (attr.name.indexOf(oceanPrefix) === 0) {
            var type = attr.name.slice(2);
            switch (type) {
            case 'value':
                bindValue(element, attr.value, model);
                break;
            case 'click':
                binkClick(element, attr.value, model);
                break;
            case 'show':
                binkShow(element, attr.value, model);
                break;
            }
        }
    }

    function bindValue(element, key, vm) {

        ocean.log('binding value:' + key);

        vm.$watch(key, function (value, oldValue) {
            updateViewValue(value);
            oldValue = oldValue;
        });

        element.onkeyup = function () {
            vm[key] = element.value;
        };

        element.onpaste = function () {
            vm[key] = element.value;
        };

        function updateViewValue(value) {

            if (element.tagName === 'INPUT') {
                element.value = value || '';
            } else {
                element.innerText = value || '';
            }
        }

        updateViewValue(vm[key]);
    }

    function binkClick(element, key, vm) {

        ocean.log('binding click:' + key);
        element.addEventListener('click', function () {
            // console.log(vm[element.getAttribute(oceanPrefix + 'click')]);
            vm[element.getAttribute(oceanPrefix + 'click')]();
        });
    }

    function binkShow(element, key, vm) {

        ocean.log('binding show:' + key);

        vm.$watch(key, function (value) {
            updateViewShow(value);
        });

        function updateViewShow(value) {
            if (value) {
                element.style.display = 'block';
            } else {
                element.style.display = 'none';
            }
        }

        updateViewShow(vm[key]);
    }

    window.addEventListener('load', function () {
        parseElement(document.body);
    });
})();