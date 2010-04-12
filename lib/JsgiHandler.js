// handler for SHTTPD/Mongoose (http://code.google.com/p/mongoose/)

var IO = require("io").IO,
    HashP = require("hashp").HashP;

exports.run = function(app, options) {
    var options = options || {},
        port = options["port"]||8080;
	host = options["host"]||"127.0.0.1";

	Titanium.API.debug("Create HTTP Server");        
	var server = Titanium.Network.createHTTPServer();
 
	Titanium.API.debug("Bind server to port : " + port);
	server.bind(port, "127.0.0.1", function(request){
		Titanium.API.debug("Process Request: " + request);
		process(app, request, server);
	}); 
}

// Apparently no way to enumerate ENV or headers so we have to check against a list of common ones for now. Sigh.
/*
var ENV_KEYS = [
    "SERVER_SOFTWARE", "SERVER_NAME", "GATEWAY_INTERFACE", "SERVER_PROTOCOL",
    "SERVER_PORT", "REQUEST_METHOD", "PATH_INFO", "PATH_TRANSLATED", "SCRIPT_NAME",
    "QUERY_STRING", "REMOTE_HOST", "REMOTE_ADDR", "AUTH_TYPE", "REMOTE_USER", "REMOTE_IDENT",
    "CONTENT_TYPE", "CONTENT_LENGTH", "HTTP_ACCEPT", "HTTP_USER_AGENT",
    "REQUEST_URI"
];
 */
var HEADER_KEYS = [
    "Accept", "Accept-Charset", "Accept-Encoding", "Accept-Language", "Accept-Ranges",
    "Authorization", "Cache-Control", "Connection", "Cookie", "Content-Type", "Date",
    "Expect", "Host", "If-Match", "If-Modified-Since", "If-None-Match", "If-Range",
    "If-Unmodified-Since", "Max-Forwards", "Pragma", "Proxy-Authorization", "Range",
    "Referer", "TE", "Upgrade", "User-Agent", "Via", "Warn"
];

var process = function(app, request, server) {
	Titanium.API.debug("JsgiHandler process()");
    try {
        var env = {};
	request.headers=request.getHeaders();
	request.method=request.getMethod();
        var key, value;
        Titanium.API.debug("Request getHeaders(): " + request.getHeaders());	
	var headers = request.getHeaders();
	for (var i in headers) {
		Titanium.API.debug(" Header - " + i + " : " + headers[i]);
		env[i]=headers[i]

	}
	Titanium.API.debug("Request URI: " + request.getURI() + " " + request.getHeaders());
        HEADER_KEYS.forEach(function(key) {
	    if (request.hasHeader(key)) {
            	value = request.getHeader(key);
		if (env[key]) {
			delete env[key];
		}

                key = key.replace(/-/g, "_").toUpperCase();
                if (!key.match(/(CONTENT_TYPE|CONTENT_LENGTH)/i))
                    key = "HTTP_" + key;
                env[key] = value;
            }
        });
	env["REQUEST_URI"] = request.getURI();
	Titanium.API.debug("Here a");
        var hostComponents = env["HTTP_HOST"].split(":")
        if (env["SERVER_NAME"] === undefined && hostComponents[0])
            env["SERVER_NAME"] = hostComponents[0];

	Titanium.API.debug("Here b");
        if (env["SERVER_PORT"] === undefined && hostComponents[1])
            env["SERVER_PORT"] = hostComponents[1];
        
        if (env["QUERY_STRING"] === undefined)
            env["QUERY_STRING"] = "";
        
	Titanium.API.debug("Here c");
        if (env["PATH_INFO"] === undefined)
            env["PATH_INFO"] = env["REQUEST_URI"];
            
	Titanium.API.debug("Here d");
        if (env["SERVER_PROTOCOL"] === undefined)
            env["SERVER_PROTOCOL"] = "HTTP/1.1";
        
	Titanium.API.debug("Here e");
        if (env["HTTP_VERSION"] === undefined)
	        env["HTTP_VERSION"] = request.getVersion();
            
	Titanium.API.debug("Here f");
        if (env["CONTENT_LENGTH"] === undefined)
            env["CONTENT_LENGTH"] = "0"; //request.getContentLength() || "0"
            
        if (env["CONTENT_TYPE"] === undefined)
            env["CONTENT_TYPE"] = request.getContentType() || "text/plain";

	Titanium.API.debug("Here g");
       	Titanium.API.debug(" here 1"); 
        env["jsgi.version"]         = [0,2];
        env["jsgi.errors"]          = require("system").stderr;
        env["jsgi.input"]           = request;
        env["jsgi.multithread"]     = true;
        env["jsgi.multiprocess"]    = false;
        env["jsgi.run_once"]        = false;
	env["jsgi.url_scheme"]      = "http"; //request.scheme || uri.scheme || "http";


       	Titanium.API.debug(" here 3"); 
	for (var i in env) {
		Titanium.API.debug("    " + i + ": " + env[i]);
	}

       	Titanium.API.debug(" here 4"); 
	var response = app(env);
	Titanium.API.debug(" here 5");
	Titanium.API.debug("Got App response: " + response);
    
        // FIXME: can't set the response status or headers?!
  	//var response = new Titanium.Network.HTTPServerResponse();

       	Titanium.API.debug(" here 7"); 
	//response.setContentLength(response.content_length);      
        // set the status
        //response.setStatus(jackResponse.status);
        // set the headers
        //response.headers
  	//response.setContentType(jackReponse.content_type);
	//for (var i in jackReponse.headers){
	//		reponse.setHeader(i, jackReponse.headers[i]);
	//}	  
        // output the body
	//Titanium.API.debug("output the body");
        //jackResponse.body.forEach(function(bytes) {
         //   request.write(bytes.toByteString("UTF-8").decodeToString("UTF-8"));
        //});
       	return response; 
    } catch (e) {
        Titanium.API.error("Exception! " + e);
    } 
}
