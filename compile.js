class Compile {
  
  constructor(el, vm) {
    this.$el = document.querySelector(el)
    this.$vm = vm
    this.compile(this.$el)
  }

  compile(el) {
    const childNodes = el.childNodes
    console.log(el)
    Array.from(childNodes).forEach(node => {
      if (this.isElement(node)) {
        console.log('编译元素节点', node)
        this.compileElement(node)
      } else if (this.isInter(node)) {
        console.log('编译文本节点', node.textContent)
        this.compileText(node)
      }
      if (node.childNodes && node.childNodes.length) {
        this.compile(node)
      }
    })
  }

  isElement(node) {
    return node.nodeType === 1
  }
  isInter(node) {
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
  }

  compileText(node) {
    console.log(RegExp.$1)
    node.textContent = this.$vm[RegExp.$1]
  }

  compileElement(node) {
    const nodeAttrs = node.attributes
    Array.from(nodeAttrs).forEach(attr => {
      const attrName = attr.name
      const exp = attr.value
      if (this.isDirective(attrName)) {
        const dir = attrName.substring(3)
        this[dir] && this[dir](node, exp)
      }
    })
  }

  isDirective(name) {
    return name.indexOf('my') === 0
  }

  text(node, exp) {
    node.textContent = this.$vm[exp]
  }
}