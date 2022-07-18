var sfomuseum = sfomuseum || {};
sfomuseum.maps = sfomuseum.maps || {};

sfomuseum.maps.leaflet = (function(){

    var _maps = {};

    var _feature_panes = {};
    var _popup_panes = {};

    var _pink = "#f11499";
    var _gold = "#8a741d";
    var _white = "#ffffff";
    var _black = "#000000";
    var _beige = "#bab28f";

    var _principal = _gold;
    var _feature = _beige;
    var _fill = _black;

    _principal = _black;
    _fill = _gold;

    var _styles = {
	"Point": {
	    "fillColor": _feature,
	    "weight": 3,
	    "opacity": 1,
	    "radius": 10,
	    "color": _principal,
	    "fillOpacity": .9
	},
	"MultiPoint": {
	    "fillColor": _fill,
	    "weight": 3,
	    "opacity": 1,
	    "radius": 10,
	    "color": _principal,
	    "fillOpacity": .9
	},
	"Polygon": {
	    "color": _white,
	    "weight": 1,
	    "opacity": 1,
	    "fillColor": _black,
	    "fillOpacity": .35
	},
	"LineString": {
	    "color": _principal,	
	    "weight": 3,
	    "opacity": 1,
	},
	"Container": {
	    "color": _principal,
	    "weight": 0,
	    "opacity": 1,
	    "fillColor": _gold,
	    "fillOpacity": .4
	},
	// as a leaflet marker cluster spider leg - if you're looking for the
	// actual marker cluster styles they are defined in css in the
	// .marker-cluster and friends classes (20200405/thisisaaronland)
	"SpiderLegPolyline": {
	    "weight": 1.5,
	    "color": _principal,
	    "opacity": 0.5
	},
	"FlightPath": {
		"color": _principal,	
		"weight": 1,
		"opacity": 1,
	},
	"FlightHead": {
		"fillColor": _fill,
		"weight": 3,
		"opacity": 1,
		"radius": 3,
		"fillOpacity": .7,
		"color": _principal,	
	},
	"Mask": {
		"color": _white,
		"weight": 1,
		"opacity": 1,
		"fillColor": _black,
		"fillOpacity": .4
	}
    };

    _styles["MultiPoint"] = _styles["Point"];
    _styles["MultiPolygon"] = _styles["Polygon"];    

    var self = {

	'init': function(){

	    if ((! sfomuseum.data) || (! sfomuseum.data.fetch)){		
		console.log("Missing sfomuseum.data.fetch");
		return false;
	    }

	    /*
	    if (! sfomuseum.maps.rasterzen){
		console.log("Missing sfomuseum.maps.rasterzen");
		return false;
	    }
	    */

	    return true;
	},
	
	'styleWithLabel': function(label){
	    return _styles[label];
	},
	
	'map': function(map_el) {
	    
	    var map_id = map_el.getAttribute("id");

	    if (! map_id){
		console.log("Missing ID attribute");
		return null, null;
	    }
	    
	    if (! _maps[map_id]){

		var opts = {
		    minZoom: 0,		// nextzen has trouble with zoom 1
		    maxZoom: 20,	// rasterd needs to learn about over-zooming
		    keyboard: false,	// causes the map to move then reset when doing JS-based pagination
		    fullscreenControl: true,	// https://github.com/Leaflet/Leaflet.fullscreen
		};

		var map = L.map(map_id, opts);

		// https://leafletjs.com/reference-1.3.4.html#control-scale
		L.control.scale().addTo(map);


		map["sfomuseum_loaded"] = false;
		map["sfomuseum_isnew"] = true;

		map.on("load", function(e){
		    map["sfomuseum_loaded"] = true;
		});

		_maps[map_id] = map;
	    }

	    else {

		_maps[map_id]["sfomuseum_isnew"] = false;
	    }

	    // console.log("MAP", map_id, _maps[map_id]["sfomuseum_isnew"]);

	    return _maps[map_id];
	},

	'createMap': function(map_el) {
	    return self.map(map_el);
	},

	'createSFOMuseumMap': function(map_el) {

	    var map = self.createMap(map_el);

	    if (! map){
		return null;
	    }

	    if (map.sfomuseum_isnew){

		var zoom = 14;
		var lat = 37.6185;
		var lon = -122.3829;
		
		map.setView([ lat, lon ], zoom);

		/*
		var url = sfomuseum.maps.rasterzen.tileURL('svg', {'api_key': api_key});
		var tile_layer = sfomuseum.maps.rasterzen.tileLayer(url, {});
		
		tile_layer.addTo(map);
		*/
	    }
	    
	    return map;
	},

	'jumpToFeature': function(map, feature){

	    var bbox = whosonfirst.geojson.derive_bbox(feature);

	    var swlon = parseFloat(bbox[0]);
	    var swlat = parseFloat(bbox[1]);
	    var nelon = parseFloat(bbox[2]);
	    var nelat = parseFloat(bbox[3]);
	    
	    // TBD if/what/where/when this is a flag we can toggle - as of
	    // this writing it makes the nearby stuff weird to use
	    // (20181214/thisisaaronland)

	    if ((swlon == nelon) && (swlat == nelat) && (feature["type"] == "Feature")){

		var lat = swlat;
		var lon = nelon;
		var zoom = 14;
	
		map.setView([lat, lon], zoom);
		return;
	    }

	    var sw = [ swlat, swlon ];
	    var ne = [ nelat, nelon ];
	    var bounds = [ sw, ne ];

	    var opts = {
		// 'padding': 20,
	    };
	    
	    // console.log("DEBUG", "FIT BOUNDS", arguments.callee.caller.name, swlat, swlon, nelat, nelon);
	    map.fitBounds(bounds, opts);
	},

	'addGeoJSONFeature': function(map, feature, style) {

	    /* START OF masking */

	    if (style == "mask"){

		// reset style here so that defaults will pick up
		// if masking is not relevant

		style = "";

		var geom = feature["geometry"];
		
		if ((geom["type"] == "Polygon") || (geom["type"] == "MultiPolygon")){
		    
		    var mask = [
			[-180, -90],
			[-180, 90 ],
			[ 180, 90 ],
			[ 180, -90 ],
			[-180, -90],
		    ];
		    
		    new_coords = [
			mask,
		    ];
		    
		    var add_rings = function(rings){
			var count_rings = rings.length;
			for (var i=0; i < count_rings; i++){
			    new_coords.push(rings[i]);
			}		    
		    };
		    
		    if (geom["type"] == "Polygon"){
			add_rings(geom["coordinates"]);
		    }
		    
		    if (geom["type"] == "MultiPolygon"){
			
			var polys = geom["coordinates"];
			var count_polys = polys.length;
			
			for (var i=0; i < count_polys; i++){
			    add_rings(polys[i]);
			}
		    }
		    
		    feature["geometry"]["type"] = "Polygon";
		    feature["geometry"]["coordinates"] = new_coords;
		    
		    style = self.styleWithLabel("Mask");
		} 
	    }

	    if (! style){

		if (feature["type"] == "Feature"){
		    style = self.styleWithLabel(feature["geometry"]["type"]);
		}

		else {
		    style = self.styleWithLabel("Point");
		}
	    }

	    /* END OF masking */

	    var map_el = map.getContainer();
	    var map_id = map_el.getAttribute("id");

	    var feature_pane_name = "leaflet-" + map_id;
	    var popup_pane_name = "popup-" + map_id;

	    if (! _feature_panes[map_id]){
		_feature_panes[map_id] = map.createPane(feature_pane_name);
		_feature_panes[map_id].style.zIndex = 7000;
	    }

	    if (! _popup_panes[map_id]){
		_popup_panes[map_id] = map.createPane(popup_pane_name);
		_popup_panes[map_id].style.zIndex = 7500;
	    }

	    if ((feature["properties"]) && (feature["properties"]["leaflet:pane"])){
		feature_pane_name = feature["properties"]["leaflet:pane"];
	    }

	    var geojson_opts = {
		pane: feature_pane_name,
		style: style,
		pointToLayer: function (feature, latlng){			
		    return L.circleMarker(latlng, {"pane": feature_pane_name});
		},
		onEachFeature: function(feature, layer){

		    // Disabled while I determine whether this is really necessary
		    // and if it is why masks (above) trigger errors here...
		    return;

		    var props = feature["properties"];

		    if (! props){
			console.log("feature missing properties", feature);
			return;
		    }
		    
		    var wof_id = props["wof:id"];

		    if (! wof_id){
			// console.log("properties missing wof:id", props);
			return;
		    }

		    var root = document.body.getAttribute("data-abs-root-url");
		    var tree = sfomuseum.data.id2parent(wof_id);

		    var url = root + "/id/" + tree;
		    		   
		    var mprops = null;
		    var sizes = null;

		    var thumb_size = null;
		    var thumb_details = null;

		    var tooltip = props["wof:name"];

		    if (props["wof:label"]){
			tooltip = props["wof:label"];
		    }

		    var placetype = props["sfomuseum:placetype"];
 
		    // something something something check for sfomuseum:placetype
		    // which is not set anywhere in the sfomuseum.maps.results.js
		    // or corresponding markup stack yet (20190319/thisisaaronland)

		    mprops = props["media:properties"];
		    
		    if (mprops){
			sizes = mprops["sizes"];
		    }

		    if (sizes){

			var thumb_possible = [ "sq", "s" ];
			var possible_count = thumb_possible.length;
			
			for (var i=0; i < possible_count; i++){
			    
			    thumb_size = thumb_possible[i];
			    thumb_details = sizes[thumb_size];
			    
			    if (thumb_details){
				break;
			    }
			}
		    }

		    if (thumb_details){

			var fname = wof_id + "_" + thumb_details["secret"] + "_" + thumb_size + "." + thumb_details["extension"];

			root = "https://millsfield.sfomuseum.org/";
			var src = root + "media/" + tree + "/" + fname;
			
			tooltip = '<img src="' + src + '" class="results-item-thumbnail" />';

			// maybe not? (20190319/thisisaaronland)

			setTimeout(function(){
			    new Image().src = src;
			}, 100);
		    }

		    if (tooltip){

			var popup = '<a href="' + url + '">' + tooltip + '</a>';

			// https://leafletjs.com/reference-1.4.0.html#popup-option

			var popup_opts = {
			    pane: popup_pane_name,
			    minWidth: 200,
			    closeButton: false,
			};

			layer.bindPopup(popup, popup_opts);
		    }
		    
		    layer.on("mouseover", function(e){
			layer.openPopup();
			return false;
		    });

		},
	    };
	    
	    var geojson_layer = L.geoJSON(feature, geojson_opts)

	    if (feature["type"] == "FeatureCollection"){

		var markers_opts = {
		    "showCoverageOnHover": false,
		    "spiderLegPolylineOptions": self.styleWithLabel("SpiderLegPolyline"),
		    "pane": feature_pane_name,
		};

		var markers_layer = L.markerClusterGroup(markers_opts);

		markers_layer.addLayer(geojson_layer);

		markers_layer.on("click", function(e){

		    try {
			rsp = e.layer.openTooltip();
			console.log("OPEN", rsp);
		    } catch (err) {
			console.log("ERR", err);
		    }
		    return false;
		});

		map.addLayer(markers_layer);
		return markers_layer;
	    }

	    map.addLayer(geojson_layer);
	    return geojson_layer;
	},

	'addGeoJSONFeatureWithJump': function(map, feature, style) {

	    var layer = self.addGeoJSONFeature(map, feature, style);
	    
	    if (layer){
		self.jumpToFeature(map, feature);
	    }

	    return layer;
	},
	
	'addGeoJSONFeatureFromURLWithJump': function (map, url) {

	    var on_success = function(map, feature, layer){
		self.jumpToFeature(map, feature);
	    };

	    self.addGeoJSONFeatureFromURL(map, url, on_success);
	},
	
	'addGeoJSONFeatureFromURL': function (map, url, on_success, on_error) {
	    
	    var _success = function(feature){
		
		var layer = self.addGeoJSONFeature(map, feature);

		if (on_success){
		    on_success(map, feature, layer);
		}
	    };
		
	    var _error = function(rsp){
		
		console.log("ERROR", rsp);

		if (on_error){
		    on_error(rsp);
		}
	    };
	    
	    sfomuseum.data.fetch(url, _success, _error);
	}
    };

    return self;
})();
