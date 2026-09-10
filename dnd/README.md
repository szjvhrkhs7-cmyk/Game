# Путевой дневник

Static application based on the saved stage 8 canonical build. Existing day, character and atlas storage keys are preserved.

Run locally: `python3 -m http.server 8765` from this directory.

Verify: `node --check journal.js`, `node --check navigation.js`, `node --test tests/*.test.cjs`.

Publication: GitHub Pages, Game repository, application branch, `/dnd/`. The existing Pages workflow copies this directory into the production artifact. No external application is replaced.

Changes: remove page corners and broken ribbon; common previous/next/list controls; touch and keyboard navigation; constrain decorative observers to root renders; remove duplicate new-day dialog handler; correct bundled image rendering and Atlas SVG strokes; textured rag paper, compact indexes and generated graphite portraits/harbor.

Data is local to the browser and origin. Changing from a Vercel origin to GitHub Pages does not transfer localStorage automatically. Existing records remain at the previous origin.

Assets in assets/paper.webp, harbor.webp and portraits.webp were generated for this journal. Remaining scene images are from the canonical stage 8 build.
