/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */

/* TODO:
	[] - task generujący sam całą strukturę katalogu _src_Browser wraz
	z podstawową strukturą plików
	[] - fallback w większości funkcji jest głupi - nie powinien wpisaywqć
	domyśłen wartości lecz generować błąd
 */

const { src, dest, series, parallel, watch } = require('gulp');

// Podstawowe
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const del = require('del');
const gulpRename = require('gulp-rename');
const newer = require('gulp-newer');
const noop = require('gulp-noop');
const htmlclean = require('gulp-htmlclean');
const stripdebug = require('gulp-strip-debug');
const size = require('gulp-size');
const browserSync = require('browser-sync').create();
const color = require('gulp-color');
const { exec } = require('child_process');
const replace = require('gulp-replace');
const rollup = require('gulp-better-rollup');
const babelRollup = require('rollup-plugin-babel');
const rollupGas = require('rollup-plugin-gas');
// const stripcomments = require('gulp-strip-comments');
/** const resolve = require('rollup-plugin-node-resolve');
 * To do obsługi modułów noda - na razie nie korzystam
 * const commonjs = require('rollup-plugin-commonjs');
 * To do obsługi modułów noda - na razie nie korzystam
 */

// Image compresion

const imagemin = require('gulp-imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');

// Folders
const FOLDER = {
	// źródła dla przeglądarki (przed kompilacją)
	srcBrowser: '__src_Browser',
	// źródła dla Apps Script (przed komilacją)
	srcGas: '__src_Gas',
	// pliki wynikowe dla przeglądarki (gotowe do uploadu)
	distBrowser: '_dist_Browser',
	// pliki wynikowe dla Apps Script (gotowe do uploadu)
	distGas: '_dist_Gas',
	// pliki robocze dla przeglądarki (gotowe do testów)
	distTmp: '_dist_Tmp',
};

// File paths
const PATH = {
	srcBrowser: FOLDER.srcBrowser,
	srcBrowserScss: `${FOLDER.srcBrowser}/scss/**/*.scss`,
	srcBrowserScssMain: `${FOLDER.srcBrowser}/scss/main.scss`,
	srcBrowserJs: `${FOLDER.srcBrowser}/js/**/*.js`,
	srcBrowserImg: `${FOLDER.srcBrowser}/img/**/*.{png,jpeg,jpg,svg,gif}`,

	// Startowy plik dla modułów ES6 rollupu
	srcBrowserModulesEntry: `${FOLDER.srcBrowser}/js/_index.js`,

	srcGasJs: `${FOLDER.srcGas}/**/*.js`,
	// Startowy plik dla modułów ES6 rollupu
	srcGasJsModulesEntry: `${FOLDER.srcGas}/index.js`,

	targetBrowserDist: FOLDER.distBrowser,
	targetBrowserTmp: FOLDER.distTmp,

	targetGas: FOLDER.distGas,
	targetGasBrowser: `${FOLDER.distGas}/browser`,
};

/**
 * --------------------------------------------------------------------
 * Procedury dla styli - zależne od zmiennej określającej środowisko
 * @param {string} opt - docelowy folder - 'tmp', 'dist' lub 'gas'
 * Pierwsza linijka to fallback na wypadek wpisania innej wartości
 * niż tmp lub dist
 */

function stylesOpt(opt = 'tmp') {
	const env =
		['tmp', 'dist', 'gasBrowser'].indexOf(opt) < 0 ? 'tmp' : opt;
	const optsTmp = { outputStyle: 'nested', sourceComments: true };
	const optsDist = { outputStyle: 'compressed' };
	const folder = name => {
		if (name === 'tmp') return `${PATH.targetBrowserTmp}/css`;
		if (name === 'dist') return `${PATH.targetBrowserDist}/css`;
		if (name === 'gasBrowser') return PATH.targetGasBrowser;
	};

	console.log(
		`\n--------------------\n${color(
			'SCSS tasks for',
			'YELLOW'
		)} ${color(env.toUpperCase(), 'GREEN')}\n--------------------\n`
	);

	return src(PATH.srcBrowserScssMain)
		.pipe(
			plumber(function(err) {
				console.log(' **** ERROR: SCSS ****');
				console.log(err);
				this.emit('end');
			})
		)
		.pipe(env === 'tmp' ? sourcemaps.init() : noop())
		.pipe(autoprefixer())
		.pipe(sass(env === 'tmp' ? optsTmp : optsDist))
		.pipe(env === 'tmp' ? sourcemaps.write() : noop())
		.pipe(size())
		.pipe(env === 'gasBrowser' ? gulpRename('main.css.html') : noop())
		.pipe(dest(folder(env)));
}

// Presety do tasków
const stylesTmp = () => stylesOpt('tmp');
const stylesDist = () => stylesOpt('dist');
const stylesGasBrowser = () => stylesOpt('gasBrowser');

/**
 * ----------------------------------------------------------------------
 * Procedury dla JS - zależne od zmiennej określającej środowisko
 * @param {string} opt - docelowy folder - 'tmp', 'dist', 'gas'
 * lub 'gusBrowser'
 * Pierwsza linijka to fallback na wypadek wpisania innej wartości
 * niż tmp lub dist
 */

function jsOpt(opt = 'tmp') {
	const env =
		['tmp', 'dist', 'gas', 'gasBrowser'].indexOf(opt) < 0
			? 'tmp'
			: opt;
	const gasPreset = {
		presets: ['@dreipol/babel-preset-google-apps-script'],
	};

	const browsersPreset = { presets: ['@babel/preset-env'] };
	const folder = name => {
		if (name === 'tmp') return `${PATH.targetBrowserTmp}/js`;
		if (name === 'dist') return `${PATH.targetBrowserDist}/js`;
		if (name === 'gas') return PATH.targetGas;
		if (name === 'gasBrowser') return PATH.targetGasBrowser;
	};

	console.log(
		`\n--------------------\n${color(
			'START: JS tasks',
			'YELLOW'
		)} ${color(env.toUpperCase(), 'GREEN')}\n--------------------\n`
	);

	return (
		src(
			env === 'gas'
				? PATH.srcGasJsModulesEntry
				: PATH.srcBrowserModulesEntry
		)
			// .pipe(order(['client.js', 'app.js', 'start.js']))
			// kolejność plików JS dla clienta - nie potrzebne przy
			// użyciu modułów ES6
			.pipe(
				plumber(function(err) {
					console.log(' **** ERROR: JS ****');
					console.log(err);
					this.emit('end');
				})
			)
			.pipe(env === 'tmp' ? sourcemaps.init() : noop())
			.pipe(
				rollup(
					{
						plugins: [
							babelRollup(
								env === 'gas' ? '' : browsersPreset
							),
							rollupGas(),
						],
					},
					'umd'
				)
			)
			.pipe(env !== 'gas' ? concat('main.js') : noop())
			.pipe(env === 'dist' ? stripdebug() : noop())
			// .pipe(env === 'gas' ? stripcomments() : noop())
			.pipe(env === 'tmp' || env === 'gas' ? noop() : uglify())
			.pipe(env === 'tmp' ? sourcemaps.write() : noop())
			.pipe(size())
			.pipe(
				env === 'gasBrowser' ? gulpRename('main.js.html') : noop()
			)
			.pipe(dest(folder(env)))
	);
}

// Presety do tasków
const jsTmp = () => jsOpt('tmp');
const jsDist = () => jsOpt('dist');
const jsGas = () => jsOpt('gas');
const jsGasBrowser = () => jsOpt('gasBrowser');

/**
 * ---------------------------------------------------------------------
 * Procedury dla IMG - zależne od zmiennej określającej środowisko
 * @param {string} opt - docelowy folder - 'tmp' lub 'dist'
 * przy czym nie zakładamy rozwiązania dla GAS - nie da się ładować
 * obrazków na serwer Googla
 *
 */
function imgOpt(opt = 'tmp') {
	const env = ['tmp', 'dist'].indexOf(opt) < 0 ? 'tmp' : opt;
	const folder = name => {
		if (name === 'tmp') return `${PATH.targetBrowserTmp}/img`;
		if (name === 'dist') return `${PATH.targetBrowserDist}/img`;
	};

	console.log(
		`\n--------------------\n${color(
			'START: IMG tasks',
			'YELLOW'
		)} ${color(env.toUpperCase(), 'GREEN')}\n--------------------\n`
	);

	return src(PATH.srcBrowserImg)
		.pipe(newer(folder(env))) // sprawdza które pliki się zmieniły
		.pipe(
			imagemin([
				imagemin.gifsicle(),
				imagemin.jpegtran(),
				imagemin.optipng(),
				imagemin.svgo(),
				imageminPngquant(),
				imageminJpegRecompress(
					{ quality: 'medium' } // domyślna kompresja
				),
			])
		)
		.pipe(size())
		.pipe(dest(folder(env)));
}

// Presety dla tasków
const imgTmp = () => imgOpt('tmp');
const imgDist = () => imgOpt('dist');

/**
 * ----------------------------------------------------------------------
 * Replace - zamiana znaczników HTML na odpowiednie znaczniki GAS
 */

function replaceHtmlServ() {
	return src(`${PATH.srcBrowser}/index.html`)
		.pipe(
			replace(
				'<link rel="stylesheet" type="text/css" href="./css/main.css">',
				'<style> \n<?!= HtmlService.createHtmlOutputFromFile("browser/main.css").getContent(); ?>\n</style>'
			)
		)
		.pipe(
			replace(
				'<script src="./js/main.js"></script>',
				'<script> \n<?!= HtmlService.createHtmlOutputFromFile("browser/main.js").getContent(); ?>\n</script>'
			)
		)
		.pipe(dest(PATH.targetGasBrowser));
}

/**
 * ---------------------------------------------------------------------
 * Procedury dla HTMLa - zależne od zmiennej określającej środowisko
 * @param {string} opt - docelowy folder - 'tmp', 'dist' lub 'gas'
 * Pierwsza linijka to fallback na wypadek wpisania innej wartości niż
 * tmp lub dist
 */
function htmlOpt(opt = 'tmp') {
	const env =
		['tmp', 'dist', 'gasBrowser'].indexOf(opt) < 0 ? 'tmp' : opt;

	console.log(
		`\n--------------------\n${color(
			'START: HTML tasks',
			'YELLOW'
		)} ${color(env.toUpperCase(), 'GREEN')}\n--------------------\n`
	);

	const folder = name => {
		if (name === 'tmp') return `${PATH.targetBrowserTmp}`;
		if (name === 'dist') return `${PATH.targetBrowserDist}`;
		if (name === 'gasBrowser') return PATH.targetGasBrowser;
	};

	return src(`${PATH.srcBrowser}/**/*.html`)
		.pipe(env === 'dist' ? htmlclean() : noop())
		.pipe(size())
		.pipe(dest(folder(env)));
}

// Presety do tasków
const htmlTmp = () => htmlOpt('tmp');
const htmlDist = () => htmlOpt('dist');
const htmlGasBrowser = () => htmlOpt('gasBrowser');

/**
 * -----------------------------------------------------------------------------------------------------
 * Whipeout - usuwa katalogi zależnie od wskazanego środowisk
 * @param {string} env - docelowy folder - 'tmp', 'dist' lub 'gas'
 * Pierwsza linijka wyrzuca błąd jeśli funkcja zostanie odpalona z błędnym argumentem
 */
function wipeoutOpt(env) {
	if (['tmp', 'dist', 'gas', 'gasTotal'].indexOf(env) < 0)
		throw new Error('Niewłaściwy argument w funkcji wipeoutOpt');

	console.log(
		`\n--------------------\n${color(
			'START: Deleting',
			'YELLOW'
		)} ${color(env.toUpperCase(), 'GREEN')}\n--------------------\n`
	);

	const toDel = [];
	if (env === 'tmp') {
		toDel.push(PATH.targetBrowserTmp);
	} else if (env === 'dist') {
		toDel.push(PATH.targetBrowserDist);
	} else if (env === 'gas') {
		toDel.push(
			`${PATH.targetGas}/**/*`,
			`!${PATH.targetGas}/appsscript.json`
		);
	} else {
		toDel.push(PATH.targetGas, '.clasp.json');
	}
	return del(toDel);
}

// Presety do tasków
const deleteTmp = () => wipeoutOpt('tmp');
const deleteDist = () => wipeoutOpt('dist');
const deleteGas = () => wipeoutOpt('gas'); // Nie usuwa appsscript.json i clasp.json
const deleteGasTotal = () => wipeoutOpt('gasTotal'); // Usuwa całość - ponownie należy zainicjować GAS Proj. (clasp create lub clasp clone)

/**
 * -----------------------------------------------------------------------------------------------------
 * Server BrowserSync - odpala serwer we wskazanej lokalizacji
 * @param {string} opt - docelowy folder - 'tmp' lub 'dist'. Dist tylko do ostatecznego sprawdzenia przed uploadem na serwer
 * Pierwsza linijka to fallback na wypadek wpisania innej wartości niż tmp lub dist
 */
function serverOpt(opt = 'tmp') {
	const env = ['tmp', 'dist'].indexOf(opt) < 0 ? 'tmp' : opt;

	console.log(
		`\n--------------------\n${color(
			'START: SERVER',
			'YELLOW'
		)} ${color(env.toUpperCase(), 'GREEN')}\n--------------------\n`
	);

	browserSync.init({
		server:
			env === 'tmp' ? PATH.targetBrowserTmp : PATH.targetBrowserDist,
		notify: true,
		open: true, // czy otwierac strone
	});
}

function reloadServer(done) {
	browserSync.reload();
	done();
}

// Presety dla tasków
const serverTmp = () => serverOpt('tmp');
const serverDist = () => serverOpt('dist');

/**
 * -----------------------------------------------------------------------------------------------------
 * Exec - odpala komendę z linii komend - wykorzystywany do claspa
 */
function claspPush(done) {
	exec('clasp push -f');
	done();
}

/**
 * WATCHERSY -----------------------------------------------
 */
// Tryb pracy: Browser
function watcherTmp() {
	console.log(
		`\n--------------------\n${color(
			'START: Watch',
			'YELLOW'
		)} ${color('MODE: Browser', 'GREEN')}\n--------------------\n`
	);

	watch(PATH.srcBrowser, series(htmlTmp, reloadServer));
	watch(PATH.srcBrowserImg, series(imgTmp, reloadServer));
	watch(PATH.srcBrowserJs, series(jsTmp, reloadServer));
	watch(PATH.srcBrowserScss, series(stylesTmp, reloadServer));
}

// Tryb pracy: GAS
function watcherGas() {
	console.log(
		`\n--------------------\n${color(
			'START: Watch',
			'YELLOW'
		)} ${color('MODE: GAS', 'GREEN')}\n--------------------\n`
	);

	watch(PATH.srcGasJs, series(jsGas, claspPush));
}

// Tryb pracy: GASBrowser
function watcherGasBrowser() {
	console.log(
		`\n--------------------\n${color(
			'START: Watch',
			'YELLOW'
		)} ${color('MODE: GAS Browser', 'GREEN')}\n--------------------\n`
	);

	watch(PATH.srcGasJs, series(jsGas, claspPush));
	watch(
		PATH.srcBrowser,
		series(
			htmlTmp,
			htmlGasBrowser,
			reloadServer,
			replaceHtmlServ,
			claspPush
		)
	);
	watch(
		PATH.srcBrowserJs,
		series(jsGasBrowser, jsTmp, reloadServer, claspPush)
	);
	watch(
		PATH.srcBrowserScss,
		series(stylesGasBrowser, stylesTmp, reloadServer, claspPush)
	);
}

/**
 * BUILDY dosętpne wewnętrznie w aplikacji -----------------------------------------------
 * 1. tworzą czyste kopie katalogów docelowych czyszcząć wcześniejszą zawartość
 */
const buildTmp = series(deleteTmp, stylesTmp, jsTmp, imgTmp, htmlTmp);
const buildGas = series(deleteGas, jsGas); // Podczas pracy tylko nad GAS (bez HTMLServices)
const buildGasHtml = series(
	// Praca z HTMLServices
	deleteTmp,
	stylesTmp,
	jsTmp,
	imgTmp,
	htmlTmp,
	deleteGas,
	stylesGasBrowser,
	jsGas,
	jsGasBrowser,
	htmlGasBrowser,
	replaceHtmlServ
);

// TRYBY PRACY ------------------------------------------------------------------------
/**
 * Browser (bez AppsScript) - prace frontendowe. Po koleii:
 * 1. tworzy czystą zawartość katalogu roboczego
 * 2. odpala serwer z katalogu roboczego
 * 3. nasłuchuje zmiany w katalogu źródłowym, następnie uploduje pliki do katalogu roboczego i odświeża serwer
 */
exports.watchBrowser = series(buildTmp, parallel(serverTmp, watcherTmp));

/**
 * Apps Script bez HTMLServices) Po koleii:
 * 1. tworzy czystą zawartość katalogu docelowego GAS
 * 2. nasłuchuje zmiany w katalogu źródłowym, uploaduje do docelowego GAS, następnie uploduje pliki na serwer GAS
 */
exports.watchGas = series(buildGas, parallel(watcherGas));

/**
 * Apps Script FULL - łącznie z HTMLSerices. Po koleii:
 * 1. tworzy czystą zawartość katalogu roboczego wraz z podkatalogiem odpowiedzialnym za html-e
 * 2. nasłuchuje zmiany w katalogu źródłowym, następnie uploduje pliki do katalogu roboczego i odświeża serwer
 */
exports.watchGasBrowser = series(
	buildGasHtml,
	parallel(serverTmp, watcherGasBrowser)
);

// BUILDY dostępne z zewnątrz --------------------------------------------------------------
/**
 * Front-end w ostatecznej formie - gotowy do wysyłki na serwer. Po koleii:
 * 1. tworzy czystą zawartość katalogu docelowego
 * 2. opcja buildDistServer dodatkowo odpala serwer w katalogu docelowego aby ostatecznie zweryfikowć czy wszystko jest ok
 */
exports.buildDist = series(
	deleteDist,
	stylesDist,
	jsDist,
	imgDist,
	htmlDist
);
exports.buildDistServer = series(
	deleteDist,
	stylesDist,
	jsDist,
	imgDist,
	htmlDist,
	serverDist
);

// WHIPEOUTy ----------------------------------------------------------------------------------
// All - ale nie usuwa pliku appsscript.json (celowy zabieg)
exports.deleteAll = parallel(deleteTmp, deleteDist, deleteGas);
// All Total - usuwa również pliki konfigurayjne GAS - appsscript.json oraz .clasp.json - po tej operacji należy ponownie należy zainicjować GAS Proj. (clasp create lub clasp clone)
exports.deleteAllTotal = parallel(deleteTmp, deleteDist, deleteGasTotal);

// ----------------------- CZĘŚC EKSPERYMENTALA -----------------------------
// Test JSDoc - na razie jakoś super nie działa - nie wiem jeszcze jak to opisywć
const jsdoc = require('gulp-jsdoc3');

function doc(done) {
	const config = {
		opts: {
			destination: './docs/jsdoc',
		},
		templates: {
			default: {
				outputSourceFiles: true,
			},
			cleverLinks: false,
			monospaceLinks: false,
			path: 'ink-docstrap',
			theme: 'simplex',
			navType: 'vertical',
			linenums: true,
			dateFormat: 'MMMM Do YYYY, h:mm:ss a',
		},
	};
	del('./docs');
	src(['./__src_Gas/**/*.js'], { read: false }).pipe(
		jsdoc(config, done)
	);
}

exports.doc = doc;
