window.addEventListener("load", function load(event){

    var els = document.getElementsByClassName("sfomuseum-map");
    var count = els.length;

    var maps = {};

    var fetch = function(wof_id, map, args){

	var _success = function(f){

	    if (args["geometry"] == "airport"){

		var props = f["properties"];

		if (props["src:geom"] == "woedb"){

		    var poly = whosonfirst.geojson.derive_bbox_as_polygon(f);
		    var geom = {"type":"Polygon","coordinates": poly }
		    f["geometry"] = geom;

		    sfomuseum.maps.leaflet.addGeoJSONFeatureWithJump(map, f);
		    return;
		}

		sfomuseum.maps.leaflet.addGeoJSONFeatureWithJump(map, f);
		return;
	    }

	    else if (args["geometry"] == "centroid"){

		var props = f["properties"];
		var lat = props["geom:latitude"];
		var lon = props["geom:longitude"];

		f["geometry"] = { "type": "Point", "coordinates": [ lon, lat ] };
		sfomuseum.maps.leaflet.addGeoJSONFeature(map, f);

		var zoom = map.getZoom();

		if (args["zoom"]){
		    zoom = args["zoom"];
		}

		map.setView([lat, lon], zoom);
		return;
	    }

	    else if (args["geometry"] == "derived-airport"){

		var props = f["properties"];
		var airport_ids = props["millsfield:airport_id"];
		
		if (! airport_ids){
		    sfomuseum.maps.leaflet.addGeoJSONFeatureWithJump(map, f);
		} else if (airport_ids.length != 1){
		    sfomuseum.maps.leaflet.addGeoJSONFeatureWithJump(map, f);
		} else {
		    args["geometry"] = "centroid";
		    fetch(airport_ids[0], map, args);
		}
	    }

	    else if (args["geometry"] == "flight"){

		sfomuseum.maps.leaflet.addGeoJSONFeatureWithJump(map, f);

		var props = f["properties"];
		var alt = props["src:geom_alt"];

		var alt_path;

		if (alt){

		    if (alt.indexOf("swim-path") != -1){
			alt_path = "swim-path";
		    } 

		    else if (alt.indexOf("swim-route") != -1){
			alt_path = "swim-route";
		    }

		    else {
			
		    }
		}

		if (alt_path){
		    
		    var alt_success = function(alt_f){
			sfomuseum.maps.leaflet.addGeoJSONFeature(map, alt_f);
		    };

		    var props = f["properties"];
		    var alt_id = props["wof:id"];

		    sfomuseum.data.fetch_alt_geojson(alt_id, alt_path, alt_success, _error);
		}

		return;
	    }
	    
	    else {

		if (args['jump_to']){

		    sfomuseum.maps.leaflet.addGeoJSONFeature(map, f);

		    var on_success= function(f){

			var bbox = whosonfirst.geojson.derive_bbox(f);

			var bounds = [
			    [ bbox[1], bbox[0] ],
			    [ bbox[3], bbox[2] ],
			];

			map.fitBounds(bounds);
		    };
		    
		    var on_error = function(err){
			console.log("Failed to jump to", f, err);
		    };

		    sfomuseum.data.fetch_geojson(args['jump_to'], on_success, on_error);

		} else {

		    sfomuseum.maps.leaflet.addGeoJSONFeatureWithJump(map, f);

		    if (args["zoom"]){
			map.setZoom(args["zoom"]);
		    }
		}
	    }
	};

	var _error = function(rsp){
	    console.log("ERROR", rsp);
	};

	sfomuseum.data.fetch_geojson(wof_id, _success, _error);
    };

    for (var i =0; i < count; i++){

	var map_el = els[i];
	var map_id = map_el.getAttribute("id");

	if (! map_id){
	    continue;
	}

	var wof_id = map_el.getAttribute("data-wof-id");
	var lat = map_el.getAttribute("data-sfomuseum-map-latitude");
	var lon = map_el.getAttribute("data-sfomuseum-map-longitude");

	if ((! wof_id) && (! lat) && (!lon)){
	    continue;
	}

	var map = sfomuseum.maps.leaflet.createSFOMuseumMap(map_el);

	if (! map){
	    continue;
	}

	var map_args = sfomuseum.maps.base.argsFromEl(map_el);
	
	sfomuseum.maps.base.addTo(map, map_args);

	var geom = map_el.getAttribute("data-sfomuseum-map-geometry");
	var zoom = map_el.getAttribute("data-sfomuseum-map-zoom");
	var jump_to = map_el.getAttribute("data-sfomuseum-map-jump-to");

	var args = {
	    'geometry': geom,
	    'zoom': zoom,
	    'jump_to': jump_to,
	};

	if ((lat) && (lon)){

	    var zm = map.getZoom();

	    if (zoom){
		zm = zoom;
	    }

	    map.setView([lat, lon], zm);

	} else if (zoom) {

	    map.setZoom(zoom);

	} else {}

	if (wof_id){
	    fetch(wof_id, map, args);
	}
    }

});
