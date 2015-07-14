'use strict';

var Observer = require('./observer'),
    utils = require('./utils'),
    def = Object.defineProperty,
    defProtected = utils.defProtected,
    protoAccessor = '__proto__',
    log = utils.log;

/**
 * Monitor class
 */
function Monitor(compiler) {

    this.observer = new Observer();
    this.compiler = compiler;

    this.observer
        .on('set', function (key, value) {

            log('set', key, value);
        }).on('mutate', function (key, value, mutation) {

            log('mutate', key, value, mutation);
        });

    this.monitor(compiler.data, '', this.observer);
}

var MonitorProto = Monitor.prototype;

// The proxy prototype to replace the __proto__ of
// an monitord array
var ArrayProxy = Object.create(Array.prototype);

initArrayProxy();

// intercept mutation methods
function initArrayProxy() {

    [
        'push', // do not use method set
        'pop', // not use 
        'shift', // use
        'unshift', // use
        'splice', // not use
        'sort', // use
        'reverse' // use
    ].forEach(function (method) {

        // define array prototype method to array proxy
        utils.defProtected(ArrayProxy, method, function () {

            var args = [].slice.call(arguments),
                result = Array.prototype[method].apply(this, args),
                inserted, removed;

            switch (method) {

            case 'push':
                MonitorProto.convertKey(this, this.length - 1 + '');
                break;
            }


            if (method === 'push' || method === 'unshift') {
                inserted = args;
            } else if (method === 'pop' || method === 'shift') {
                removed = [result];
            } else if (method === 'splice') {
                inserted = args.slice(2);
                removed = result;
            }

            // emit the mutation event
            this.__monitor__.emit('mutate', '', this, {
                method: method,
                args: args,
                result: result,
                inserted: inserted,
                removed: removed
            });

            // handle inserted and removed items
            // refreshProxy(this);

            return result;
        });

        // function refreshProxy(arr) {

        //     var i = arr.length;

        //     log('refreshProxy', arr);

        //     while (i--) {
        //         var item = arr[i];
        //         // item.__proxies__.
        //     }
        // }
    });
}

/**
 * Check if a value needed monitor
 */
MonitorProto.need2Monitor = function (obj) {

    return typeof obj === 'object';
};

/**
 *  Convert an Object/Array to give it a change observer.
 */
MonitorProto.convert = function (obj) {

    defProtected(obj, '__monitor__', new Observer());
    defProtected(obj, '__values__', utils.hashMap());
};

/**
 *  monitor an object with a given path,
 *  and proxy get/set/mutate events to the provided monitor.
 */
MonitorProto.monitor = function (obj, rawPath, observer) {

    log('monitor', obj, rawPath, observer);

    if (!this.need2Monitor(obj)) {
        return;
    }

    this.convert(obj);

    // setup proxies props
    // for finding data full path
    // change array path arr[0] to arr.0
    var path = rawPath ? rawPath + '.' : '',
        proxy = {
            set: function (key, value) {

                observer.emit('set', path + key, value);
            },
            get: function () {

                log('proxy get');
            },
            mutate: function (key, value, mutation) {

                var fixedPath = key ? path + key : rawPath,
                    m = mutation.method;

                observer.emit('mutate', fixedPath, value, mutation);

                // also emit set for Array's length when it mutates
                if (!mutation.emitLength && m !== 'sort' && m !== 'reverse') {
                    // fixed vue's multi-emitting problem 
                    mutation.emitLength = true;
                    observer.emit('set', fixedPath + '.length', value.length);
                }
            }
        };

    // emit set/get event to father observer
    // through obj proxy
    obj.__monitor__
        .on('set', proxy.set)
        .on('get', proxy.get)
        .on('mutate', proxy.mutate);

    // convert obj's props
    this.monitorProps(obj);
};

/**
 * monitor obj's props according prop's type
 */
MonitorProto.monitorProps = function (obj) {

    if (utils.isArray(obj)) {
        this.monitorArray(obj);
    } else {
        this.monitorObject(obj);
    }
};

/**
 * monitor array recursively
 */
MonitorProto.monitorArray = function (arr) {

    log('monitorArray', arr);

    var i = arr.length;

    // add array proxy
    convertArray(arr);

    while (i--) {
        this.convertKey(arr, i + '');
    }

    // inheritance array proxy
    // for listening array mutate
    function convertArray(arr) {

        arr[protoAccessor] = ArrayProxy;
    }
};

/**
 * monitor obj recursively
 */
MonitorProto.monitorObject = function (obj) {

    log('monitorObject', obj);

    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            this.convertKey(obj, key);
        }
    }
};

/**
 *  Define accessors for a property on an Object
 *  so it emits get/set events.
 *  Then watch the value itself.
 */
MonitorProto.convertKey = function (obj, key) {

    log('convertKey', obj, key);

    // skip over internal attrs
    var keyPrefix = key.charAt(0);
    if (keyPrefix === '$' || keyPrefix === '_') {
        return;
    }

    var self = this,
        values = obj.__values__,
        observer = obj.__monitor__;

    init(obj[key]);

    // define prop set/get
    def(obj, key, {
        enumerable: true,
        configurable: true,
        set: function (value) {

            observer.emit('set', key, value);
            init(value);
        },
        get: function () {

            return values[key];
        }
    });

    function init(value) {

        self.monitor(value, key, observer);
        values[key] = value;
    }
};

module.exports = Monitor;