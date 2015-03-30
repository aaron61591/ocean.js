'use strict';

ocean.component({
    name: 'event-bind',
    data: {
    	count: 0
    },
    methods: {
    	sayHello: function (msg) {
    		alert(msg + ':' + (++this.$data.count));
    	}
    }
});