/**
 * Used primarily in the database to select only documents of a specific type.
 *
 * This is named `MapChangeType` instead of `DocumentType` only because `DocumentType` is a native constructor.
 * This name is an unsatisfactory workaround, but no better name has been devised.
 */
enum MapChangeType {
  /**
   * The document of this type contains a `MapSnapshot` for a given time.
   */
  MAP_SNAPSHOT = "MAP_SNAPSHOT",
  /**
   * Documents of this type represent public releases of province mods. 
   *
   * `Release`s contain a list of cells, and all of these cells have their `CellStatus` changed to
   * `RELEASED` irrespective of prior `CellStatus`.
   */
  RELEASE = "RELEASE",
  /**
   * Documents of this type represent public releases of province mods. 
   *
   * `Release`s contain a list of cells, and all of these cells have their `CellStatus` changed to
   * `RELEASED` irrespective of prior `CellStatus`.
   */
  CLAIM = "CLAIM",
  /**
   * Documents of this type represent decisions by province mods to start work on a re-release of an area.
   *
   * `Release`s contain a list of cells, and all of these cells are changed to be `BLANK`.
   */
  REDO = "REDO",
  /**
   * Documents of this type represent releases by Bethesda.
   *
   * This changes the `CellStatus` of the listed cells to `VANILLA`.
   *
   * A few examples:
   * 1. Vvardenfell   (the release of TESIII)
   * 2. Solstheim     (the release of Bloodmoon)
   * 3. Fort Firemoth (the release of official mod)
   */
  BETHESDA_RELEASE = "BETHESDA_RELEASE",
}

export default MapChangeType
