/**
 * The backgroundmap image is used as an `L.imageOverlay`.
 * The `L.imageOverlay` is given square bounds.
 * This number is the side length of that square.
 *
 * This is used both to define the bounds of the backgroundmap (`constants/backgroundmap-bounds.ts`), 
 * and to compute a scaling factor for converting between Leaflet units and raster pixels.
 */
export default 1000;
