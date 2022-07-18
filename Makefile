cli:
	go build -mod vendor -o bin/server cmd/server/main.go

protomaps:
	go run -mod vendor cmd/server/main.go -map-provider protomaps -protomaps-apikey $(APIKEY)

nextzen:
	go run -mod vendor cmd/server/main.go -map-provider rasterzen -nextzen-apikey $(APIKEY)

coastline:
	go run -mod vendor cmd/server/main.go -map-provider coastline

# whosonfirst/go-whosonfirst-exportify
AS_FEATURECOLLECTION=as-featurecollection

# sfomuseum/go-sfomuseum-geometry
UNION_FEATURECOLLECTION=union-featurecollection

# aaronland/go-json-tools
JF=jf

# sfomuseum-data-architecture is where we are pulling "contextual" data for
# the contemporary physical plant. That data is derived from the SFO GIS systems
# and produced using code in the flysfo/go-sfomuseum-gis package.

ARCHITECTURE_DATA=/usr/local/data/sfomuseum-data-architecture/
ITERATOR_SCHEME=repo://

DATA_JS=www/javascript/sfomuseum.maps.data.js

campus:
	curl -o data/campus.geojson https://raw.githubusercontent.com/sfomuseum-data/sfomuseum-data-whosonfirst/91a9d289768f94c42cf740ac6362a4d9a79b4782/data/102/527/513/102527513.geojson

terminals:
	$(AS_FEATURECOLLECTION) -iterator-uri '$(ITERATOR_SCHEME)?include=properties.mz:is_current=1&include=properties.sfomuseum:placetype=terminal' $(ARCHITECTURE_DATA) > data/terminals.geojson

airtrain:
	$(AS_FEATURECOLLECTION) -iterator-uri '$(ITERATOR_SCHEME)?include=properties.mz:is_current=1&include=properties.sfomuseum:placetype=airtrain' $(ARCHITECTURE_DATA) > data/airtrain.geojson
	$(AS_FEATURECOLLECTION) -iterator-uri '$(ITERATOR_SCHEME)?include=properties.mz:is_current=1&include=properties.sfomuseum:placetype=rail' $(ARCHITECTURE_DATA) > data/airtrain-railway.geojson

# 1477863277 == Rental Car Center (building)
# 1477856005 == Hotel (hotel)

buildings:
	$(AS_FEATURECOLLECTION) -iterator-uri '$(ITERATOR_SCHEME)?include=properties.mz:is_current=1&include=properties.sfomuseum:placetype=(building|hotel)&include=properties.wof:id=(1477863277|1477856005)' $(ARCHITECTURE_DATA) > data/buildings.geojson

garages:
	$(AS_FEATURECOLLECTION) -iterator-uri '$(ITERATOR_SCHEME)?include=properties.mz:is_current=1&include=properties.sfomuseum:placetype=garage' $(ARCHITECTURE_DATA) > data/garages.geojson

runways:
	@echo "Generating runways from sfmuseum-data is disabled pending updates to the underlying data in the GIS systems"
	$(AS_FEATURECOLLECTION) -iterator-uri '$(ITERATOR_SCHEME)?include=properties.mz:is_current=1&include=properties.sfomuseum:placetype=runway' $(ARCHITECTURE_DATA) > data/runways.geojson

complex:
	@make terminals
	@make airtrain
	@make buildings
	@make garages
	@make runways
	$(UNION_FEATURECOLLECTION) data/terminals.geojson data/buildings.geojson data/airtrain.geojson data/airtrain-railway.geojson data/garages.geojson data/runways.geojson > data/complex.geojson

data-js:
	if test -f $(DATA_JS); then mv $(DATA_JS) $(DATA_JS).bak; fi
	touch $(DATA_JS)
	echo "; var _complex=\c" >> $(DATA_JS)
	cat data/complex.geojson | $(JF) >> $(DATA_JS)
	echo "; var _campus=\c" >> $(DATA_JS)
	cat data/campus.geojson | $(JF) >> $(DATA_JS)
	echo ";" >> $(DATA_JS)
