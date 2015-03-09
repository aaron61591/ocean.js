'use strict';

ocean.define('EventBind', [], function () {

    return function () {
        this.sayHello = function () {
        	alert('hello');
        };
    };
});