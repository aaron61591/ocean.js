'use strict';

window.vm = ocean.component({
    name: 'data-bind',
    data: {
        a: 1,
        b: 2,
        c: {
            arr: ['t1', 't2', {
                test: 'test'
            }]
        }
    },
    methods: {
        add: function (a, b) {
            return parseInt(a, 10) + parseInt(b, 10);
        }
    }
});