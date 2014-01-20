module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            dist: {
                files: {
                    'tripeg.min.js': ['src/tripeg-ui.js'],
                },
                options: {
                    transform: ['uglifyify']
                }
            }
        },
        jasmine_node: {
            options: {
                specNameMatcher: "./spec", // load only specs containing specNameMatcher
                projectRoot: ".",
                requirejs: false,
                forceExit: true
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-jasmine-node');

    grunt.registerTask('default', ['browserify']);
    grunt.registerTask('test', ['jasmine_node']);

};
