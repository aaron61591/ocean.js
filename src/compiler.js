'use strict';

var doc = document,
    CONF = require('./config'),
    Monitor = require('./monitor'),
    Directive = require('./directive'),
    Binding = require('./binding'),
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

    this.compile(this.ele);

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
CompilerProto.compile = function (ele) {

    this.compileAttribute(ele);

    this.compileChildNode(ele);
};

/**
 * parse attributes
 */
CompilerProto.compileAttribute = function (ele) {

    if (!ele.attributes) {
        return;
    }

    var i = ele.attributes.length,
        name;

    while (i--) {
        name = utils.isDirective(ele.attributes[i].name);
        if (name) {
            this.bindDirectives(name, Directive.parse(ele.attributes[i].value));
        }
    }
};

/**
 * parse child nodes recursive
 */
CompilerProto.compileChildNode = function (ele) {

    if (!ele.childNodes) {
        return;
    }

    var i = Array.prototype.slice.call(ele.childNodes).length;

    while (i--) {
        if (utils.isElement(ele.childNodes[i])) {
            this.compile(ele.childNodes[i]);
        }
    }
};

/**
 * bind directives
 */
CompilerProto.bindDirectives = function (name, dirs) {

    var i = dirs.length,
        dir;

    while (i--) {
        dir = new Directive(name, dirs[i], this.vm.directive[name], this, this.ele);

        this.createBinding(dir);
    }
};

/**
 * create data bind
 */
CompilerProto.createBinding = function (dir) {

    if (!this.bindings[dir.key]) {
        this.bindings[dir.key] = new Binding(this, dir.key);
    }
};

module.exports = Compiler;