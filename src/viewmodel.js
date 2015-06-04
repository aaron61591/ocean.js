'use strict';

var Compiler = require('./compiler'),
    CONF = require('./config');

/**
 * ViewModel class 
 * expose api to user that operate datas
 */
function ViewModel(opt, ele) {

    this.initProps(opt, ele);
}

var VMProto = ViewModel.prototype;

/**
 * Initialize VM properties
 */
VMProto.initProps = function (opt, ele) {

    this.$opt = opt;
    this.$data = opt.data;
    this.$method = opt.method;
    this.$compiler = new Compiler(this, opt, ele);
};

/**
 * execute viewmodel hook 
 */
VMProto.execHook = function (hook) {

    return this.$opt[hook] && this.$opt[hook]();
};

/**
 * get vm reference by element
 */
ViewModel.getRef = function (ele) {

    return ele.getAttribute(CONF.PREFIX + CONF.DIRECTIVE.REF);
};

module.exports = ViewModel;