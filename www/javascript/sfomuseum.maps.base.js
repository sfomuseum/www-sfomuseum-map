// Common code for SFO specific basemaps. This code handles setting up a global map
// tile provider and for setting up the SFO-specific sfomuseum.maps.campus tile layers.
var sfomuseum = sfomuseum || {};
sfomuseum.maps = sfomuseum.maps || {};

sfomuseum.maps.base = (function(){

    var default_args = {
	"aerial": true,
	"creditlines": {
	    "osm": true,
	    "aerial": true
	},
	"resize": false,
	"date": null,
	"hash": false,
    };

    var self = {

	'argsFromEl': function(map_el){

	    var map_args = {};
	    
	    var date = map_el.getAttribute("data-sfomuseum-map-date");
	    var hash = map_el.getAttribute("data-sfomuseum-map-hash");
	    var resize = map_el.getAttribute("data-sfomuseum-map-resize");
	    
	    if (resize){
		map_args["resize"] = true;
	    }
	    
	    if (date){
		map_args["date"] = date;
	    }

	    if (hash){
		map_args["hash"] = true;
	    }

	    return map_args;
	},

	'addTo': function(map, custom_args){

	    var args = Object.assign({}, default_args, custom_args);

	    console.log("ARGS", args);

	    if (args["creditlines"]){
		self.addCreditlinesContainer(map, args["creditlines"]);
	    }

	    var map_el = map.getContainer();

	    var provider = self.getAttribute(map_el, "data-sfomuseum-map-provider");

	    switch (provider) {
	    case "rasterzen":

		var api_key = self.getAttribute(map_el, "data-nextzen-api-key");

		var tile_url = sfomuseum.maps.rasterzen.tileURL('svg', {'api_key': api_key});
		var tile_layer = sfomuseum.maps.rasterzen.tileLayer(tile_url, {});
		
		tile_layer.addTo(map);
		break;

	    case "protomaps":

		var api_key = self.getAttribute(map_el, "data-protomaps-api-key");
		var tile_url = sfomuseum.maps.protomaps.tileURL({'api_key': api_key});
		var tile_layer = sfomuseum.maps.protomaps.tileLayer(tile_url, {});

		tile_layer.addTo(map);
		break;

	    case "coastline":

		    // Something something something protomaps...
			
		    fetch("/data/sfba.geojson").then((rsp) => {
			
			if (! rsp.ok){
			    console.log("Fetch to retrieve SFBA data", rsp);
			    return;
			}
			
			return rsp.json();
			
		    }).then((data) => {

			var sfba_blue = "#354855";
			
			var tile_args = {
			    // "pane": "sfba",
			    "color": "#ccc",
			    "weight": 0,
			    "opacity": 1,
			    "fillColor": sfba_blue,
			    "fillOpacity":1,
			};
			
			var tile_layer = L.geoJSON(data, tile_args);	    
			tile_layer.addTo(map);

			map_el.style.backgroundColor = "#5d5d5d";

			var sw = [37.393073, -122.623901];
			var ne = [ 37.828226, -120.971832 ];
			var bounds = [ sw, ne ];
			
			map.setMaxBounds(bounds);
			map.setMinZoom(10);
			map.setMaxZoom(20);
			
		    }).catch((err) => {
			console.log(err);
		    });

		    break;
		    
	    default:
		console.log("Unsupported map provider:", provider);
	    }

	    sfomuseum.maps.campus.addCampusLayer(map);
	    sfomuseum.maps.campus.addComplexLayer(map);

	    if (args["aerial"]){

		sfomuseum.maps.campus.addAerialControls(map);

		if (args["date"]){

		    var layer_def = sfomuseum.maps.aerial.layerDefinitionFromDate(args["date"]);

		    if (layer_def){
			sfomuseum.maps.campus.setAerialLayer(map, layer_def);
		    }
		}

		if (args["hash"]){
		    console.log("HASH");
		    sfomuseum.maps.campus.addAerialLayersHash(map);
		}
	    }

	    if ((args["resize"]) && (L.control.resizer)){
		var rs =   L.control.resizer({ direction: 's' });
		rs.addTo(map);
	    }
	},

	'addCreditlinesContainer': function(map, args){

	    if (! args){
		args = {};
	    }

	    if ((!args["osm"]) && (! args["aerial"])){
		return;
	    }

	    var map_el = map.getContainer();
	    var map_id = map_el.getAttribute("id");

	    var wrapper = document.createElement("div");
	    wrapper.setAttribute("style", "text-align:right; font-size:11px;color:#ccc;");

	    // OSM

	    if (args["osm"]){

		var osm_link = document.createElement("a");
		osm_link.setAttribute("href", "https://openstreetmap.org/");
		osm_link.appendChild(document.createTextNode("OpenStreetMap"));
		
		var osm_credit = document.createElement("div");
		osm_credit.setAttribute("class", "osm-creditline");
		
		osm_credit.appendChild(document.createTextNode("Map data © "));
		osm_credit.appendChild(osm_link);
		osm_credit.appendChild(document.createTextNode(" contibutors"));

		wrapper.appendChild(osm_credit);
	    }

	    if (args["aerial"]){

		// This is a placeholder element that gets populated by sfomuseum.maps.aerial
		
		var creditline_id = map_id + "-creditline";
		
		var map_credit = document.createElement("div");
		map_credit.setAttribute("id", creditline_id);
		
		wrapper.appendChild(map_credit);
	    }

	    map_el.parentNode.insertBefore(wrapper, map_el.nextSibling);
	},

	'getAttribute': function(map_el, attr){

	    var value = map_el.getAttribute(attr);

	    if (! value){
		value = document.body.getAttribute(attr);
	    }

	    return value;
	}
    };

    return self;
})();
