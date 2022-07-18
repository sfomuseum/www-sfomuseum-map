var sfomuseum = sfomuseum || {};
sfomuseum.maps = sfomuseum.maps || {};

sfomuseum.maps.rasterzen = (function(){

    var _endpoint = 'https://static.sfomuseum.org/tiles';

    var _template = '{endpoint}/{format}/{z}/{x}/{y}.{extension}?api_key={apikey}';

    var self = {

	'tileURL': function(format, args){

	    var endpoint = _endpoint;

	    if (args['endpoint']){
		endpoint = args['endpoint'];
	    }

	    var url = _template;
	    
	    url = url.replace('{endpoint}', endpoint);	    
	    url = url.replace('{format}', format);
	    url = url.replace('{extension}', format);
	    url = url.replace('{apikey}', encodeURIComponent(args['api_key']));
	    
	    return url;	    
	},

	'tileLayer': function(url, args){

	    args['attribution'] = self.attribution();
	    args['maxZoom'] = 20;

	    return L.tileLayer(url, args);
	},

	'attribution': function(){

	    var attributions = {
		"© OSM contributors": "https://www.openstreetmap.org/",
		"Nextzen": "https://nextzen.org/",
		"Who's On First": "https://whosonfirst.org/",
		"SFO Museum": "https://millsfield.sfomuseum.org/",
	    };
	    
	    var attrs = [];
	    
	    for (var label in attributions){
		
		var link = attrs[label];
		
		if (! link){
		    attrs.push(label);
		    continue;
		}
		
		var anchor = '<a href="' + link + '" target="_blank">' + enc_label + '</a>';
		attrs.push(anchor);
	    }
	    
	    var str_attributions = attrs.join(" | ");
	    return str_attributions;
	}
    };

    return self;
    
})();
