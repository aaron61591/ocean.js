'use strict';

ocean.define('Visible', [], function () {
	return function () {
		this.status = 'show block';
		this.isShow = false;
		this.switchStatus = function () {
			if (this.status === 'show block') {
				this.status = 'hide';
				this.isShow = true;
			} else {
				this.status = 'show block';
				this.isShow = false;
			}
		};
	};
});