'use strict';

/**
 *  Binding class.
 *
 *  each property on the viewmodel has one corresponding Binding object
 *  which has multiple directive instances on the DOM
 */
function Binding(compiler, dir) {

    this.compiler = compiler;
    this.key = dir.key;
    this.dirs = [];
}

module.exports = Binding;