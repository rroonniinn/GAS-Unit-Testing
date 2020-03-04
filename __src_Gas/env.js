/* global QUnit */

QUnit.helpers(global);

// runs inside a web app, results displayed in HTML.
global.doGet = e => {
	QUnit.urlParams(e.parameter);
	QUnit.config({
		title: 'QUnit for GAS', // Sets the title of the test page.
	});

	// Pass the tests() wrapper function with our defined
	// tests into QUnit for testing
	QUnit.load(global.tests);

	// Return the web app HTML
	return QUnit.getHtml();
};
