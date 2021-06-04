/**
 * Used primarily in the database to select only documents of a specific type.
 */
enum DocumentType {
  /**
   * The document of this type an array of `Cell` objects.
   *
   * Intended to contain all of the information necessary to display the map without clicking on any cells.
   *
   * There is only meant to be one `"MAP_HISTORY"` document in the database at one time, as it's essentially a
   * cache for how `Claim`s, `Release`s, and `Redo`s should be presented to the user.
   */
  MAP_HISTORY = "MAP_HISTORY",
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
