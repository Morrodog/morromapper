/**
 * Provides a clean(ish) interface to add instance-scoped non-reactive properties
 * to a component without dirtying `this.$options`.
 *
 * Designed to function as a section of a Vue properties object. Used like so:
 * mixins: [unreactive({
 *   unreactiveProp1: 1,
 *   unreactiveProp2: "asdf"
 * })]
 *
 * Then `this.unreactiveProp1` and `this.unreactiveProp2` will be available on the instance.
 */
export default function(unreactiveProperties) {
  return {
    computed: Object.fromEntries(Object.entries(unreactiveProperties).map((entry) => {
      return [entry[0], function() {
        return unreactiveProperties[entry[0]];
      }];
    }))
  }
}
