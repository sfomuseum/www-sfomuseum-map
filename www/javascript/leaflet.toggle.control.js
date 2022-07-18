L.Control.Toggle = L.Control.extend({
    options: {
	position: 'topright',
	on_change: null,
    },
    onAdd: function(map) {

        var container = L.DomUtil.create('div', 'leaflet-control-toggle leaflet-bar leaflet-control');
	
        var link = L.DomUtil.create('a', 'leaflet-control-toggle-button leaflet-bar-part', container);
        link.href = '#';
	
	var icon = L.DomUtil.create('div', 'leaflet-control-toggle-icon', link);
	
	this.link = link;
	this.icon = icon;
	this.container = container;

        L.DomEvent.on(this.link, 'click', this._click, this);

	L.DomEvent.disableClickPropagation(container);
	return container;
    },
    
    'hide': function() {
	this.container.style.display = "none";
    },

    'show': function() {
	this.container.style.display = "block";
    },

    onRemove: function(map) {
	// 
    },
    
    _click: function (e) {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);
        this._toggle(e);
    },
    _toggle: function(e) {

	if (this.options.on_change){
	    this.options.on_change(e);
	}
    }
});

