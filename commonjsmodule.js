(function(){
	var basePath = Titanium.Filesystem.getResourcesDirectory() + "/CommonJS";
	var modules = {};

	// paths to packages
	var paths = [basePath]

	// paths to search within packages
	var subSearchPaths = ["engines/titanium/lib","engines/default/lib","lib"]

	function resolveId(currentId, id){

		//relative request
		if(id.charAt(0) === '.'){
			//Titanium.API.debug("   Relative request:" +  currentId.substring(0, currentId.lastIndexOf('/') + 1) + " :: " + id);
			var currentParts = currentId.split("/");
			var idParts = id.split("/");
			var finalParts = [];
			for (var i=0; i<idParts.length;i++){
				if (idParts[i]=="..") {
					currentParts.pop();
				}else{
					finalParts.push(idParts[i]);
				}
			}
			currentId = currentParts.join("/");
			id = finalParts.join("/");
			currentId = currentId.substring(0, currentId.lastIndexOf('/') ) || currentId;
			return (currentId + "/" + id ).replace(/\/\.\.\/[^\/]*/g,'').replace(/\.\//g,'');
		}
		return id;
	}

	function makeRequire(currentId){
		var require = function(id){
			id = resolveId(currentId, id);
			if(modules[id]){
				return modules[id];
			}
			var exports = modules[id] = {};
			var file = null;
			var path=paths.some(function(path){
				var idParts = id.split("/");
				if (idParts.length==1) {  
					var initialName = path + "/" + id;
					var initial = Titanium.Filesystem.getFile(initialName);
					if (initial.isDirectory()) {
						//TODO IMPORT package.json initialName + /package.json
						idParts.push(subSearchPaths[0]);
						idParts.push(idParts[0]);	
					}else{
						var idPath = idParts.join("/");
						var name = path + "/" + idPath + ".js";	
						var f = Titanium.Filesystem.getFile(name);
						if (f.isFile()) {	
							file = f;
							return path;
						}
						Titanium.API.error("Unable to locate resource: " + id);	
						return;
					}

				}else{
					idParts.splice(1,0, subSearchPaths[0]);
				}

				
				for (var i=0; i<subSearchPaths.length;i++) {	
					
					idParts[1]=subSearchPaths[i];
					var idPath = idParts.join("/");

					var name = path + "/" + idPath + ".js";	
					Titanium.API.debug("Searching for file: " + name);
					var f = Titanium.Filesystem.getFile(name);
					if (f.isFile()) {	
						file = f;
						return path;
					}
				}

			});

			if (path && file){ 
        			var source = file.read();
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
