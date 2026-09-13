# heist

A gemmologist's bench. Choose a species and a cut, and the stone is built
by [artshape-render](https://github.com/onion2k/artshape-render)'s own gem
part and drawn by its path tracer — refraction, dispersion and the body
colour traced through the facets as planes — with everything about the
stone laid over the picture: the cut's proportions and angles measured
off the model, the facets by band with diagrams to hover, the species'
composition and crystallography, the optics as published and as traced,
and the grading a real stone of that kind would carry.

    npm install
    npm link artshape-render   # optional: a local checkout instead of the pinned tag
    npm run dev

Needs WebGPU: a current Chrome, Edge or Safari.

The trace converging needs artshape-render v0.14.1 or later, which is
what package.json pins: before it, the viewer's pacing judged a trace's
sample-a-frame as a slow run and its ladder restarted the accumulation
every third of a second.

## What it shows

**The stone.** Twelve species — the renderer's gem materials, each with
its published index of refraction and dispersion — in nine cuts: round,
oval, pear, marquise and trillion brilliants, the emerald (step) cut, the
baguette, the rose and the cabochon. Width, length, depth, table and the
count of facets round the girdle can be set by hand or left to the cut's
own proportions, and the round and the oval — built as the trade cuts
them, from the crown and pavilion angles, the star and lower-half lengths
and the culet — take those too; the pose stands the stone on its culet,
lays it table down, or turns it on its side.

**The colour is real.** A diamond's letter from D to Z, or a fancy, and
the trade's varieties of every other species — cornflower, padparadscha,
pigeon's blood, Santa Maria, mandarin — are body colours the tracer
carries, registered with the renderer's material table under the species'
own optics; a tone and a saturation move them. The grading card says what
the choice means; the picture shows it.

**A gemmologist's lights.** Beside the renderer's baked skies, four
environment maps heist paints itself: a grading lamp, a dark-field loupe,
and the two cut-analysis instruments, the ASET and the ideal-scope, which
colour every direction light can come from so that a stone face up shows,
in red, green and blue, where its light is returned from and where it
leaks. The key and the rig are put out while one is on, and the card over
the picture says how to read it.

**Measured, not typed.** Every number on the cards is read back off the
mesh the renderer draws. The facets are recovered from the triangles
(analysis.ts), classified into table, crown, girdle, pavilion and culet,
grouped into bands, and measured for angle and area; the trade's
proportions — table, depth, crown and pavilion angles, girdle, ratio —
are computed from them and set against guide ranges; the volume comes
from the closed surface and the species' specific gravity turns it into
carats.

**Callouts** point into the stone from the picture — table, girdle,
culet, and one facet from each band — and hide when their face turns
away. Hovering a facet in the plan diagrams adds a callout for it.

**The tracer.** Traced quality is the default and converges while the
view is still; the status line under the picture says how far it has
got. Draft and final are there for working in.

## How it is put together

    src/main.ts      the page: controls, building the stone, the frame hook
    src/analysis.ts  facets, bands, proportions, volume — measured off the mesh
    src/diagrams.ts  the plan and elevation SVGs
    src/overlay.ts   the cards, and the callouts drawn over the canvas
    src/gems.ts      the species: composition, optics, sources, grading scales
    src/colours.ts   the letters and the varieties, as materials the tracer carries
    src/lighting.ts  the ASET, the ideal-scope, the dark-field and the grading lamp
    src/cuts.ts      the cuts: history, canonical facet counts, guide ranges
    src/rigs.ts      studio lighting presets, after the sketchbook's

`npm test` runs the analysis against real gem meshes: that the facets are
read back whole and planar, that a brilliant's proportions come out as the
trade would describe them, that a 6.5 mm diamond weighs about a carat.
