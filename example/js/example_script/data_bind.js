'use strict';

ocean.component({
    name: 'data-bind',
    data: {
        a: 1,
        b: 2
    },
    methods: {
        add: function (a, b) {
            return parseInt(a, 10) + parseInt(b, 10);
        }
    }
});