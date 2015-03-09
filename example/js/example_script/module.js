'use strict';
ocean.define('constant.PI', [], function () {
    return 3.14;
});
ocean.define('shape.Circle', ['constant.PI'], function (pi) {
    var Circle = function (r) {
        this.r = r;
    };
    Circle.prototype = {
        area: function () {
            return pi * this.r * this.r;
        }
    };
    return Circle;
});
ocean.define('shape.Rectangle', [], function () {
    var Rectangle = function (l, w) {
        this.l = l;
        this.w = w;
    };
    Rectangle.prototype = {
        area: function () {
            return this.l * this.w;
        }
    };
    return Rectangle;
});
ocean.define('ShapeTypes', ['shape.Circle', 'shape.Rectangle'], function (Circle, Rectangle) {
    return {
        CIRCLE: Circle,
        RECTANGLE: Rectangle
    };
});
ocean.define('ShapeFactory', ['ShapeTypes'], function (ShapeTypes) {
    return {
        getShape: function (type) {
            var shape;
            switch (type) {
            case 'CIRCLE':
                shape = new ShapeTypes[type](arguments[1]);
                break;
            case 'RECTANGLE':
                shape = new ShapeTypes[type](arguments[1], arguments[2]);
                break;
            }
            return shape;
        }
    };
});

var ShapeFactory = ocean.use('ShapeFactory');
console.log(ShapeFactory.getShape('CIRCLE', 5).area());
console.log(ShapeFactory.getShape('RECTANGLE', 3, 4).area());