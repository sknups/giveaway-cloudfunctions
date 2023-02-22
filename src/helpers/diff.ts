export type PartialDiff<T> = {
    /**
     * Determines if the are any differences.
     * 
     * If true, then oldValues and newValues will both be empty.
     */
    match: boolean,
  
    /**
     * The original values.
     */
    oldValues: Partial<T>,
  
    /**
     * The new values.
     */
    newValues: Partial<T>,
  }
  
  /**
   * Compares the values in an object with some desired updates.
   * 
   * @param obj the object to be compared
   * @param updates the desired updates to the object
   * @returns the differences between the entries in updates and the current values in obj
   */
  export function diffPartial<T>(obj: T, updates: Partial<T>): PartialDiff<T> {
    let match = true;
    const oldValues: Partial<T> = {};
    const newValues: Partial<T> = {};
  
    for (const [key, newVal] of Object.entries(updates)) {
      const oldVal = obj[key];
      if (newVal !== oldVal) {
        match = false;
        oldValues[key] = oldVal;
        newValues[key] = newVal;
      }
    }
  
    return { match, oldValues, newValues };
  }