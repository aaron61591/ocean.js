'use strict';

var slice = [].slice;

function Observer(ctx) {
    this._ctx = ctx || this;
}

var ObserverProto = Observer.prototype;

ObserverProto.on = function (event, fn) {
    this._cbs = this._cbs || {};
    (this._cbs[event] = this._cbs[event] || [])
    .push(fn);
    return this;
};

ObserverProto.once = function (event, fn) {
    var self = this;
    this._cbs = this._cbs || {};

    function on() {
        /*jshint validthis:true */
        self.off(event, on);
        fn.apply(this, arguments);
    }

    on.fn = fn;
    this.on(event, on);
    return this;
};

ObserverProto.off = function (event, fn) {
    this._cbs = this._cbs || {};

    // all
    if (!arguments.length) {
        this._cbs = {};
        return this;
    }

    // specific event
    var callbacks = this._cbs[event];
    if (!callbacks) {
        return this;
    }

    // remove all handlers
    if (arguments.length === 1) {
        delete this._cbs[event];
        return this;
    }

    // remove specific handler
    var cb;
    for (var i = 0; i < callbacks.length; i++) {
        cb = callbacks[i];
        if (cb === fn || cb.fn === fn) {
            callbacks.splice(i, 1);
            break;
        }
    }
    return this;
};

/**
 *  The internal, faster emit with fixed amount of arguments
 *  using Function.call
 */
ObserverProto.emit = function (event, a, b, c) {
    this._cbs = this._cbs || {};
    var callbacks = this._cbs[event];

    if (callbacks) {
        callbacks = callbacks.slice(0);
        for (var i = 0, len = callbacks.length; i < len; i++) {
            callbacks[i].call(this._ctx, a, b, c);
        }
    }

    return this;
};

/**
 *  The external emit using Function.apply
 */
ObserverProto.applyEmit = function (event) {
    this._cbs = this._cbs || {};
    var callbacks = this._cbs[event],
        args;

    if (callbacks) {
        callbacks = callbacks.slice(0);
        args = slice.call(arguments, 1);
        for (var i = 0, len = callbacks.length; i < len; i++) {
            callbacks[i].apply(this._ctx, args);
        }
    }

    return this;
};

module.exports = Observer;