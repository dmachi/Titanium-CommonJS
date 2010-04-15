// handler for Titanium.Network.HTTPServer

var IO = require("io").IO,
    HashP = require("hashp").HashP;

exports.run = function(app, options) {
	var options = options || {};
	var port = options["port"]||8888;
	var host = options["host"]||"localhost";

	var server = Titanium.Network.createHTTPServer();
 
	Titanium.API.info("Bind HTTP server to " + host + ":" + port);
	server.bind(port, host, function(request,response){
		//Titanium.API.debug("Process Request: " + request);
		process(app, request, response, server);
	}); 
}

var process = function(app, rawRequest, response, server) {
	Titanium.API.debug("JsgiHandler process()");
	try {
		var uri = rawRequest.getURI();
		var headers = rawRequest.getHeaders();
		var host = rawRequest.getHeader("host");
		var hostComponents = host.split(":")

		var env={
			headers: rawRequest.getHeaders(),
			method: rawRequest.getMethod(),
			requestUri: rawRequest.getURI(),
			uri: rawRequest.getURI(),
			serverName: hostComponents[0],
			serverPort: hostComponents[1],
			queryString: "",
			pathInfo: uri,
			serverProtocol: "http",
			host: host,
			version: rawRequest.getVersion(),
			contentType: rawRequest.getContentType() || "text/plain",
			contentLength: rawRequest.getContentLength(),
			jsgi: {
				version: [0,2],
				errors: require('system').stderr,
				input: rawRequest,
				multithread: true,
				multiprocess: false,
				run_once: false,
				url_shceme: "http"
			}
		}
		Titanium.API.debug("HTTP Request : " + env.method + " " + env.pathInfo);
		var rawResponse = app(env);

		for (var i in rawResponse){
			Titanium.API.debug("NON-Header Props: " + i + " : " + rawResponse[i]);
			//response.setHeader(i, rawResponse.headers[i]);		
		}


		for (var i in rawResponse.headers){
			Titanium.API.debug("Set Response Header: " + i + " : " + rawResponse.headers[i]);
			response.setHeader(i, rawResponse.headers[i]);		
		}

		var size = 0;
		var body;
		rawResponse.body.forEach(function(bytes){
			body += bytes;
		});

		response.write(body.toString());
		response.setContentLength(body.length);	
		response.setStatus(rawResponse.status.toString()); 
	} catch (e) {
		Titanium.API.error("Exception! " + e);
		response.setStatusAndReason("500", e);
	} 
	return response
}
