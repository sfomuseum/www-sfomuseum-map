package www

import (
	"embed"
)

//go:embed *.html javascript/*.js css/*.css images/* data/*
var FS embed.FS
