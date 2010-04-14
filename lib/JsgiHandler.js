// handler for SHTTPD/Mongoose (http://code.google.com/p/mongoose/)

var IO = require("io").IO,
    HashP = require("hashp").HashP;

exports.run = function(app, options) {
    var options = options || {},
        var port = options["port"]||8080;

	Titanium.API.debug("Create HTTP Server");        
	var server = Titanium.Network.createHTTPServer();
 
	Titanium.API.debug("Bind server to port : " + port);
	server.bind(port, "127.0.0.1", function(request,response){
		Titanium.API.debug("Process Request: " + request);
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
			output: response,
			multithread: true,
			multiprocess: false,
			run_once: false,
			url_shceme: "http"
		}
	}
        var key, value;

	for (var i in env) {
		Titanium.API.debug("    " + i + ": " + env[i]);
	}

       	Titanium.API.debug(" here 4"); 
	var rawResponse = app(env);

	for (var i in rawResponse) {
		Titanium.API.debug("RawResponse " + i + " : " + rawResponse[i]);
	}
 
	for (var i in rawResponse.headers){
		Titanium.API.debug("Header Response[" + i + "] : " + rawResponse.headers[i]);
		if (i=="CONTENT_TYPE" || i=="contentType" || i=="content_type" || "Content-type") {
			response.setContentType(rawResponse.headers[i]);
		}else {
			try {
				response.setHeader(i, rawResponse.headers[i]);		
			}catch(err){
				Titanium.API.debug("Unable to set header for: " + i + "  - " + err);
			}
		}

	}	
	Titanium.API.debug("Write body: " + rawResponse.body);
	var size = 0;
	if (typeof rawResponse.body == "string") {
		size = size + rawResponse.body.length;
		response.write(response.body);	
	}else{
		rawResponse.body.forEach(function(bytes){
			var d = bytes.toString();
			size = size + d.length;
			response.write(d);
		});
	}
	response.setContentLength(size);	
	response.setStatus(rawResponse.status.toString());
    } catch (e) {
        Titanium.API.error("Exception! " + e);
	for (var i in e) {
		Titainium.API.debug("e[i]: " + i + " " + e[i]);
	}
	response.setStatusAndReason("500", e);
	return response;
    } 
}
