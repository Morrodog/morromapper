import Document from '/src/types/document.ts'
import CellXY   from '/src/types/cell-x-y.ts'

/**
 * A `Release` represents a public release of Tamriel Rebuilt.
 *
 * Its effect is to force a given set of cells to the `RELEASED` cell status from whatever status they had before.
 * Although the status of every cell immediately before release would ideally be `COMPLETED`, if this is not the
 * case, then this will be represented accurately.
 */
interface Release extends Document {
  type: "RELEASE";
  releasedCells: CellXY[];
  /**
   * Identifier of the team or individual responsible for the release.
   * Mostly used to distinguish Bethesda releases from everyone else's.
   * For now, one of "BETHESDA" and "TR", but in the future this may be
   * an ID for a document or something, so this isn't made an enum.
   */
  creator: string;
  /**
   * Displayed to the user
   */
  name: string
  /**
   * Used to create a link so that the user can see more information about the release.
   */
  url: string
  /**
   * ISO 8601 representation of the date/time GMT when work formally started on the release.
   */
  startDate: string;
  /**
   * ISO 8601 representation of the date/time GMT when the release was formally completed.
   * A falsey value indicates that the release remains unfinished.
   */
  releaseDate?: string;
}

export default Release;
