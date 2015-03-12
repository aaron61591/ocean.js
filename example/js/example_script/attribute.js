'use strict';

ocean.component({
    name: 'attr',
    data: {
        src: 'play'
    },
    methods: {
        switchStatus: function () {
            if (this.$data.src === 'play') {
                this.$data.src = 'pause';
            } else {
                this.$data.src = 'play';
            }

        }
    }
});