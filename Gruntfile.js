module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        jshint: {
            all: [
                'example/**/*.js',
                'src/*.js'
            ],
            options: {
                jshintrc: '.jshintrc',
                ignores: [
                    'example/js/seajs/*.js',
                    'example/js/cmp/vue.js',
                    'example/js/cmp/share.js',
                    'example/js/core/*.js'
                ],
            }
        },
        express: {
            options: {
                port: 4000
            },
            dev: {
                options: {
                    script: 'express/server.js'
                }
            }
        },
        watch: {
            express: {
                files: [
                    'express/*.js'
                ],
                tasks: ['express:dev'],
                options: {
                    spawn: false
                }
            },
            example: {
                files: [
                    'example/**/*',
                ],
                options: {
                    livereload: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-express-server');

    // grunt.registerTask('default', ['jshint', 'express:dev', 'watch']);
    grunt.registerTask('default', ['express:dev', 'watch']);
};