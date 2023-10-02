const gulp = require("gulp");
const fileInclude = require("gulp-file-include"); //подключает 1 html файл в другой
const sass = require("gulp-sass")(require("sass")); //подключает компилятора sass в css
const sassGlob = require("gulp-sass-glob"); //автоматическое подключение чанков scss к main файлу
const server = require("gulp-server-livereload"); //локальный сервер
const clean = require("gulp-clean"); //очистка папки dist
const fileSystem = require("fs"); //для работы с файловой системой
const sourceMaps = require("gulp-sourcemaps"); //для того чтобы видеть в консоли в каком файле лежит стиль - исходный соурсмап

const plumber = require("gulp-plumber"); //вываливает ошибки
const notify = require("gulp-notify"); //вываливает ошибки
const babel = require("gulp-babel");
const webpack = require("webpack-stream");
const imagemin = require("gulp-imagemin"); //оптимизация картинок
const changed = require("gulp-changed"); //проверяет если нет изменний то не оптимизирует файл еще раз

// gulp.src() - откуда берем файлы
// gulp.dest() - куда кладем файлы

//Объекты с конфигом настроек для плагинов
const fileIncludeSettings = {
    prefix: "@@",
    basepath: "@file",
};

const serverOptions = {
    livereload: true,
    open: true,
};

const plumberNotify = (title) => {
    return {
        errorHandler: notify.onError({
            title: title,
            message: "Error <%= error.message %>",
            sound: true,
        }),
    };
};

//удаление папки дист каждый раз
gulp.task("clean:dev", function (done) {
    // если такая папка есть по данному пути то удали ее
    if (fileSystem.existsSync("./build/")) {
        return gulp
            .src("./build/", { read: false })
            .pipe(clean({ force: true }));
    }

    done(); //завершить задачу
});

// подключает чанки html в index.html
gulp.task("html:dev", function () {
    return gulp
        .src(["./src/html/**/*.html", "!./src/html/blocks/*.html"]) //исключили путь папки blocks из диста
        .pipe(changed("./build/", { hasChanged: changed.compareContents }))
        .pipe(plumber(plumberNotify("HTML")))
        .pipe(fileInclude(fileIncludeSettings))
        .pipe(gulp.dest("./build/"));
});

// компиляция scss в css
gulp.task("sass:dev", function () {
    return gulp
        .src("./src/scss/*.scss")
        .pipe(changed("./build/css/"))
        .pipe(plumber(plumberNotify("SCSS")))
        .pipe(sourceMaps.init()) //1-ый запуск инициализация сорсмапа
        .pipe(sassGlob())
        .pipe(sass())
        .pipe(sourceMaps.write()) //записываем сорсмапы
        .pipe(gulp.dest("./build/css/"));
});

// копирование изображений
gulp.task("images:dev", function () {
    //из любой папки любого уровня вложенности и любой файл с лююбым расширением
    return (
        gulp
            .src("./src/img/**/*")
            .pipe(changed("./build/img/"))
            // .pipe(imagemin({ verbose: true })) //при оптимизации показывает в консоли что оптимизировано и насколько
            .pipe(gulp.dest("./build/img/"))
    );
});

// копирование шрифтов локальных
gulp.task("fonts:dev", function () {
    //из любой папки любого уровня вложенности и любой файл с лююбым расширением
    return gulp
        .src("./src/fonts/**/*")
        .pipe(changed("./build/fonts"))
        .pipe(gulp.dest("./build/fonts/"));
});

// копирование файлов (пдф с сайта и др)
gulp.task("files:dev", function () {
    //из любой папки любого уровня вложенности и любой файл с лююбым расширением
    return gulp
        .src("./src/files/**/*")
        .pipe(changed("./build/files"))
        .pipe(gulp.dest("./build/files/"));
});

// копирование js-фалов
gulp.task("js:dev", function () {
    //из любой папки любого уровня вложенности и любой файл с лююбым расширением
    return (
        gulp
            .src("./src/js/*.js")
            .pipe(changed("./build/js/"))
            .pipe(plumber(plumberNotify("JS")))
            // .pipe(babel())
            .pipe(webpack(require("./../webpack.config.js")))
            .pipe(gulp.dest("./build/js/"))
    );
});

// запуск локального сервера
gulp.task("server:dev", function () {
    //из любой папки любого уровня вложенности и любой файл с лююбым расширением
    return gulp.src("./build/").pipe(server(serverOptions));
});

//ватчер - слежка за картинками стилями и т.д.
gulp.task("watch:dev", function () {
    gulp.watch("./src/scss/**/*.scss", gulp.parallel("sass:dev")); //когда поменяются стили запусти таск sass
    gulp.watch("./src/**/*.html", gulp.parallel("html:dev")); //когда поменяются в html запусти таск html
    gulp.watch("./src/img/**/*", gulp.parallel("images:dev")); //когда поменяются img запусти таск images
    gulp.watch("./src/fonts/**/*", gulp.parallel("fonts:dev")); //когда поменяются шрифты запусти таск fonts
    gulp.watch("./src/files/**/*", gulp.parallel("files:dev")); //когда поменяются файлы запусти таск files
    gulp.watch("./src/js/**/*.js", gulp.parallel("js:dev")); //когда поменяются js запусти таск js
});
