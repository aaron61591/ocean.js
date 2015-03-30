'use strict';

var Compiler = require('./compiler'),
    utils = require('./utils'),
    def = utils.defProtected;

/**
 * ViewModel class 
 * expose api to user that operate datas
 */
function ViewModel(options, ele) {

    this.$compiler = new Compiler(this, options, ele);
}

ViewModel.getReference = function () {

    // TODO
};


var VMProto = ViewModel.prototype;

module.exports = ViewModel;