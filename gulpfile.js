var gulp = require("gulp"),
		bower = require("bower"),
		less = require("gulp-less"),
		plumber = require("gulp-plumber"),
		postcss = require("gulp-postcss"),
		autoprefixer = require("autoprefixer")
		comdel = require("postcss-discard-comments"),
		browser = require("browser-sync"),
		media = require("css-mqpacker"),
		minify = require("gulp-csso"),
		rename = require("gulp-rename"),
		imagemin = require("gulp-imagemin"),
		svgmin = require("gulp-svgmin"),
		svgstore = require("gulp-svgstore"),
		run = require("run-sequence"),
		del = require("del");

gulp.task("bower", function(){
	return bower.commands
		.install(["normalize-css"], {save:true}
		);
});

gulp.task("norm", function(){
	return gulp.src("bower_components/normalize-css/normalize.css")
		.pipe(rename("normalize.less"))
		.pipe(gulp.dest("dev/styles/global"));
});

gulp.task("style", ["norm"], function(){
	gulp.src("dev/styles/style.less")
	.pipe(less())
	.pipe(plumber())
	.pipe(postcss([
		autoprefixer({browsers:"last 10 versions"}),
		media({sort: true}),
		comdel({removeAllButFirst: true})
	]))
	.pipe(gulp.dest("dist/styles"))
	.pipe(minify())
	.pipe(postcss([
		comdel({removeAll: "true"})
		]))
	.pipe(rename("style.min.css"))
	.pipe(gulp.dest("dist/styles"))
	.pipe(browser.reload({stream: true}));
});

gulp.task("image", function(){
	return gulp.src("dev/img/**/*.{jpg,png,gif}")
	.pipe(plumber())
	.pipe(imagemin([
		imagemin.optipng({optimizationLevl: 3}),
		imagemin.jpegtran({progressive: true})
	]))
	.pipe(gulp.dest("dist/img"));
});

gulp.task("svg", function(){
	return gulp.src("dev/img/*.svg")
	.pipe(plumber())
	.pipe(svgmin())
	.pipe(gulp.dest("dist/img"));
});

gulp.task("spritesvg", function(){
	gulp.src("dev/svgsprite/*.svg")
	.pipe(svgmin())
	.pipe(svgstore({inlineSvg: true}))
	.pipe(rename("sprite.svg"))
	.pipe(gulp.dest("dev/svgsprite/sprite"));
});

gulp.task("reload", function(){
	browser.reload();
})

gulp.task("deldist", function(){
	return del.sync("dist");
});

gulp.task("watch", ["build"], function(){
	browser.init({server:"dist"});
	gulp.watch("dev/styles/**/*.less", ["style"]);
	gulp.watch("dev/js/*.js", function(){
		gulp.src("dev/js/*.js")
		.pipe(gulp.dest("dist/js"));
		browser.reload();
	});
	gulp.watch("dev/*.html", function(){
		gulp.src("dev/*.html")
		.pipe(gulp.dest("dist"));
		browser.reload();
	});
	gulp.watch("dev/img/**/*.{jpg,png,gif}", ["image"]);
	gulp.watch("dist/img/**/*.{jpg,png,gif}", ["reload"]);
	gulp.watch("dev/img/**/*.svg", ["svg"]);
	gulp.watch("dist/img/**/*.svg", ["reload"]);
});


gulp.task("copy", function(){
	gulp.src([
		"dev/*.html",
		"dev/fonts/**/*.{woff2,woff}",
		"dev/js/*.js",
		],
		{base:"dev"})
	.pipe(gulp.dest("dist"));
});

gulp.task("build", function(fn){
	run("deldist", "style","image","svg","copy",fn);
});

gulp.task("firstrun", ["bower"], function(){
	console.log("Complete!");
});