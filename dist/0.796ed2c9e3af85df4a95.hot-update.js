exports.id = 0;
exports.modules = {

/***/ 3:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _babelPolyfill = __webpack_require__(4);
	
	var _babelPolyfill2 = _interopRequireDefault(_babelPolyfill);
	
	var _express = __webpack_require__(5);
	
	var _express2 = _interopRequireDefault(_express);
	
	var _path = __webpack_require__(6);
	
	var _path2 = _interopRequireDefault(_path);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	try {
		(function () {
			var app = (0, _express2.default)();
			var hostname = process.env.HOSTNAME || "localhost";
			var port = process.env.PORT || 8000;
	
			app.use('/*', _express2.default.static('static'));
	
			app.listen(port, function () {
				console.info("==> ✅  Server is listening");
				console.info("==> 🌎  Go to http://%s:%s", hostname, port);
			});
	
			if (true) {
				if (true) {
					console.log("[HMR] Waiting for server-side updates");
	
					module.hot.addStatusHandler(function (status) {
						if (status === "abort") {
							setTimeout(function () {
								return process.exit(0);
							}, 0);
						}
					});
				}
			}
		})();
	} catch (error) {
		console.error(error.stack || error);
	}

/***/ }

};
//# sourceMappingURL=0.796ed2c9e3af85df4a95.hot-update.js.map