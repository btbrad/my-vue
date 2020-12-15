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
    // node.textContent = this.$vm[RegExp.$1]
    this.update(node, RegExp.$1, 'text')
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
      // 处理事件
      if (this.isEvent(attrName)) {
        const dir = attrName.substring(1)
        this.eventHandler(node, dir, exp)
      }
    })
  }

  isEvent(name) {
    return name.startsWith('@')
  }

  eventHandler(node, eventName, exp) {
    const fn = this.$vm.$options.methods[exp]
    node.addEventListener(eventName, fn.bind(this))
  }

  isDirective(name) {
    return name.indexOf('my') === 0
  }

  update(node, exp, dir) {
    // 初始化
    // 指令对应的跟新函数xxUpdater
    const fn = this[dir + 'Updater']
    fn && fn(node, this.$vm[exp])

    // 更新处理, 封装一个更新函数，可以更新对应dom元素
    new Watcher(this.$vm, exp, function(val) {
      fn && fn(node, val)
    })

  }

  textUpdater(node, value) {
    node.textContent = value
  }

  text(node, exp) {
    this.update(node, this.$vm[exp], 'text')
  }

  html(node, exp) {
    this.update(node, this.$vm[exp], 'text')
  }
  htmlUpdater(node, value) {
    node.innerHTML = value
  }
}
