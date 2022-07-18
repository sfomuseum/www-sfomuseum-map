/*

  for example:

  window.addEventListener("load", function load(event){

    if (! sfomuseum.maps.features.init()){
        console.log("Failed to initializ-e SFO Museum results map");
	return false;
    }

    sfomuseum.maps.features.drawFeatureMapsByClassName("feature-map");
  });

*/

var sfomuseum = sfomuseum || {};
sfomuseum.maps = sfomuseum.maps || {};

sfomuseum.maps.features = (function(){

    var self = {

	'init': function(){

	    if ((! sfomuseum.data) || (! sfomuseum.data.fetch)){		
		console.log("Missing sfomuseum.data.fetch");
		return false;
	    }

	    if (! sfomuseum.maps.leaflet){
		console.log("Missing sfomuseum.maps.leaflet");
		return false;
	    }
	    
	    if (! sfomuseum.maps.leaflet.init()){
		return false;
	    }

	    return true;
	},
	
	'drawFeatureMapsByClassName': function(class_name, on_success, on_error){

	    var els = document.getElementsByClassName(class_name);
	    var count = els.length;

	    for (var i=0; i < count; i++){

		var map_el = els[i];
		self.drawFeatureMap(map_el, on_success, on_error);		
	    }

	},

	'drawFeatureMap': function(map_el, on_success, on_error){

	    var wofid = map_el.getAttribute("data-wofid");

	    var draw_map = function(){

		var map = sfomuseum.maps.leaflet.createSFOMuseumMap(map_el);
		
		var map_args = sfomuseum.maps.base.argsFromEl(map_el);

		sfomuseum.maps.base.addTo(map, map_args);
		return map;
	    };

	    if (! wofid){
		draw_map();
		return;
	    }

	    // context is the "parent" or "container" feature for wof_id
	    var context = map_el.getAttribute("data-sfomuseum-map-context");

	    // jump to "parent" or "container" feature after it's been loaded
	    var jump = map_el.getAttribute("data-sfomuseum-map-jump");

	    var alt_geom = map_el.getAttribute("data-sfomuseum-map-alt-geom");

	    var disable_popups = map_el.getAttribute("data-sfomuseum-map-disable-popups");

	    var with_style = map_el.getAttribute("data-sfomuseum-map-style");

	    var fetch_id = function(id, alt_geom, map_el){

		// TO DO : determine which historical map to display based on
		// the EDTF date range for the feature (20180829/thisisaaronland)
		
		var _success = function(feature){

		    map_el.style.display = "block";
		    
		    var map = draw_map();

		    var layer = sfomuseum.maps.leaflet.addGeoJSONFeatureWithJump(map, feature, with_style);

		    if ((disable_popups == "feature") || (disable_popups == "all")){

			layer.eachLayer(function(l){
			    l.off("click");
			    l.off("mouseover");
			});
		    }

		    var context_id = null;

		    if ((! context) || (context == "parent")){
			var props = feature["properties"];
			context_id = props["wof:parent_id"];
		    }

		    else if (context){
			context_id = parseInt(context);
		    }

		    else {}

		    if (context_id){
			fetch_context(context_id, map);
		    }

		    // something something something trap and return parent layer
		    // something something something... (20180905/thisisaaronland)

		    if (on_success){
			on_success(layer);
		    }
		};

		var _error = function(rsp){
		    
		    console.log("Failed to fetch feature, trying lat, lon", rsp);
		    
		    var lat = map_el.getAttribute("data-latitude");
		    var lon = map_el.getAttribute("data-longitude");
		    
		    lat = parseFloat(lat);
		    lon = parseFloat(lon);
		    
		    if ((! lat) || (! lon)){
			console.log("Invalid coordinates", lat, lon);

			if (on_error){
			    on_error(rsp);
			}
			
			return;
		    }

		    map_el.style.display = "block";
		    
		    var map = sfomuseum.maps.leaflet.createSFOMuseumMap(map_el);
		    
		    if (! map){
			map_el.style.display = "none";		
			return false;
		    }
		    
		    if (map.sfomuseum_isnew){

			var map_args = sfomuseum.maps.base.argsFromEl(map_el);
			sfomuseum.maps.base.addTo(map, map_args);
		    }

		    var geom = {
			"type": "Point",
			"coordinates": [ lon, lat ]
		    };
		    
		    var props = {
			"wof:id": wofid
		    };
		    
		    var feature = {
			"type": "Feature",
			"geometry": geom,
			"properties": props
		    };
		    
		    var layer = sfomuseum.maps.leaflet.addGeoJSONFeature(map, feature);

		    if (on_success){
			on_success(layer);
		    }
		};
	
		if (alt_geom){
		    sfomuseum.data.fetch_alt_geojson(wofid, alt_geom, _success, _error);	
		}

		else {
		    sfomuseum.data.fetch_geojson(wofid, _success, _error);
		}
	    };

	    var fetch_context = function(id, map){
		
		var style = sfomuseum.maps.leaflet.styleWithLabel("Container");
		
		var _success = function(feature) {

		    var layer = sfomuseum.maps.leaflet.addGeoJSONFeature(map, feature, style);
		    
		    if (layer){

			if ((disable_popups == "context") || (disable_popups == "all")){
			    
			    layer.eachLayer(function(l){
				l.off("click");
				l.off("mouseover");
			    });
			}

			layer.bringToBack();

			if (jump == "true"){
			    sfomuseum.maps.leaflet.jumpToFeature(map, feature);
			}
		    }
		};
		
		sfomuseum.data.fetch_geojson(id, _success);		
	    };

	    fetch_id(wofid, alt_geom, map_el);    
	}
    };

    return self;
})();
