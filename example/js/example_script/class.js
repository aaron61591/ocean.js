'use strict';

ocean.component({
    name: 'class',
    data: {
    	isBlack: false,
    	isGreen: true
    },
    methods: {

        black: function () {
        	this.$data.isBlack = true;
        	this.$data.isGreen = false;
        },

        green: function () {
        	this.$data.isBlack = false;
        	this.$data.isGreen = true;
        }
    }
});