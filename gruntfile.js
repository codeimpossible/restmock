module.exports = function(grunt) {
    function withVendor() {
        return {
            src: [
                'src/*.js'
            ],
            options: {
                vendor: Array.prototype.slice.call(arguments, 0)
            }
        };
    };

    grunt.initConfig({

        meta: {
            files: {
                libs: [
                    'public/jquery.js'
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
            options: {
                specs: 'spec/*_spec.js',
                helpers: ['spec/helpers/**/*.js', 'node_modules/jasmine-jquery/lib/jasmine-jquery.js']
            },
            jquery20: withVendor('public/jquery.2.0.3.js'),
            jquery110: withVendor('public/jquery.1.10.2.js'),
            jquery19: withVendor('public/jquery.1.9.1.js'),
            jquery18: withVendor('public/jquery.1.8.3.js'),
            jquery17: withVendor('public/jquery.1.7.2.js')
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-coffee');

    grunt.registerTask('default', [ 'coffee', 'jasmine' ] );
};
