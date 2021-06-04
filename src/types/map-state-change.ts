interface MapStateChange {
  /**
   * A UUID serving as a key for the change.
   */
  id: string;
  /**
   * The date of the change.
   *
   * Used to determine the order of changes, and to determine which changes have happened at a given point in time.
   */
  changeDate: string;
}

export default MapStateChange;
