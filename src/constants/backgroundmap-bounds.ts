import BACKGROUNDMAP_BOUND_LENGTH from '/src/constants/backgroundmap-bound-length.ts'

// This pair of coordinates is used to place the backgroundmap image on the Leaflet map.
export default [
  [0, 0],                                                   // The bottom-left corner of the backgroundmap image is put here.
  [BACKGROUNDMAP_BOUND_LENGTH, BACKGROUNDMAP_BOUND_LENGTH], // The top-right corner of the backgroundmap image is put here.
];
