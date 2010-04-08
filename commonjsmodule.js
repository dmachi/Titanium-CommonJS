(function(){
	var basePath = Titanium.Filesystem.getResourcesDirectory() + "/CommonJS";
	var modules = {};
	var paths = [basePath];

	function resolveId(currentId, id){
		//Titanium.API.debug("resolveUrl: " + currentId + " " + id);
		if(id.charAt(0) === '.'){
			currentId = currentId.substring(0, currentId.lastIndexOf('/') + 1);
			return (currentId + id ).replace(/\/\.\.\/[^\/]*/g,'').replace(/\.\//g,'');
		}
		var idParts = id.split("/");
		if (idParts.length==1) {  
			idParts.push("lib");
			idParts.push(idParts[0]);	
		}else{
			idParts.splice(1,0, "lib");
			return currentId + "/" + idParts.join("/");
		}
		idParts.unshift(currentId)
		var id = idParts.join("/");
		//Titanium.API.debug("id: " + id );
		return id;
	}

	function makeRequire(currentId){
		var require = function(id){
			//Titanium.API.debug("require(" + id + ")");
			id = resolveId(currentId, id);
			//Titanium.API.debug("Resolved ID: "+ id);
			if(modules[id]){
				return modules[id];
			}
			var exports = modules[id] = {};
			var file = null;
			var path=paths.some(function(path){
				var name = path + id + ".js";	
				//Titanium.API.debug("Searching for file: " + name);
				var f = Titanium.Filesystem.getFile(name);
				if (f.isFile()) {	
					file = f;
					return path;
				}
			});

			if (path && file){ 
				//Titanium.API.debug("Reading File: " + file);
        			var source = file.read();
				//Titanium.API.debug("Source: " + source);
				var factory = eval("(function(require, exports, module){" + source + "})"); 
				factory(makeRequire(id), exports, {id:id});
				return exports;
			}else{
				Titanium.API.error("Unable to resolve require: " + id);
			}
    		}
		require.paths = paths;
		return require;
	}

	Titanium.API.set("CommonJS.require", makeRequire(""));
})();
