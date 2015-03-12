'use strict';

ocean.component({
    name: 'style',
    data: {
        width: 200,
        height: 50
    },
    methods: {
        adjust: function (action, target) {

            if (action === 'plus') {
                this.$data[target] += 50;
            } else {
                this.$data[target] -= 50;
                if (this.$data[target] < 0) {
                    this.$data[target] = 0;
                }
            }
        }
    }
});