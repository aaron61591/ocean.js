'use strict';

var doc = document,
    CONF = require('./config'),
    Monitor = require('./monitor'),
    utils = require('./utils');

/**
 * Compiler class
 * The DOM compiler
 * scan a DOM node and compile bindings for a VM
 */
function Compiler(vm, opt, ele) {

    this.initProps(vm, opt, ele);

    // before viewmodel compile
    this.execHook('created');

    this.renderElement(opt);

    this.setupMonitor();

    this.compile();

    // after viewmodel compile
    this.execHook('ready');
}

var CompilerProto = Compiler.prototype;

/**
 * Initialize compiler properties
 */
CompilerProto.initProps = function (vm, opt, ele) {

    this.vm = vm;
    this.bindings = {};
    this.monitor = {};
    this.ele = ele;
    this.data = opt.data;
};

/**
 * render component element to standard
 */
CompilerProto.renderElement = function () {

    var parent = this.ele.parentNode,
        cm, e;

    // TODO insert comment
    cm = doc.createComment(CONF.PREFIX + CONF.CMP_COMMENT);
    parent.insertBefore(cm, this.ele);

    // TODO create copy standuard dom
    e = doc.createElement(CONF.CMP_TAGNAME);
    utils.copyElement(this.ele, e);

    // TODO delete old ele
    parent.removeChild(this.ele);

    // TODO insert section
    parent.insertBefore(e, cm);

    // TODO delete comment
    parent.removeChild(cm);

    this.ele = e;
};

/**
 * Setup monitor.
 * The monitor listens for events on all VM
 * values, objects and trigger corresponding binding updates.
 */
CompilerProto.setupMonitor = function () {

    this.monitor = new Monitor(this);
};

/**
 * Emit lifecycle events to trigger hooks
 */
CompilerProto.execHook = function (hook) {

    this.vm.execHook(hook);
};

/**
 * parse the DOM and bind directives
 * create bindings for keypaths
 */
CompilerProto.compile = function () {

    // TODO
};

module.exports = Compiler;