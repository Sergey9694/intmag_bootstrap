const gulp = require("gulp");

//HTML
const fileInclude = require("gulp-file-include"); //подключает 1 html файл в другой
const htmlclean = require("gulp-htmlclean"); //МИНИФИКАЦИЯ HTML
const webpHtml = require("gulp-webp-html");

//SASS
const csso = require("gulp-csso"); //МИНИФИКАЦИЯ CSS
const sass = require("gulp-sass")(require("sass")); //подключает компилятора sass в css
const autoprefixer = require("gulp-autoprefixer");
const sassGlob = require("gulp-sass-glob"); //автоматическое подключение чанков scss к main файлу
const webpCss = require("gulp-webp-css");

const server = require("gulp-server-livereload"); //локальный сервер
const clean = require("gulp-clean"); //очистка папки dist
const fileSystem = require("fs"); //для работы с файловой системой
const sourceMaps = require("gulp-sourcemaps"); //для того чтобы видеть в консоли в каком файле лежит стиль - исходный соурсмап
const groupMedia = require("gulp-group-css-media-queries"); //объединение медиастилей
const plumber = require("gulp-plumber"); //вываливает ошибки
const notify = require("gulp-notify"); //вываливает ошибки
const babel = require("gulp-babel");
const webpack = require("webpack-stream");
const changed = require("gulp-changed"); //проверяет если нет изменний то не оптимизирует файл еще раз

//IMAGES
const webp = require("gulp-webp"); //оптимизация картинок
const imagemin = require("gulp-imagemin"); //оптимизация картинок

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
gulp.task("clean:docs", function (done) {
    // если такая папка есть по данному пути то удали ее
    if (fileSystem.existsSync("./docs/")) {
        return gulp
            .src("./docs/", { read: false })
            .pipe(clean({ force: true }));
    }

    done(); //завершить задачу
});

// подключает чанки html в index.html
gulp.task("html:docs", function () {
    return gulp
        .src(["./src/html/**/*.html", "!./src/html/blocks/*.html"]) //исключили путь папки blocks из диста
        .pipe(changed("./docs/"))
        .pipe(plumber(plumberNotify("HTML")))
        .pipe(fileInclude(fileIncludeSettings))
        .pipe(webpHtml())
        .pipe(htmlclean())
        .pipe(gulp.dest("./docs/"));
});

// компиляция scss в css
gulp.task("sass:docs", function () {
    return (
        gulp
            .src("./src/scss/*.scss")
            .pipe(changed("./docs/css/"))
            .pipe(plumber(plumberNotify("SCSS")))
            // .pipe(sourceMaps.init()) //1-ый запуск инициализация сорсмапа
            .pipe(autoprefixer())
            .pipe(sassGlob())
            .pipe(webpCss())
            .pipe(groupMedia())
            .pipe(sass())
            .pipe(csso())
            // .pipe(sourceMaps.write()) //записываем сорсмапы
            .pipe(gulp.dest("./docs/css/"))
    );
});

// копирование изображений
gulp.task("images:docs", function () {
    //из любой папки любого уровня вложенности и любой файл с лююбым расширением
    return gulp
        .src("./src/img/**/*")
        .pipe(changed("./docs/img/"))
        .pipe(webp())
        .pipe(gulp.dest("./docs/img/"))

        .pipe(gulp.src("./src/img/**/*"))
        .pipe(changed("./docs/img/"))
        .pipe(imagemin({ verbose: true })) //при оптимизации показывает в консоли что оптимизировано и насколько
        .pipe(gulp.dest("./docs/img/"));
});

// копирование шрифтов локальных
gulp.task("fonts:docs", function () {
    //из любой папки любого уровня вложенности и любой файл с лююбым расширением
    return gulp
        .src("./src/fonts/**/*")
        .pipe(changed("./docs/fonts"))
        .pipe(gulp.dest("./docs/fonts/"));
});

// копирование файлов (пдф с сайта и др)
gulp.task("files:docs", function () {
    //из любой папки любого уровня вложенности и любой файл с лююбым расширением
    return gulp
        .src("./src/files/**/*")
        .pipe(changed("./docs/files"))
        .pipe(gulp.dest("./docs/files/"));
});

// копирование js-фалов
gulp.task("js:docs", function () {
    //из любой папки любого уровня вложенности и любой файл с лююбым расширением
    return gulp
        .src("./src/js/*.js")
        .pipe(changed("./docs/js/"))
        .pipe(plumber(plumberNotify("JS")))
        .pipe(babel())
        .pipe(webpack(require("../webpack.config.js")))
        .pipe(gulp.dest("./docs/js/"));
});

// запуск локального сервера
gulp.task("server:docs", function () {
    //из любой папки любого уровня вложенности и любой файл с лююбым расширением
    return gulp.src("./docs/").pipe(server(serverOptions));
});
