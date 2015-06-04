'use strict';

var ViewModel = require('./viewmodel'),
    CONF = require('./config'),
    error = require('./error'),
    VMS = {};

/**
 * Create VM component function that exposed to the user
 * return first VM instance
 */
function component(opt) {

    // throws error if options is invalid
    checkOption(opt);

    return instantiateVM(opt);
}

/**
 * Check if the component's option is legal
 */
function checkOption(opt) {

    checkName(opt);

    checkConflict(opt);

    checkDefined(opt);
}

/**
 * check tag whether indicated
 */
function checkName(opt) {

    if (!opt.name || !opt.name.trim().length || opt.name.toUpperCase() === CONF.CMP_TAGNAME) {
        error.throw(error.optionInvalid);
    }
}

/**
 * check conflict between data and method
 */
function checkConflict(opt) {

    if (opt.data && opt.method) {
        for (var pro in opt.data) {
            if (opt.method[pro]) {
                error.throw(error.methodConflict, pro);
            }
        }
    }
}

/**
 * check VM component whether define multiple
 * only when VM vomponent was instanced
 */
function checkDefined(opt) {

    if (VMS[opt.name]) {
        error.throw(error.cmpConflict, opt.name);
    }
}

/**
 * Query the elements that option indicate
 * and create VM instances
 * return the first VM instance
 */
function instantiateVM(opt) {

    var eles = document.querySelectorAll(opt.name),
        i = eles.length,
        vm, ref;

    while (i--) {
        ref = ViewModel.getRef(eles[i]);

        vm = new ViewModel(opt, eles[i]);

        addRef(vm, ref, opt);
    }

    return vm;
}

/**
 * Put vm with reference inio vm map 
 */
function addRef(vm, ref, opt) {

    var refMap = VMS[opt.name];

    if (!refMap) {
        refMap = VMS[opt.name] = {};
    }

    if (ref) {
        refMap[ref] = vm;
    }
}

module.exports = {

    component: component,

    $: VMS
};