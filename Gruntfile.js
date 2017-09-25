module.exports = function (grunt) {
    var path = require('path');
    var param = grunt.option('target');
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
                cwd: '<%= paths.src %>',
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
            return: {
                expand: true,
                cwd: '<%= paths.arch %>/',
                src: '*' + param + '.html',
                dest: '<%= paths.src %>/',
                rename: function (dest, src) {
                    var str = src;
                    var fin = str.replace(/(.*)\_(.*)\_(.*)\_/, "")
                    return dest + fin;
                }
            },
            return_img: {
                expand: true,
                cwd: '<%= paths.img %>/',
                src: param + '**',
                dest: '<%= paths.src %>/images/',
                rename: function (dest, src) {
                    var str = src;
                    var fin = str.replace(/\.(.*)\./, ".")
                    return dest + fin;
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
                    queryString: 'utm_source=infodent&utm_medium=email',
                    verbose: true,
                    removeClasses: true,
                    removeComments: true,
                    removeIds: true

                },
                files: [{
                    expand: true,
                    cwd: '<%= paths.tmp %>/',
                    src: ['*.html'],
                    dest: '<%= paths.tmp %>/output/'
                }]
            },
            src: {
                options: {
                    queryString: 'utm_source=infodent&utm_medium=email',
                    verbose: true,
                    removeClasses: true,
                    removeComments: true,
                    removeIds: true,
                    escape_url_attributes: false

                },
                files: [{
                    expand: true,
                    cwd: '<%= paths.src %>/',
                    src: ['*.html'],
                    dest: '<%= paths.src %>/output/'
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
            tmp: {
                src: '<%= paths.tmp %>/images/**/*.{jpg,jpeg,gif,png,webp}'
            }
        },
        useminPrepare: {
            html: '<%= paths.tmp %>/*.html',
        },
        'ftp-deploy': {
            img: {
                auth: {
                    host: 'gemini3.bec.it',
                    port: 21,
                    authKey: 'key1'
                },
                src: '<%= paths.tmp %>/images',
                dest: '/web/newsletter/000-grunt/images'
            },
            dist: {
                auth: {
                    host: 'gemini3.bec.it',
                    port: 21,
                    authKey: 'key1'
                },
                src: '<%= paths.dist %>',
                dest: '/web/newsletter/000-grunt'
            },
            demo: {
                auth: {
                    host: 'gemini3.bec.it',
                    port: 21,
                    authKey: 'key1'
                },
                src: '<%= paths.src %>',
                dest: '/web/newsletter/000-grunt/demo'
            }
        },
        usemin: {
            html: '<%= paths.tmp %>/*.html',
            options: {
                assetsDirs: ['<%= paths.tmp %>', '<%= paths.tmp %>/images/**']
            }
        },
        screenshot: {
            default_options: {
                options: {
                    path: '<%= paths.arch %>',
                    files: [{
                        type: 'local',
                        path: '<%= paths.dist %>',
                        port: 8090,
                        src: '*.html',
                        dest: '<%= paths.arch %>/screenshot',
                        delay: 500
                    }],
                    viewport: ['640x960']
                }
            },

        },
        filenamesToJson: {
            options: {
                // true if full path should be included, default is false
                fullPath: false,
                // true if file extension should be included, default is false 
                extensions: true
            },
            // any valid glob
            //files: '<%= paths.arch %>/*.html',
            files: 'http://test.bec.it/newsletter/000-grunt/*.html',

            // path to write json to
            destination: '<%= paths.arch %>/json/output.json'
        }

    });
    grunt.registerTask('default', 'default task description', function () {
        console.log(param);
    });
    grunt.registerTask('serve', [
        'connect:app',
        'watch:app'
    ]);
    grunt.registerTask('demo', [
        'ftp-deploy:demo',
    ]);
    grunt.registerTask('return', [
        'clean:src',
        'copy:return',
        'copy:return_img'
    ]);
    grunt.registerTask('build', [
        'useminPrepare',
        'clean:tmp',
        'clean:dist',
        'copy:archive',
        'copy:tmp',
        'copy:imagesTmp',
        'filerev:tmp',
        'usemin',
        'cdn:tmp',
        'premailer:dist',
        'htmlmin:tmp',
        'copy:dist',
        'copy:imgDeploy',
        'ftp-deploy:dist',
        'ftp-deploy:img',
        'clean:tmp',
        'clean:src'
    ]);
};