'use strict';

var CONF = require('./config'),
    _ = require('./utils');

/**
 *  Directive class
 *  represents a single directive instance in the DOM
 */
function Directive(name, dir, directive, compiler, ele) {

    this.name = name;
    this.key = dir.key;
    this.value = dir.value;
    this.compiler = compiler;
    this.ele = ele;

    _.extends(this, directive);
}

/**
 * parse string to derective set
 */
Directive.parse = function (str) {

    var dirs = [],
        strs = str.split(CONF.DIRECTIVE_SEPARATOR1),
        i = strs.length;

    while (i--) {
        var tmp = strs[i].split(CONF.DIRECTIVE_SEPARATOR2);
        dirs.push({
            key: tmp[0],
            value: tmp[1]
        });
    }

    return dirs;
};

module.exports = Directive;