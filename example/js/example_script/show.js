'use strict';

ocean.component({
    name: 'show',
    data: {
        isShow: true
    },
    methods: {
        switchStatus: function () {
            this.$data.isShow = !this.$data.isShow;
        },
        isShow: function (isShow) {
        	return isShow;
        }
    }
});