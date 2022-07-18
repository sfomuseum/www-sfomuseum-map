var sfomuseum = sfomuseum || {};
sfomuseum.maps = sfomuseum.maps || {};

sfomuseum.maps.depictions = (function(){

    var _popup_panes = {};

    var self = {

	'addAlternateGeometry': function(map, id, label){
	    
	    var on_success = function(f){
		sfomuseum.maps.leaflet.addGeoJSONFeature(map, f, "mask");
	    };
	    
	    var on_error = function(err){
		console.log("Failed to retrieve alt geom", id, label, err);
	    };
	    
	    var args = {
		"alt": 1,
		"source": label
	    };
	    
	    var alt_uri = whosonfirst.uri.id2abspath(id, args);
	    whosonfirst.net.fetch(alt_uri, on_success, on_error);
	},
	
	'addDepiction': function(map, depiction_id){

	    var map_el = map.getContainer();
	    var map_id = map_el.getAttribute("id");

	    var pane_name = "depiction-popup-" + map_id;

	    if (! _popup_panes[map_id]){	
		var popup_pane = map.createPane(pane_name);
		popup_pane.style.zIndex = 8000;
		_popup_panes[map_id] = popup_pane;
	    }

	    var on_success = function(f){
		
		var props = f["properties"];
		var lat = props["geotag:camera_latitude"];
		var lon = props["geotag:camera_longitude"];
		
		if ((! lat) || (! lon)){
		    console.log("Missing coordinates", image_id);
		    return;
		}
		
		var alt_geoms = props["src:geom_alt"];
		var count_alt = alt_geoms.length;
		
		var fov_label = "geotag-fov";
		var has_fov = false;
		
		for (var i=0; i < count_alt; i++){
		    if (alt_geoms[i] == fov_label){
			has_fov = true;
			break;
		    }
		}
		
		if (has_fov){
		    
		    setTimeout(function(){
			self.addAlternateGeometry(map, depiction_id, fov_label);
		    }, 10);
		}
		
		var media_props = props["media:properties"];
		
		if (! media_props){
		    console.log("Missing media:properties", depiction_id);
		    return;
		}
		
		var sizes = media_props["sizes"];
		
		var thumb = sizes["s"];
		var thumb_id = depiction_id;
		var thumb_secret = thumb["secret"];
		var thumb_ext = thumb["extension"];
		
		var thumb_fname = depiction_id + "_" + thumb_secret + "_" + "s" + "." + thumb_ext;
		var thumb_tree = sfomuseum.data.id2parent(thumb_id);
		
		var thumb_root = "https://static.sfomuseum.org/";		// document.body.cfg_abs_root_url
		var thumb_src = thumb_root + "media/" + thumb_tree + "/" + thumb_fname;
		
		var thumb_url = "/id/" + thumb_id + "/#geotagged";
		
		var pop_opts = {
		    closeButton: false,
		    minWidth: 175,
		    autoPan: true,
		    keepInView: true,
		    autoClose: false,
		    closeOnClick:false,	// https://github.com/Leaflet/Leaflet/issues/5719
		    pane: pane_name,
		};
		
		var pop = L.popup(pop_opts);
		pop.setContent('<a href="' + thumb_url + '"><img src="' + thumb_src + '" style="max-height:175px; max-width:175px;" /></a>');
		
		pop.setLatLng([lat, lon]);
		
		map.openPopup(pop);
	    };
	    
	    var on_error = function(err){
		console.log("Failed to fetch depiction", depiction_id, err);
	    };
	    
	    var image_uri = whosonfirst.uri.id2abspath(depiction_id);
	    whosonfirst.net.fetch(image_uri, on_success, on_error);
	},

	'addDepictionsForId': function(map, id){

	    var on_success = function(f){
		
		var props = f["properties"];
		
		var depictions = props["geotag:depictions"];
		
		if (! depictions){
		    return;
		}
		
		var count = depictions.length;
		
		if (! count){
		    return;
		}
		
		for (var i=0; i < count; i++){
		    var depiction_id = depictions[i];
		    self.addDepiction(map, depiction_id);
		}
	    };
	    
	    var on_error = function(err){
		console.log("Failed to fetch feature", id, err);
	    };
	    
	    var feature_uri = whosonfirst.uri.id2abspath(id);
	    whosonfirst.net.fetch(feature_uri, on_success, on_error);
	},
	
    };

    return self;

})();
