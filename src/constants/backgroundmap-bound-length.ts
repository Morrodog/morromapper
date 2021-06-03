/**
 * The backgroundmap image is used as an `L.imageOverlay`.
 * The `L.imageOverlay` is given square bounds.
 * This number is the side length of that square.
 * See also `constants/backgroundmap-bounds.ts` for its use in that context.
 * See also `components/mm-cell.vue` for its use outside of that context.
 *
 * (The independent usage of this for the computation of a scaling factor in `components/mm-cell.vue`
 * is the reason that this is in its own file instead of being hardcoded in `constants/backgroundmap-bounds.ts`.)
 */
export default 1000;
