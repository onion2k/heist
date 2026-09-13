# heist

A gemstone viewer over artshape-render's gem part and path tracer. The
renderer, the parts and the materials live in
[artshape-render](https://github.com/onion2k/artshape-render), consumed as
a dependency and linked to a local checkout for working on both; nothing
about drawing belongs here. What is here is the page, the analysis that
measures the drawn mesh, and the reference sheets for species and cuts.

Rules the project keeps:

- Every figure on a card is measured off the mesh or taken from the
  reference sheets; nothing is typed in for one stone. If a number cannot
  be measured, say what it is instead of estimating it.
- The reference sheets (gems.ts, cuts.ts) carry the trade's figures and
  say where a range is a guide rather than a standard.
- `npm test` must pass: it checks the facet reading against real meshes.
- `npm run typecheck` before committing.
