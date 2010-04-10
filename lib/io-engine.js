
// IO: default
// -- tlrobinson Tom Robinson

var IO = exports.IO = function(inputStream, outputStream) {
    this.inputStream = inputStream;
    this.outputStream = outputStream;
}

IO.prototype.read = function(length) {
    return this.inputStream.read(length);
}

IO.prototype.write = function(object) {
    Titanium.API.debug("Output Stream write(): " + object);
    if (this.outputStream) {
	    this.outputStream.write(object);
    } 	      

    return this;
}

IO.prototype.flush = function() {
    Titanium.API.warn("IO.flush not implemented yet");
    return this;
}

IO.prototype.close = function() {
	if (this.outpuStream){
		this.outputStream.close();
	}

	if(this.inputStream) {
		this.inputStream.close();
	}
	
}

exports.TextIOWrapper = function (raw, mode, lineBuffering, buffering, charset, options) {
    return raw;
}
