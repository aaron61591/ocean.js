'use strict';

var error = module.exports = {

    optionInvalid: 0,

    cmpConflict: 1,

    noMethod: 2,

    methodConflict: 3,

    errPrefix: '[oceanjs] ',

    throw: function (errorType, msg) {

        switch (errorType) {
        case error.optionInvalid:
            msg = 'option name invalid';
            break;
        case error.cmpConflict:
            msg = 'cmp name comflict \'' + msg + '\'';
            break;
        case error.noMethod:
            msg = 'method is not defined \'' + msg + '\'';
            break;
        case error.methodConflict:
            msg = 'method name is conflict \'' + msg + '\'';
            break;
        }

        throw new Error(error.errPrefix + ' : ' + msg);
    }
};