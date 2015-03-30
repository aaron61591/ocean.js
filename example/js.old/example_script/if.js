'use strict';

ocean.component({
    name: 'if',
    data: {
        isShow: true
    },
    methods: {
        switchStatus: function () {
            this.$data.isShow = !this.$data.isShow;
        }
    }
});