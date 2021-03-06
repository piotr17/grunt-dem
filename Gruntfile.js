module.exports = function (grunt) {
    var path = require('path');
    var param = grunt.option('target');
    var cdnUrl = ''
    var utmSource = ''
    var baseName;
    var baseUrl = '' // Example google.it
    if (param) {
        baseName = param.replace(/(.*?)\_(.*?)\_(.*?)\_/, "");
    }
    var cachedFileNames = [];
    var demoName = [];
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
            // demo to ftp
            demo: 'demo',
            //temporary files
            tmp: 'tmp',
            //security vault
            arch: 'archive',
            //Jekyll Site
            jekyll: 'jekyll',
            //pattern to HTML email files
            email: '*.html',
            //images to deploy
            img: 'images'
        },
        replace: {
            html: {
                src: ['<%= paths.src %>/*.html'],
                overwrite: true, // overwrite matched source files 
                replacements: [{
                    from: '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">',
                    to: '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge">\n<link rel="stylesheet" href="css/responsive.css">'
                }, {
                    from: '<html>',
                    to: '<!DOCTYPE html>\n<!-- This comment line needed for bootstrap to work on mobile devices -->\n<html>'
                }]
            },
            jekyll: {
                src: ['<%= paths.jekyll %>/*.html'],
                overwrite: true,
                replacements: [{
                    from: '<!DOCTYPE',
                    to: '---- \nlayout : page\n--- <!DOCTYPE'
                }]
            },
            jekyllhtml: {
                src: ['<%= paths.jekyll %>/*.html'],
                overwrite: true,
                replacements: [{
                    from: '<html>',
                    to: '--- \nlayout : page\n---\n<html>'
                }]
            }
        },
        compass: { // Task 
            src: { // Target 
                options: { // Target options 
                    sassDir: '<%= paths.src %>/scss',
                    cssDir: '<%= paths.src %>/css',
                    environment: 'development'
                }
            }
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
            },
            css: {
                files: ['<%= paths.src %>/scss/*.scss'],
                tasks: ['compass'],
                options: {
                    livereload: true,
                }
            }
        },
        concurrent: {
            serve: ['connect', 'watch']
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
                        var fileName = yr + "_" + mh + "_" + dy + "_" + src;
                        return dest + "/" + fileName;
                    }
                }]

            },
            jekyll: {
                expand: true,
                cwd: '<%= paths.dist %>',
                src: ['<%= paths.email %>'],
                dest: '<%= paths.jekyll %>',
            },
            sass: {
                src: 'libraries/scss/lr_responsive_dem.scss',
                dest: 'src/scss/responsive.scss',
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
                    if (dy < 10) {
                        dy = '0' + dy;
                    }
                    if (mh < 10) {
                        mh = '0' + mh;
                    }
                    var str = src;
                    var fin = str.replace(/(.*?)\_(.*?)\_(.*?)\_/, "");
                    var fileName = str.replace(".html", "");
                    cachedFileNames.push(fileName);
                    return dest + "/" + yr + "_" + mh + "_" + dy + "_" + src;
                }
            },
            archive_img: {
                expand: true,
                cwd: '<%= paths.src %>/images',
                src: ['**'],
                dest: '<%= paths.arch %>/img',
                rename: function (dest, src) {
                    var d = new Date();
                    var mh = d.getMonth() + 1;
                    var dy = d.getDate();
                    var yr = d.getFullYear();
                    if (dy < 10) {
                        dy = '0' + dy;
                    }
                    if (mh < 10) {
                        mh = '0' + mh;
                    }
                    return dest + "/" + yr + "_" + mh + "_" + dy + "_" + src;
                }
            },
            archive_css: {
                expand: true,
                cwd: '<%= paths.src %>/css',
                src: ['**'],
                dest: '<%= paths.arch %>/css',
                rename: function (dest, src) {
                    var d = new Date();
                    var mh = d.getMonth() + 1;
                    var dy = d.getDate();
                    var yr = d.getFullYear();
                    if (dy < 10) {
                        dy = '0' + dy;
                    }
                    if (mh < 10) {
                        mh = '0' + mh;
                    }
                    return dest + "/" + cachedFileNames[0] + "/" + yr + "_" + mh + "_" + dy + "_" + src;
                }
            },
            return: {
                expand: true,
                cwd: '<%= paths.arch %>/',
                src: '*' + param + '.html',
                dest: '<%= paths.src %>/',
                rename: function (dest, src) {
                    var str = src;
                    var fin = str.replace(/(.*?)\_(.*?)\_(.*?)\_/, "");
                    return dest + fin;
                }
            },
            return_img: {
                expand: true,
                cwd: '<%= paths.arch %>/img',
                src: param + '**',
                dest: '<%= paths.src %>/images/',
                rename: function (dest, src) {
                    var str = src;
                    var fin = str.replace(/(.*?)\_(.*?)\_(.*?)\_/, "");
                    return dest + fin;
                }
            },
            return_css: {
                expand: true,
                cwd: '<%= paths.arch %>/css/' + baseName,
                src: '**',
                dest: '<%= paths.src %>/css/',
                rename: function (dest, src) {
                    var str = src;
                    var fin = str.replace(/(.*?)\_(.*?)\_(.*?)\_/, "");
                    return dest + fin;
                }
            },
            imagesTmp: {
                expand: true,
                cwd: '<%= paths.src %>/images',
                src: ['**'],
                dest: '<%= paths.tmp %>/images/'
            },
            imagesCss: {
                expand: true,
                cwd: '<%= paths.src %>/css',
                src: ['**'],
                dest: '<%= paths.tmp %>/css/'
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
                cdn: cdnUrl,
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
                src: ['index.html', '{,*/}*.html', '{,**/}*.html']
            }
        },
        premailer: {
            demo: {
                options: {
                    verbose: true,
                    removeClasses: false,

                },
                files: [{
                    expand: true,
                    cwd: '<%= paths.src %>/',
                    src: ['*.html'],
                    dest: '<%= paths.src %>/demo/',
                    rename: function (dest, src) {
                        var d = new Date();
                        var mh = d.getMonth() + 1;
                        var dy = d.getDate();
                        var yr = d.getFullYear();
                        if (dy < 10) {
                            dy = '0' + dy;
                        }
                        if (mh < 10) {
                            mh = '0' + mh;
                        }
                        var fileName = yr + "_" + mh + "_" + dy + "_" + src;
                        demoName.push(fileName);
                        return dest + "/" + fileName;
                    }
                }]
            },
            dist: {
                options: {
                    queryString: 'utm_source=' + utmSource + '&utm_medium=email',
                    verbose: true,
                    removeClasses: false,
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
                    queryString: 'utm_source=' + utmSource + '&utm_medium=email',
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
            demo: ["<%= paths.src %>/demo/**"]
        },
        screenshot: {
            default_options: {
                options: {
                    path: '<%= paths.arch %>',
                    files:
                    // local config options 
                    {
                        type: 'local',
                        path: '<%= paths.src %>', // path to directory of the webpage 
                        port: 8000, // port of startup http server 
                        src: '2018_2_7_idea.html',
                        dest: 'cachedFileNames[0]' + '.jpg',
                        delay: 3000
                    },

                    viewport: ['640x960'] // any (X)x(Y) size 
                }
            }
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
        ftp_push: {
            demo: {
                options: {
                    authKey: "key1",
                    host: baseUrl,
                    dest: "/web/newsletter/000-grunt/demo",
                    port: 21,
                    incrementalUpdates: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= paths.src %>/demo/',
                    src: "**"
                }]
            },
            demoImg: {
                options: {
                    authKey: "key1", //credentials for login
                    host: baseUrl,
                    dest: "/newsletter/000-grunt/demo/images",
                    port: 21,
                    incrementalUpdates: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= paths.src %>/images/',
                    src: '**'
                }]
            },
            img: {
                options: {
                    authKey: "key1",
                    host: baseUrl,
                    dest: "/web/newsletter/000-grunt/images",
                    port: 21,
                    incrementalUpdates: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= paths.tmp %>/images',
                    src: "**"
                }]
            },
            dist: {
                options: {
                    authKey: "key1",
                    host: baseUrl,
                    dest: "/web/newsletter/000-grunt/",
                    port: 21,
                    incrementalUpdates: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= paths.dist %>',
                    src: "**"
                }]
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
        console.log(baseName);
    });
    grunt.registerTask('serve', [
        'connect:app',
        'watch'
    ]);
    grunt.registerTask('demourl', function () {
        demoName.forEach(function (element) {
            grunt.log.writeln('http://test.bec.it/newsletter/000-grunt/demo/' + element);
        });
    });
    grunt.registerTask('start', [
        'copy:sass',
        'compass:src',
        'replace:html',
        'connect:app',
        'watch'
    ]);
    grunt.registerTask('demo', [
        'clean:demo',
        'premailer:demo',
        'ftp_push:demo',
        'ftp_push:demoImg',
        'demourl'
    ]);
    grunt.registerTask('return', [
        'clean:src',
        'copy:return',
        'copy:return_img',
        'copy:return_css'
    ]);
    grunt.registerTask('archive', [
        'copy:archive',
        'copy:archive_img',
        'copy:archive_css',
    ]);
    grunt.registerTask('build', [
        'useminPrepare',
        'clean:tmp',
        'clean:dist',
        'copy:archive',
        'copy:archive_img',
        'copy:archive_css',
        'copy:tmp',
        'copy:imagesTmp',
        'copy:imagesCss',
        'filerev:tmp',
        'usemin',
        'premailer:dist',
        'cdn:tmp',
        'htmlmin:tmp',
        'copy:dist',
        'copy:imgDeploy',
        'ftp_push:dist',
        'ftp_push:img',
        'copy:jekyll',
        'clean:tmp',
        'clean:src',
    ]);
};

/* 
MANUAL

grunt start to bootstrap the email
grunt serve to start the livereload server
grunt demo to deploy a demo file via FTP
grunt return -target=filename without .html to return an email from archive
grunt build to create the final code, archive the email and clean src 
*/