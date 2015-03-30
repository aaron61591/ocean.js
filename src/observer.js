'use strict';

var Emitter = require('./emitter'),
    utils = require('./utils'),
    def = Object.defineProperty,
    defProtected = utils.defProtected,
    protoAccessor = '__proto__',
    log = utils.log;

/**
 * Observer class
 */
function Observer(compiler) {

    this.observer = new Emitter();
    this.compiler = compiler;

    this.observer
        .on('set', function (key, value) {

            log('set', key, value);
        }).on('mutate', function (key, value, mutation) {

            log('mutate', key, value, mutation);
        });

    this.observe(compiler.data, '', this.observer);
}

var ObserverProto = Observer.prototype;

/**
 *  Convert an Object/Array to give it a change emitter.
 */
ObserverProto.convert = function (obj) {

    defProtected(obj, '__emitter__', new Emitter());
    defProtected(obj, '__values__', utils.hashMap());
};

/**
 *  Define accessors for a property on an Object
 *  so it emits get/set events.
 *  Then watch the value itself.
 */
ObserverProto.convertKey = function (obj, key) {

    log('convertKey', obj, key);

    // skip over internal attrs
    var keyPrefix = key.charAt(0);
    if (keyPrefix === '$' || keyPrefix === '_') {
        return;
    }

    var self = this,
        values = obj.__values__,
        emitter = obj.__emitter__;

    init(obj[key]);

    // define prop set/get
    def(obj, key, {
        enumerable: true,
        configurable: true,
        set: function (value) {

            emitter.emit('set', key, value);
            init(value);
        },
        get: function () {

            return values[key];
        }
    });

    function init(value) {

        self.observe(value, key, emitter);
        values[key] = value;
    }
};

/**
 * Check if a value needed observe
 */
ObserverProto.need2Observe = function (obj) {

    return typeof obj === 'object';
};

// The proxy prototype to replace the __proto__ of
// an observed array
var ArrayProxy = Object.create(Array.prototype);

initArrayProxy();

// intercept mutation methods
function initArrayProxy() {

    [
        'push',
        'pop',
        'shift',
        'unshift',
        'splice',
        'sort',
        'reverse'
    ].forEach(function (method) {

        // define array prototype method to array proxy
        utils.defProtected(ArrayProxy, method, function () {

            var args = [].slice.call(arguments),
                result = Array.prototype[method].apply(this, args),
                inserted, removed;

            if (method === 'push' || method === 'unshift') {
                inserted = args;
            } else if (method === 'pop' || method === 'shift') {
                removed = [result];
            } else if (method === 'splice') {
                inserted = args.slice(2);
                removed = result;
            }

            // emit the mutation event
            this.__emitter__.emit('mutate', '', this, {
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

        function refreshProxy(arr) {

            var i = arr.length;

            log('refreshProxy', arr);
            while (i--) {
                var item = arr[i];
                // item.__proxies__.
            }
        }
    });
}


/**
 * Observe array recursively
 */
ObserverProto.observeArray = function (arr) {

    log('observeArray', arr);

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
 * Observe obj recursively
 */
ObserverProto.observeObject = function (obj) {

    log('observeObject', obj);

    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            this.convertKey(obj, key);
        }
    }
};

/**
 * Observe obj's props according prop's type
 */
ObserverProto.observeProps = function (obj) {

    if (utils.isArray(obj)) {
        this.observeArray(obj);
    } else {
        this.observeObject(obj);
    }
};

/**
 *  Observe an object with a given path,
 *  and proxy get/set/mutate events to the provided observer.
 */
ObserverProto.observe = function (obj, rawPath, observer) {

    log('observe', obj, rawPath, observer);

    if (!this.need2Observe(obj)) {
        return;
    }

    this.convert(obj);

    // setup proxies props
    // for finding data full path
    // change array path arr[0] to arr.0
    var path = rawPath ? rawPath + '.' : '',
        emitter = obj.__emitter__,
        proxy = obj.__proxy__ = {
            set: function (key, value) {

                observer.emit('set', path + key, value);
            },
            get: function () {

                log('proxy get');
            },
            mutate: function (key, value, mutation) {

                log(key, value, mutation);
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

    // emit set/get event to father emitter
    // through obj proxy
    emitter
        .on('set', proxy.set)
        .on('get', proxy.get)
        .on('mutate', proxy.mutate);

    // convert obj's props
    this.observeProps(obj);
};

module.exports = Observer;