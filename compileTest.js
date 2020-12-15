class Compile{
  constructor(vm, el) {
    this.$vm = vm
    this.$el = document.querySelector(el)

    this.compile(this.$el)
  }

  compile(el) {
    const childNodes = el.childNodes
    console.log('所有节点', childNodes)
    Array.from(childNodes).forEach(node => {
      if (node.nodeType === 1) {
        console.log('元素节点', node)
        this.compileElement(node)
      } else if (node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)) {
        console.log('文本节点', node)
        this.compileText(node)
      }
      if (node.childNodes && node.childNodes.length) {
        this.compile(node)
      }
    })
  }

  compileText(node) {
    // node.textContent = this.$vm[RegExp.$1.trim()]
    this.update(node, RegExp.$1.trim(), 'text')
  }

  compileElement(node) {
    const nodeAttrs = node.attributes
    Array.from(nodeAttrs).forEach(attr => {
      console.log(attr)
      const attrName = attr.name
      const exp = attr.value
      if (this.isDirective(attrName)) {
        const dir = attrName.substring(3)
        this[dir] && this[dir](node, exp)
      }
    })
  }
  isDirective(name) {
    return name.indexOf('my-') === 0
  }

  text(node, exp) {
    // node.textContent = exp
    this.update(node, exp, 'text')
  }

  html(node, exp) {
    // node.innerHTML = this.$vm[exp]
    this.update(node, exp, 'html')
  }

  update(node, exp, dir) {
    const fn = this[dir+'Updater']
    fn && fn(node, this.$vm[exp])
    new Watcher(this.$vm, exp, function(val) {
      fn && fn(node, val)
    })
  }

  textUpdater(node, val) {
    node.textContent = val
  }
  
  htmlUpdater(node, val) {
    node.innerHTML = val
  }
}
