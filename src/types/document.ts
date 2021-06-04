import DocumentType from '/src/types/document-type.ts'

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
  type: DocumentType;
}
