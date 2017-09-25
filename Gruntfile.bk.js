module.exports = function (grunt) {
    var path = require('path');
    require('load-grunt-tasks')(grunt);
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        paths: {
            //filename
            filename: grunt.template.today('yy-mm-dd'),
            //where to store built files
            dist: 'dist',
            //sources
            src: 'src',
            //temporary files
            tmp: 'tmp',
            //security vault
            arch: 'archive',
            //pattern to HTML email files
            email: '*.html',
            //images to deploy
            img: 'images'
        },
        connect: {
            app: {
                options: {
                    base: '<%= paths.src %>',
                    useAvailablePort: true,
                    hostname: 'localhost',
                    livereload: 35729,
                    // middleware: function (connect) {
                    //    return [require('connect-livereload')];
                    //},
                    open: true
                }
            }
        },
        watch: {
            app: {
                files: ['<%= paths.src %>/*'],
                options: {
                    livereload: true
                }
            }
        },
        htmlmin: {
            tmp: {
                expand: true,
                cwd: '<%= paths.tmp %>/output/',
                src: ['*.html'],
                dest: '<%= paths.tmp %>/output/',
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                }
            }
        },
        copy: {
            tmp: {
                expand: true,
                cwd: '<%= paths.src %>',
                src: ['<%= paths.email %>'],
                dest: '<%= paths.tmp %>/'
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= paths.tmp %>/output/',
                    src: ['<%= paths.email %>'],
                    dest: '<%= paths.dist %>',
                    rename: function (dest, src) {
                        var d = new Date();
                        var mh = d.getMonth() + 1;
                        var dy = d.getDate();
                        var yr = d.getFullYear();
                        return dest + "/" + yr + "_" + mh + "_" + dy + "_" + src;
                    }
                }]

            },
            archive: {
                expand: true,
                cwd: '<%= paths.tmp %>',
                src: ['<%= paths.email %>'],
                dest: '<%= paths.arch %>/',
                rename: function (dest, src) {
                    var d = new Date();
                    var mh = d.getMonth() + 1;
                    var dy = d.getDate();
                    var yr = d.getFullYear();
                    return dest + "/" + yr + "_" + mh + "_" + dy + "_" + src;
                }
            },
            imagesTmp: {
                expand: true,
                cwd: '<%= paths.src %>/images',
                src: ['**'],
                dest: '<%= paths.tmp %>/images/'
            },
            imgDeploy: {
                expand: true,
                cwd: '<%= paths.tmp %>/images',
                src: ['**'],
                dest: '<%= paths.img %>/'
            }
        },
        cdn: {
            options: {
                /** @required - root URL of your CDN (may contains sub-paths as shown below) */
                cdn: 'http://test.bec.it/newsletter/000-grunt/',
                /** @optional  - if provided both absolute and relative paths will be converted */
                flatten: true,
                /** @optional  - if provided will be added to the default supporting types */
                supportedTypes: {
                    'phtml': 'html'
                }
            },
            tmp: {
                /** @required  - gets sources here, may be same as dest  */
                cwd: '<%= paths.tmp %>/',
                /** @required  - puts results here with respect to relative paths  */
                dest: '<%= paths.tmp %>/',
                /** @required  - files to process */
                src: ['index.html', '*.css', '{,*/}*.html', '{,**/}*.html']
            }
        },
        premailer: {
            tmp: {
                options: {
                    queryString: 'utm_source=infodent',
                    verbose: true,
                    removeClasses: true,

                },
                files: {
                    '<%= paths.tmp %>/output/<%= paths.filename %>.html': ['<%= paths.tmp %>/*.html']
                }
            },
            dist: {
                options: {
                    queryString: 'utm_source=infodent',
                    verbose: true,
                    removeClasses: true,

                },
                files: [{
                    expand: true,
                    cwd: '<%= paths.tmp %>/',
                    src: ['*.html'],
                    dest: '<%= paths.tmp %>/output/'
                }]
            }
        },
        clean: {
            tmp: ["<%= paths.tmp %>/**"],
            dist: ["<%= paths.dist %>/**"],
            src: ["<%= paths.src %>/*"],
        },
        filerev: {
            options: {
                algorithm: 'md5',
                length: 8
            },
            tmp: { src: '<%= paths.tmp %>/images/**/*.{jpg,jpeg,gif,png,webp}' }
        },
        useminPrepare: {
            html: '<%= paths.tmp %>/*.html',
        },
        'ftp-deploy': {
            build: {
                auth: {
                    host: 'gemini3.bec.it',
                    port: 21,
                    authKey: 'key1'
                },
                src: '<%= paths.tmp %>/images',
                dest: '/web/newsletter/000-grunt/images'
            }
        },
        usemin: {
            html: '<%= paths.tmp %>/*.html',
            options: {
                assetsDirs: ['<%= paths.tmp %>', '<%= paths.tmp %>/images/**']
            }
        }

    });
    grunt.registerTask('default', 'default task description', function () {
        console.log("It Works!");
    });
    grunt.registerTask('serve', [
        'connect:app',
        'watch:app'
    ]);
    grunt.registerTask('build', [
        'useminPrepare',
        'clean:tmp',
        'clean:dist',
        'copy:tmp',
        'copy:imagesTmp',
        'filerev:tmp',
        'usemin',
        'copy:archive',
        'cdn:tmp',
        'premailer:dist',
        'htmlmin:tmp',
        'copy:dist',
        'copy:imgDeploy',
        'ftp-deploy:build',
        'clean:tmp',
        'clean:src'
    ]);
};