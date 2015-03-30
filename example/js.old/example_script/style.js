'use strict';

ocean.component({
    name: 'style',
    data: {
        width: 4,
        height: 1
    },
    methods: {
        adjust: function (action, target) {

            if (action === 'plus') {
                this.$data[target] += 1;
            } else {
                this.$data[target] -= 1;
                if (this.$data[target] < 0) {
                    this.$data[target] = 0;
                }
            }
        }
    }
});