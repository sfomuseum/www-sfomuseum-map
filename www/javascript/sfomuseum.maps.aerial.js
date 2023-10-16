var sfomuseum = sfomuseum || {};
sfomuseum.maps = sfomuseum.maps || {};

// replace all the "year" stuff with "uri" equivalent - it's not so much about years
// as it is date-first uris that can be sorted by time

sfomuseum.maps.aerial = (function(){

    var _catalog = sfomuseum.maps.catalog.asDictionary();

    // this (var _sources) will	eventually be bundled in to a
    // sfomuseum.sources.js package but	that day is not	today

    var _sources = {
	'sfomuseum': 'SFO Museum Aviation Collection',
	'sfogis': 'SFO GIS Department',	
	'ucsblib': 'UC Santa Barbara Library, Special Research Collections',
    };

    var _lat = 37.6160;
    var _lon = -122.3847;
    var _zoom = 14;
    
    var self = {

	'getCurrentFocus': function(map){
	    var map_el = map.getContainer();
	    return map_el.getAttribute("data-current-focus");
	},

	'setCurrentFocus': function(map, focus){
	    var map_el = map.getContainer();	    
	    map_el.setAttribute("data-current-focus", focus);
	},

	'getCurrentMap': function(map){
	    var map_el = map.getContainer();	   
	    var map_uri = map_el.getAttribute("data-current-map");
	    
	    if (! self.isValidMap(map_uri)){
		return -1;
	    }
	    
	    return map_uri;
	},

	'setCurrentMap': function(map, map_uri){

	    if (! self.isValidMap(map_uri)){
		current_map = -1;
	    }

	    var map_el = map.getContainer();	   	    
	    map_el.setAttribute("data-current-map", map_uri);
	    return true;
	},

	'updateCreditline': function(map) {

	    var map_el = map.getContainer();
	    var map_id = map_el.getAttribute("id");

	    var creditline_id = map_id + "-creditline";
	    var creditline_el = document.getElementById(creditline_id);
	    
	    if (! creditline_el){
		return;
	    }
	    
	    creditline_el.innerHTML = "";

	    var map_uri = self.getCurrentMap(map);

	    if (! self.isValidMap(map_uri)){
		return;
	    }

	    self.appendCreditline(creditline_el, map_uri);
	},

	// Cribbed from ios-sfomuseum-maps-t2

	'appendCreditline': function(el, map_uri){

	    var map_details = _catalog[map_uri];
	    var map_year = map_details["year"];
	    
	    var source = self.sourceForMap(map_uri);
	    var ext_id = self.externalIdForMap(map_uri);
	    
	    var title = "Aerial view of San Francisco International Airport";
	    
	    if (parseInt(map_year) < 1954){
		title = "Aerial view of San Francisco Airport";
	    }
	    
	    var source_attribution = "SFO Museum";
	    var osm_attribution = "Coastline data provided by OpenStreetMap"
	    var accession_number = ext_id;
	    
	    if (source != "SFO Museum Aviation Collection"){
		source_attribution = "Courtesy " + source;
	    }
	    
	    el.innerHTML = "";
	    
	    var title_el = document.createElement("div");
	    title_el.setAttribute("class", "creditline-title");
	    title_el.appendChild(document.createTextNode(title));
	    
	    var map_el = document.createElement("span");
	    map_el.setAttribute("class", "creditline-map");
	    map_el.appendChild(document.createTextNode(" " + map_year));
	    
	    title_el.appendChild(map_el);
	    el.appendChild(title_el);
	    
	    var source_el = document.createElement("div");
	    source_el.setAttribute("class", "creditline-source");
	    source_el.appendChild(document.createTextNode(source_attribution));
	    
	    el.appendChild(source_el);
	    
	    if (accession_number){
		var accession_el = document.createElement("div");
		accession_el.setAttribute("class", "creditline-accession-number");
		accession_el.appendChild(document.createTextNode(accession_number));
		el.appendChild(accession_el);
	    }

	},

	'isValidMap': function(map_uri){
	    return (_catalog[map_uri]) ? true : false;
	},

	// START OF maybe put in sfomuseum.maps.catalog.js

	'layerDefinitionFromDate': function(map_uri){

	    // See this? It's a placeholder in advance of a lot of boring code
	    // to parse dates and handle timezone. The relevant point is that
	    // we don't need any of that as of this writing and can rely on date
	    // being an `edtf:date` map value. If that changes we may want or
	    // need to account for date parsing using a wasm-ified sfomuseum/go-edtf
	    // widget.

	    /*
	    var map = parseInt(date);

	    if (isNaN(map)){
		return null;
	    }
	     */
	    
	    return self.layerDefinitionFromMap(map_uri);
	},

	'layerDefinitionFromMap': function(map_uri){

	    var map_details = _catalog[map_uri];
	    var map_year = map_details["year"];
	    
	    var data = sfomuseum.maps.catalog.data();
	    var count = data.length;

	    var shortest_dist;
	    var closest_def;

	    for (var i=0; i < count; i++){

		var def = data[i];
		var y = def["year"];

		if (y == map_year){
		    closest_def = def;
		    break;
		}

		var dist;

		if (y < map_year){
		    dist = map_year - y;
		} else {
		    dist = y - map_year;
		}

		// Note that the <= operator will cause a more recent map layer
		// to be chosen over an older one.

		if ((isNaN(shortest_dist)) || (dist <= shortest_dist)){
		    shortest_dist = dist;
		    closest_def = def;
		}
	    }
	    
	    return closest_def;
	},

	// END OF maybe put in sfomuseum.maps.catalog.js

	'sourceForMap': function(map_uri){

	    if (! _catalog[map_uri]){
		return _sources['-1'];
	    }

	    var src = _catalog[map_uri][2];	// What?
	    return _sources[src];
	},

	'externalIdForMap': function(map_uri){

	    if (! _catalog[map_uri]){
		return "";
	    }

	    var details = _catalog[map_uri];
	    
	    if (details.length < 4){
		return "";
	    }

	    return details[3];
	},

	'mapsAsList': function(){

	    var maps_list = [];

	    for (y in _catalog){
		maps_list.push(y);
	    }

	    return maps_list;
	},
	
	'getNextMap': function(current_map_uri){

	    var maps = self.mapsAsList();	
	    var count_catalog = maps.length;
	    
	    var next_map;
	    
	    if (current_map_uri == -1){
		next_map_uri = maps[0];
	    }
	    
	    else {
		
		for (var i = 0; i < count_catalog; i++){
		    
		    if (maps[i] != current_map_uri){
			continue;
		    }
		    
		    var j = i + 1;
		    
		    if (j == count_catalog){
			j = 0;
		    }
		    
		    next_map_uri = maps[j];
		    break;
		}
	    }
	    
	    return next_map_uri;
	},

	'getPreviousMap': function(current_map_uri){

	    var maps = self.mapsAsList();
	    var count_catalog = maps.length;
	    
	    var previous_map_uri;
	    
	    if (current_map_uri == -1){
		previous_map_uri = maps[ count_catalog - 1 ];
	    }
	    
	    else {
		
		for (var i = 0; i < count_catalog; i++){
		    
		    if (maps[i] != current_map_uri){
			continue;
		    }
		    
		    var j = i - 1;
		    
		    if (j < 0){
			j = count_catalog - 1;
		    }
		    
		    previous_map_uri = maps[j];
		}
	    }
	    
	    return previous_map_uri;
	},
	
    };

    return self;
    
})();
