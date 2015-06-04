'use strict';

oceanjs.component({
    name: 'bind',
    data: {
        a: 1,
        b: 2,
        // c: {
        //     arr: ['t1', 't2', {
        //         test: 'test'
        //     }]
        // }
    },
    methods: {
        add: function (a, b) {
            return parseInt(a, 10) + parseInt(b, 10);
        }
    },
    created: function () {

        console.log('created');
    },
    ready: function () {

        console.log('ready');
    }
});