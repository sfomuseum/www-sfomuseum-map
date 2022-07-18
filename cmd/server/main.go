package main

import (
	"context"
	"github.com/aaronland/go-http-rewrite"
	"github.com/aaronland/go-http-server"
	"github.com/sfomuseum/go-flags/flagset"
	"github.com/sfomuseum/www-sfomuseum-map/www"
	"log"
	"net/http"
)

func main() {

	fs := flagset.NewFlagSet("map")

	provider := fs.String("map-provider", "", "Valid options are: nextzen, protomaps, rasterzen.")
	protomaps_apikey := fs.String("protomaps-apikey", "", "A valid Protomaps API key.")
	nextzen_apikey := fs.String("nextzen-apikey", "", "A valid Nextzen API key.")

	server_uri := fs.String("server-uri", "http://localhost:8080", "A valid aaronland/go-http-server URI.")

	flagset.Parse(fs)

	ctx := context.Background()

	attrs := map[string]string{
		"sfomuseum-map-provider": *provider,
	}

	switch *provider {
	case "protomaps":
		attrs["protomaps-api-key"] = *protomaps_apikey
	case "rasterzen", "nextzen":
		attrs["nextzen-api-key"] = *nextzen_apikey
	default:
		// pass
	}

	http_fs := http.FS(www.FS)
	handler := http.FileServer(http_fs)

	append_opts := &rewrite.AppendResourcesOptions{
		DataAttributes: attrs,
	}

	handler = rewrite.AppendResourcesHandler(handler, append_opts)

	mux := http.NewServeMux()
	mux.Handle("/", handler)

	s, err := server.NewServer(ctx, *server_uri)

	if err != nil {
		log.Fatalf("Failed to create server, %v", err)
	}

	log.Printf("Listening on %s\n", s.Address())

	err = s.ListenAndServe(ctx, mux)

	if err != nil {
		log.Fatalf("Failed to serve requests, %v", err)
	}
}
