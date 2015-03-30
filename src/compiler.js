'use strict';

var Observer = require('./observer'),
    utils = require('./utils');

/**
 * Compiler class
 * The DOM compiler
 * scan a DOM node and compile bindings for a VM
 */
function Compiler(vm, options, ele) {

    var compiler = this;

    // set compiler properties
    compiler.initProps(compiler, vm, options, ele);

    // set VM properties
    compiler.initVmProps(vm, compiler, options);

    compiler.execHook('created');

    // setup element
    compiler.setupElement(options);

    // setup observer
    compiler.setupObserver();

    compiler.compile();

    compiler.execHook('ready');
}

var CompilerProto = Compiler.prototype;

/**
 * Initialize compiler properties
 */
CompilerProto.initProps = function (compiler, vm, options, ele) {

    compiler.vm = vm;
    compiler.bindings = {};
    compiler.observer = {};
    compiler.ele = ele;
    compiler.data = options.data;
};

/**
 * Initialize VM properties
 */
CompilerProto.initVmProps = function (vm, compiler, options) {

    vm.$options = options;
    vm.$data = options.data;
    vm.$methods = options.methods;
};

/**
 * Initialize the VM element
 */
CompilerProto.setupElement = function (options) {

    // TODO do template job
};

/**
 * Setup observer.
 * The observer listens for events on all VM
 * values, objects and trigger corresponding binding updates.
 */
CompilerProto.setupObserver = function () {

    this.observer = new Observer(this);
};

/**
 * Emit lifecycle events to trigger hooks
 */
CompilerProto.execHook = function () {

    // TODO
};

/**
 * parse the DOM and bind directives
 * create bindings for keypaths
 */
CompilerProto.compile = function () {

    // TODO
};

module.exports = Compiler;