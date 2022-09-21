window.addEventListener("load", function load(event){

    var map_el = document.getElementById("map");

    if (! map_el){
	console.log("Missing element with 'map' ID.");
	return;
    }
    
    var map = sfomuseum.maps.leaflet.map(map_el);

    if (! map){
	console.log("Failed to derive map from map element.");
	return;
    }
    
    var geotag = map_el.getAttribute("data-sfomuseum-map-geotag");
    
    if (! geotag){
	console.log("Map element does not have geotag attribute.");
	return;
    }
    
    var on_change = function(ev){
	var fov = this.getFieldOfView();
	console.log("FOV", fov);
    };

    sfomuseum.maps.geotag.initWithDefaults(map, on_change);

});
