import { defineComponent, createApp, h } from 'vue'
import { mount } from 'mount-vue-component'


var nodeRenderingComponent = defineComponent({
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
