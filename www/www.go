package www

import (
	"embed"
)

//go:embed *.html javascript/*.js css/*.css images/*
var FS embed.FS
