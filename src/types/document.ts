import MapChangeType from '/src/types/map-change-type.ts'

// TODO: Add a field for date representing the time when the document was saved to the DB.

/**
 * Generically represents a document from the databse
 */
interface Document {
  /**
   * The identifier of the document. Will typically be a string.
   */
  id: string;
  /**
   * The type of the document.
   */
  type: MapChangeType;
}
