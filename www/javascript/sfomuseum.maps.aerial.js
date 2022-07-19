var sfomuseum = sfomuseum || {};
sfomuseum.maps = sfomuseum.maps || {};

sfomuseum.maps.aerial = (function(){

    var _years = sfomuseum.maps.catalog.asYears();

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

	'getCurrentYear': function(map){
	    var map_el = map.getContainer();	   
	    var current_year = map_el.getAttribute("data-current-year");
	    
	    if (! self.isValidYear(current_year)){
		return -1;
	    }
	    
	    return current_year;
	},

	'setCurrentYear': function(map, current_year){

	    if (! self.isValidYear(current_year)){
		current_year = -1;
	    }

	    var map_el = map.getContainer();	   	    
	    map_el.setAttribute("data-current-year", current_year);
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

	    var year = self.getCurrentYear(map);

	    if (! self.isValidYear(year)){
		return;
	    }

	    self.appendCreditline(creditline_el, year);
	},

	// Cribbed from ios-sfomuseum-maps-t2

	'appendCreditline': function(el, year){

	    var source = self.sourceForYear(year);
	    var ext_id = self.externalIdForYear(year);
	    
	    var title = "Aerial view of San Francisco International Airport";
	    
	    if (parseInt(year) < 1954){
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
	    
	    var year_el = document.createElement("span");
	    year_el.setAttribute("class", "creditline-year");
	    year_el.appendChild(document.createTextNode(" " + year));
	    
	    title_el.appendChild(year_el);
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

	'isValidYear': function(year){
	    return (_years[year]) ? true : false;
	},

	// START OF maybe put in sfomuseum.maps.catalog.js

	'layerDefinitionFromDate': function(date){

	    // See this? It's a placeholder in advance of a lot of boring code
	    // to parse dates and handle timezone. The relevant point is that
	    // we don't need any of that as of this writing and can rely on date
	    // being an `edtf:date` year value. If that changes we may want or
	    // need to account for date parsing using a wasm-ified sfomuseum/go-edtf
	    // widget.

	    var year = parseInt(date);

	    if (isNaN(year)){
		return null;
	    }
	    
	    return self.layerDefinitionFromYear(year);
	},

	'layerDefinitionFromYear': function(year){

	    var data = sfomuseum.maps.catalog.data();
	    var count = data.length;

	    var shortest_dist;
	    var closest_def;

	    for (var i=0; i < count; i++){

		var def = data[i];
		var y = def["year"];

		if (y == year){
		    closest_def = def;
		    break;
		}

		var dist;

		if (y < year){
		    dist = year - y;
		} else {
		    dist = y - year;
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

	'sourceForYear': function(year){

	    if (! _years[year]){
		return _sources['-1'];
	    }

	    var src = _years[year][2];
	    return _sources[src];
	},

	'externalIdForYear': function(year){

	    if (! _years[year]){
		return "";
	    }

	    var details = _years[year];
	    
	    if (details.length < 4){
		return "";
	    }

	    return details[3];
	},

	'onParseHashFunc': function(map){
	    return function(map, hash){

		var context = hash['context'];	    

		if (context != "bg"){
		    context = "fg";
		}

		sfomuseum.maps.campus.setAerialLayerFocus(map, context);
		return;
	    };
	},

	'onFormatHashFunc': function(map){

	    return function(){
		
		// Remember that year is considered to be the "label" and so it
		// is handled by L.Control.Layers
		
		var extras = [];	
		
		var current_focus = self.getCurrentFocus(map);
	    
		if (current_focus == "fg"){
		    extras.push(current_focus);
		}
		
		return extras;
	    };
	},
    };

    return self;
})();
