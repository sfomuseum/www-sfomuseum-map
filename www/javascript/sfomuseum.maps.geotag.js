var sfomuseum = sfomuseum || {};
sfomuseum.maps = sfomuseum.maps || {};

sfomuseum.maps.geotag = (function(){

    var default_camera_lat = 37.61799;
    var default_camera_lon = -122.370943;

    var default_target_lat = 37.620078;
    var default_target_lon = -122.372589;
    
    var default_angle = 25;
    
    var self = {

	'initWithDefaults': function(map, on_change){
	    
	    var camera = self.defaultCameraPoint();
	    var target = self.defaultTargetPoint();
	    var angle = self.defaultAngle();

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
	    };
	    
	    return self.init(map, points, on_change);
	},
	
	'init': function(map, points, on_change){

	    var options = {
		draggable: true,
		position: "topright",
	    }
	    
	    var geotag_control = L.geotagPhoto.camera(points, options);

	    geotag_control.addTo(map);	    
	    geotag_control.on('change', on_change);

	    return geotag_control;
	},

	'defaultCameraPoint': function(){
	    // Note lon, lat despite Leaflet convention of lon, lat
	    return [ default_camera_lon, default_camera_lat ];
	},

	'defaultTargetPoint': function(){
	    // Note lon, lat despite Leaflet convention of lon, lat	    
	    return [ default_target_lon, default_target_lat ];
	},

	'defaultAngle': function(){
	    return default_angle;
	},
	
    };

    return self;
    
})();
