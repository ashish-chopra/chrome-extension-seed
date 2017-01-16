/*
       File: gulpfile.js
       Author: Ashish Chopra
       Updated on: 21 may, 2016
       -----------------------------------------
 
       gulpfile.js is a build automation script for chrome extension projects.
       It supports both development and production level build lifecycle. 
       Development lifecycle supports copying assets, linting, CSS precompiling,
       copying templates and HTML and live reloading on any changes. Production 
       lifecycle generates an optimized build in which code is minified, images are 
       optimized etc.
       
       This build script can be used with following commands:
       gulp                    -- default task used during development, switch on live reloading.
       gulp clean              -- cleans the output of last build inside `dist` folder
       gulp build:[options]    -- builds the code for defined options {dev | prod}.
       gulp test               -- executes the test cases (coming soon)
       gulp serve              -- It hosts the `dist` folder on a web server at port 3000 (default)
       
       NOTE: Some commands mentioned above are not working right now. 
       For more read the FUTURE WORK section. These are added on NEED BASIS.   
    
       FUTURE WORK
       1. Support for Unit Testing (if needed).
       2. Support for developing production ready builds.
       6. Fixing linking errors of sourcemaps.
       
 */



/* IMPORT USED PACAKGES */

var gulp = require('gulp'),
    clean = require('gulp-clean'),
    connect = require('gulp-connect'),
    mbf = require('main-bower-files'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass'),
    sourcemap = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    runSequence = require('run-sequence'),
    source = require('vinyl-source-stream'),
    configs = require('./package.json'),
    zip = require('gulp-zip'),
    lint = require('gulp-eslint'),
    livereload = require('gulp-livereload');


/* DEFINE PATH AND GLOBAL CONSTANTS */
var port = 3000,
    path = {
        bower: 'bower_components',
        scripts: "src/scripts/**",
        templates: "src/templates/**",
        scss: "src/scss/**/*.scss",
        styles: "src/scss/**/*.scss",
        index: "src/*.html",
        assets: "src/assets/**",
        data: "src/data/**",
        vendor: 'dist/vendor',
        css: 'dist/css',
        dist: "dist",
        root: "dist",
        versionFile: 'version.txt',
        package: 'package',
        manifest: 'src/manifest.json'
    },
    sassOptions = {
        errLogToConsole: true,
        outputStyle: 'compressed'
    },
    autoprefixerOptions = {
        browsers: ['last 2 versions']
    },
    BUILD_TYPE = {
        PROD: "Production",
        DEV: "Development"
    },
    buildType = BUILD_TYPE.PROD; // holds the type of build 'development' or 'production'


/* DEFINING SUB TASKS */


// copy the static content like images
// and fonts in dist location
gulp.task('statics', () => {
    return gulp.src([path.assets], {
        base: 'src'
    })
        .pipe(gulp.dest(path.dist));
});

// process the index html and templates and manifest.json
gulp.task('html', () => {
    return gulp.src([path.index, path.templates, path.manifest], {
        base: 'src'
    })
        .pipe(gulp.dest(path.dist));
});

// process dummy data files 
gulp.task('data', () => {
    return gulp.src(path.data, {
        base: 'src'
    })
        .pipe(gulp.dest(path.dist));
});

// linting process
gulp.task('lint', () => {
    return gulp.src(path.src, {
        base: 'src'
    })
        .pipe(lint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});
// process sass and generate autoprefixed CSS and sourcemaps
// ERROR: sourcemaps linking is an issue in chromeDevTools. Fix needed.
gulp.task('css', () => {
    return gulp.src(path.scss, {
        base: 'src/scss'
    })
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(sourcemap.init())
        .pipe(sass(sassOptions))
        .pipe(sourcemap.write({
            includeContent: false,
            sourceRoot: 'src/scss/'
        }))
        .pipe(sourcemap.init({
            loadMaps: true
        }))
        .pipe(autoprefixer(autoprefixerOptions))
        .pipe(sourcemap.write('./'))
        .pipe(gulp.dest(path.css));
});

// process domain scripts
gulp.task('js', () => {
    return gulp.src(path.scripts, {
        base: 'src'
    })
        .pipe(gulp.dest(path.dist));
});

//process vendor scripts and styles
gulp.task('vendor', () => {
    return gulp.src(mbf(), {
        base: path.bower
    })
        .pipe(gulp.dest(path.vendor));
});

// watching the changes and fire up the tasks
gulp.task('watch', () => {
    livereload.listen();

    gulp.watch([
        'dist/assets/**/*',
        'dist/scripts/**/*.js',
        'dist/styles/**/*.css',
        'dist/**/*.html',
        'dist/manifest.json'
    ]).on('change', livereload.reload);
    // watching static content
    gulp.watch(path.assets, ['statics'])
    // watching html
    gulp.watch([path.index, path.templates, path.manifest], ['html'])
    //watching css
    gulp.watch(path.styles, ['css'])
    //watching scripts
    gulp.watch(path.scripts, ['js']);
    //watching data
    gulp.watch(path.data, ['data']);

});

// connects the server at given port and root.
// enables the live reloading.
gulp.task('connect', () => {
    return connect.server({
        livereload: true,
        root: path.root,
        port: port
    });
});


//cleans the dist and package folder
function cleanTask() {
    return gulp.src([path.dist, path.package], {
        read: false
    })
        .pipe(clean());
}

function defaultTask() {
    runSequence('clean', 'common', 'watch');
}

function buildDevTask() {
    buildType = BUILD_TYPE.DEV;
    runSequence('clean', 'common');
}

function buildProdTask() {
    buildType = BUILD_TYPE.PROD;
    console.log('coming soon...');
}

function packageTask() {
    runSequence('clean', 'common', 'zip');
}

gulp.task('zip', () => {
    var manifest = require('./dist/manifest.json');
    return gulp.src(path.dist)
        .pipe(zip(`${manifest.name}-${manifest.version}.zip`))
        .pipe(gulp.dest(path.package));
});


/* DEFINE CUSTOM TASK CHAINING */

gulp.task('clean', cleanTask);
gulp.task('default', defaultTask);
gulp.task('build:dev', buildDevTask);
gulp.task('package', packageTask);
gulp.task('common', ['statics', 'vendor', 'html', 'css', 'js', 'data']);
gulp.task('test', ['lint']);
gulp.task('serve', ['connect']);