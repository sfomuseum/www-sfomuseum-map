var sfomuseum = sfomuseum || {};

sfomuseum.data = (function(){

    var _data_endpoint = location.protocol + "//" + location.host + "/data/";


    var self = {
	
	// PLEASE UPDATE THIS AND EVERYTHING THAT CALLS IN TO BE
	// 'fetch_geojson': function(id, alt, on_success, on_error)
	// SO WE CAN GET RID OF fetch_alt_geojson BELOW, KTHXBYE
	// (20190501/thisisaaronland)

	'fetch_geojson': function(id, on_success, on_error){
	    
	    var rel_path = self.id2relpath(id);
	    
	    self.fetch(rel_path, on_success, on_error);
	},

	// THIS NEEDS TO BE REMOVED - SEE NOTES ABOVE
	// (20190501/thisisaaronland)

	'fetch_alt_geojson': function(id, alt, on_success, on_error){

	    args = {
		"alt": true,
	    };

	    parts = alt.split("-");
	    count = parts.length;

	    if (count >= 1){
		args["source"] = parts[0];
	    }

	    if (count >= 2){
		args["function"] = parts[1];
	    }

	    if (count >= 2){
		// args["extra"] = parts[2:-1];
	    }

	    var rel_path = self.id2relpath(id, args);
	    self.fetch(rel_path, on_success, on_error);
	},
	
	'fetch': function(path, on_success, on_error){

	    _data_endpoint = document.body.getAttribute("data-abs-root-url-data");
	    
	    var url = _data_endpoint + path;
	    whosonfirst.net.fetch(url, on_success, on_error);	    
	},
	
	'id2relpath': function(id, args){
	    
	    parent = self.id2parent(id);
	    fname = self.id2fname(id, args);
	    
	    var rel_path = parent + "/" + fname;
	    return rel_path;
	},
	
	'id2parent': function(id){
	    
	    str_id = new String(id);
	    tmp = new Array();
	    
	    while (str_id.length){
		
		var part = str_id.substr(0, 3);
		tmp.push(part);
		str_id = str_id.substr(3);
	    }
	    
	    parent = tmp.join("/");
	    return parent;
	},
	
	'id2fname': function(id, args){
	    
	    if (! args){
		args = {};
	    }
	    
	    var fname = [
		encodeURIComponent(id)
	    ];
	    
	    if (args["alt"]) {
		fname.push('alt');
		
		if (args["source"]){
		    
		    // to do: validate source here
		    // to do: actually write whosonfirst.source.js
		    // (20161130/thisisaaronland)
		    
		    var source = encodeURIComponent(args["source"]);
		    fname.push(source);
		    
		    if (args["function"]){
			
			var func = encodeURIComponent(args["function"]);
			fname.push(func);
			
			if ((args["extras"]) && (args["extras"].join)){
			    
			    var extras = args["extras"];
			    var count = extras.length;
			    
			    for (var i = 0; i < count; i++){
				var extra = encodeURIComponent(extras[i]);
				fname.push(extra);
			    }
			}
		    }
		}
		
		else {
		    console.log("missing source parameter for alternate geometry");
		    fname.push("unknown");
		}
		
	    }
	    
	    var str_fname = fname.join("-");
	    return str_fname + ".geojson";
	},
	
	'log': function(level, message){
	    
	    if (typeof(whosonfirst.log) != 'object'){
		console.log(level, message);
		return;
	    }
	    
	    whosonfirst.log.dispatch(message, level);
	}
	
    };

    return self;
})();
