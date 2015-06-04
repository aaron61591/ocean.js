'use strict';

var CONF = require('./config'),
    def = Object.defineProperty,
    pub = module.exports = {

        /**
         * log for developing
         */
        log: function () {

            if (CONF.DEBUG) {
                console.log.apply(console, pub.object2Array(arguments));
            }
        },

        /**
         *  Create a prototype-less object
         *  which is a better hash/map
         */
        hashMap: function () {

            return Object.create(null);
        },

        /**
         *  Define an ienumerable property
         *  This avoids it being included in JSON.stringify
         *  or for...in loops.
         */
        defProtected: function (obj, key, val, enumerable, writable) {

            def(obj, key, {
                value: val,
                enumerable: enumerable,
                writable: writable,
                configurable: true
            });
        },

        /**
         * Object convert to array with its own props
         */
        object2Array: function (obj) {

            var args = [],
                prop;
            for (prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    args.push(obj[prop]);
                }
            }
            return args;
        },

        /**
         * judge whether obj is array
         */
        isArray: function (obj) {

            return Array.isArray(obj);
        },

        /**
         * copy a new element
         */
        copyElement: function (ele, newEle) {

            if (ele.innerHTML) {
                newEle.innerHTML = ele.innerHTML;
            }
            if (ele.id) {
                newEle.id = ele.id;
            }
            if (ele.className) {
                newEle.className = ele.className;
            }
        }
    };