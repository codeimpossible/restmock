module.exports = function(grunt) {
    grunt.initConfig({

        meta: {
            files: {
                libs: [
                    'public/jquery.js',
                    'public/underscore.js',
                    'public/backbone.js'
                ],
                out: [
                    'src/*.js'
                ]
            }
        },

        pkg: grunt.file.readJSON('package.json'),

        coffee: {
            options: {
                bare: true
            },
            specs: {
                expand: true,
                flatten: false,
                src: [
                    'spec/**/*.coffee'
                ],
                dest: '.',
                ext: '.js'
            }
        },

        jasmine: {
            unit: {
                src: [
                    '<%= meta.files.out %>'
                ],
                options: {
                    vendor: [
                        '<%= meta.files.libs %>'
                    ],
                    specs: 'spec/*_spec.js',
                    helpers: ['spec/helpers/**/*.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-coffee');

    grunt.registerTask('default', [ 'coffee', 'jasmine:unit' ] );
};