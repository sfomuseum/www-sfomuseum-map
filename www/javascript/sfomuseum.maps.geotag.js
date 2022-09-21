var sfomuseum = sfomuseum || {};
sfomuseum.maps = sfomuseum.maps || {};

sfomuseum.maps.geotag = (function(){

    var default_lat = 37.61799;
    var default_lon = -122.370943;
    var default_angle = 20;
    
    var self = {

	'initWithDefaults': function(map, on_change){
	    
	    var camera = self.defaultCameraPoint();
	    var target = self.defaultTargetPoint();
	    var angle = self.defaultAngle();
	    
	    return self.init(map, camera, target, angle, on_change);
	},
	
	'init': function(map, camera, target, angle, on_change){

	    var points = {
		type: 'Feature',
		properties: {
		    angle: angle
		},
		geometry: {
		    type: 'GeometryCollection',
		    geometries: [
			{
			    type: 'Point',
			    coordinates: camera,
			},
			{
			    type: 'Point',
			    coordinates: target,
			}
		    ]
		}
	    }

	    var options = {
		draggable: true,
		
	    }
	    
	    var geotag_layer = L.geotagPhoto.camera(points, options);

	    geotag_layer.addTo(map);	    
	    geotag_layer.on('change', on_change);

	    return geotag_layer;
	},

	'defaultCameraPoint': function(){
	    return [ default_lat, default_lon ];
	},

	'defaultTargetPoint': function(){
	    return [ default_lat, default_lon ];
	},

	'defaultAngle': function(){
	    return default_angle;
	},
	
    };

    return self;
    
})();
