/*
 * Given an array of vnodes, returns an `HTMLElement` for a `div` that contains
 * the vnodes rendered.
 */
import { defineComponent, createApp, h } from 'vue'
import { mount } from 'mount-vue-component'

/*
 * Component used for rendering arrays of vnodes.
 * Accepts the array of vnodes as a prop, and returns them 
 * inside of a `div` from its render function.
 */
const nodeRenderingComponent = defineComponent({
  props: {
    vnodes: {
      type: Array,
      required: true
    }
  },
  render() {
      return h('div', this.vnodes);
  }
});

export default (vnodes) => {
  return mount(nodeRenderingComponent, {
    props: {
      vnodes
    }
  }).el;
}
