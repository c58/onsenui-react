import babelPolyfill from "babel-polyfill";
import express from "express";
import path from 'path';


try {
	const app      = express();
	const hostname = process.env.HOSTNAME || "localhost";
	const port     = process.env.PORT || 8000;

	app.use('/*', express.static('static'));

	app.listen(port, () => {
		console.info("==> ✅  Server is listening");
		console.info("==> 🌎  Go to http://%s:%s", hostname, port);
	});

	if (__DEV__) {
		if (module.hot) {
			console.log("[HMR] Waiting for server-side updates");

			module.hot.addStatusHandler((status) => {
				if (status === "abort") {
					setTimeout(() => process.exit(0), 0);
				}
			});
		}
	}
}
catch (error) {
	console.error(error.stack || error);
}
