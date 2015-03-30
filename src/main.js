'use strict';

var ViewModel = require('./viewmodel'),
    error = require('./error'),
    config = require('./config'),
    vmMap = {},
    vmNameSet = [];

/**
 * Create VM component function that exposed to the user
 * return first VM instance
 */
function component(options) {

    // throws error if options is invalid
    checkOptions(options);

    return createVmInstances(options);
}

/**
 * Query VM instance Array By component name
 */
function queryVm(cmpName) {

    return vmMap[cmpName];
}

/**
 * Check if the component's option is legal
 */
function checkOptions(options) {

    var pro;

    if (!options.name && !options.name.trim().length) {
        error.throw(error.optionInvalid);
    }

    if (options.data && options.methods) {
        for (pro in options.data) {
            if (options.methods[pro]) {
                error.throw(error.methodConflict, pro);
            }
        }
    }

    // check VM component whether define multiple
    // only when VM vomponent was instanced
    if (vmNameSet.indexOf(options.name) !== -1) {
        error.throw(error.cmpConflict, options.name);
    }
    vmNameSet.push(options.name);
}

/**
 * Query the elements that option indicate
 * and create VM instances
 * return the first VM instance
 */
function createVmInstances(options) {

    var eles = document.querySelectorAll(config.prefix + options.name),
        i = eles.length,
        firstVM, vm;

    while (i--) {
        vm = new ViewModel(options, eles[i]);
        putVmMap(vm, eles[i], options);

        firstVM = firstVM ? firstVM : vm;
    }

    return firstVM;
}

/**
 * Put vm with reference inio vm map 
 */
function putVmMap(vm, element, options) {

    var ref = ViewModel.getReference(element),
        refMap = vmMap[options.name];
    if (ref) {
        refMap = refMap ? refMap : [];
        refMap[ref] = vm;
    }
}

module.exports = {

    component: component,

    $: queryVm
};