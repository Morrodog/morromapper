/**
 * When presenting cells to the user, an image is shown behind them. This image is the "backgroundmap" (one word).
 * This metadata enables logic elsewhere to precisely locate cells in backgroundmap pixel space.
 *
 * Accordingly, wherever a description states that it's "in pixels", this means that it's in pixels of 
 * `backgroundmap` space, not pixels of the user's screen, and not Leaflet coordinates.
 *
 * Note that this interface is written with an assumption that for any raster backgroundmap that will be used, 
 * the cells will be exactly square, and will be of consistent size. For this reason, it's necessary to be 
 * selective about which images to use for backgroundmaps, since some lower-resolution gridmaps will have 
 * inconsistent border sizes, and with them, inconsistent cell sizes. While it might be possible to use a fractional
 * `cellSideLength` and/or `borderWidth` to account for this, it's much simpler (and better for the user) to find
 * a higher-resolution map instead.
 */
interface RasterBackgroundmapMetadata {
  /**
   * Height of the backgroundmap in pixels.
   */
  heightPixels: number;
  /**
   * Width of the backgroundmap in pixels.
   */
  widthPixels: number;
  /**
   * The Y coordinate of the top pixel row of the top border of the cell at [0,0].
   *
   * Note that the Y coordinate is measured as pixels from the bottom of the image.
   * (Such that the bottom-most row of pixels would be at Y-coordinate 0.)
   */
  originCellTopBorderY: number;
  /**
   * The X coordinate of the leftmost column of the right border of the cell at [0,0].
   *
   * Note that the Y coordinate is measured as pixels from the bottom of the image.
   * (Such that the bottom-most row of pixels would be at Y-coordinate 0.)
   */
  originCellRightBorderX: number;
  /**
   * The thickness of the borders between cells in pixels.
   */
  borderWidth: number;
  /**
   * The length of the side of a cell in pixels.
   * Note that this length does not include borders.
   */
  cellSideLength: number;
  /**
   * Defines the area of the image in which the cell grid is shown.
   *
   * This is used primarily for cell picking logic, which needs to know which
   * region of the image contains candidates for selection.
   *
   * The bounds are structured like so:
   * ```
   * [
   *   [topY,    leftX]
   *   [bottomY, rightX]
   * ]
   * ```
   * Coordinates are in image pixel space, and the bounds include the borders of the cells at the edges of the bounded rectangle.
   * (So, for example, the topY is the topmost row of pixels in the top border of the top row of cells in the rectangle.)
   */
  gridBounds: Array[]
}

export default RasterBackgroundmapMetadata
