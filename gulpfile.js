const gulp = require('gulp');
const php2html = require("gulp-php2html");

gulp.task('include', () => {
    gulp.src("./includes/*.php")
        .pipe(php2html())
        .pipe(gulp.dest("./dist/includes"));
});

gulp.task('default', ['include']);
