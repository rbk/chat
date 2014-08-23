module.exports = function(grunt) {
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sass: {
            dist: {
                files: {
                    'assets/css/app.css' : 'assets/sass/app.scss'
                }
            }
        },
        watch: {
            css: {
                files: '**/*.scss',
                tasks: ['sass']
            },
            express: {
                files:  [ '**/*.js' ],
                tasks:  [ 'express:dev' ],
                options: {
                    spawn: false // for grunt-contrib-watch v0.5.0+, "nospawn: t
                }
            }
        },
        express: {
            options: {
                // Override defaults here
                port: 3001
            },
            dev: {
                options: {
                    script: 'server.js'
                }
            },
            prod: {
                options: {
                    script: 'path/to/prod/server.js',
                    node_env: 'production'
                }
            },
            test: {
                options: {
                    script: 'path/to/test/server.js'
                }
            }
  }
    });
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-express-server');
    // grunt.registerTask('default',['watch']);
    grunt.registerTask('default', [ 'express:dev', 'watch' ]);

};