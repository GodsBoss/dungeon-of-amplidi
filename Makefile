build:
	npm run-script build

clean:
	npm run-script clean

gfx:
	mkdir -p dist/gfx
	for f in src/gfx/*.xcf; do node src/gfx/gfx.js $$f dist/gfx; done

serve:
	npm run-script serve

.PHONY: build clean gfx serve
