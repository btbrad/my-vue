class MyVue {
  constructor(options) {
    this.$options = options
    this.$data = options.data

    observe(this.$data)

    proxy(this, '$data')

    new Compile(this, this.$options.el)
  }
}

function defineReactive(obj, key, val) {

  observe(val) // 如果属性值为对象，则进行递归遍历

  const dep = new Dep()

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      console.log('get '+ key + ' '+ val)
      Dep.target && dep.addDep(Dep.target)
      return val
    },
    set(newVal) {
      if (newVal === val) {
        return
      }
      val = newVal

      observe(val) // 若赋值为对象，则进行递归遍历进行响应式操作

      console.log('set '+ key + ' '+ val)
      console.log(dep)
      dep.notify()
    }
  })
}

function observe(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return
  }
  Object.keys(obj).forEach(key => {
    defineReactive(obj, key, obj[key])
  })
}

function set(obj, key, val) {
  defineReactive(obj, key, val)
}

function proxy(vm, sourceKey) {
  Object.keys(vm[sourceKey]).forEach(key => {
    Object.defineProperty(vm, key, {
      enumerable: true,
      configurable: true,
      get() {
        return vm[sourceKey][key]
      },
      set(newVal) {
        vm[sourceKey][key] = newVal
      }
    })
  })
}

class Watcher {
  constructor(vm, key, updateFn) {
    this.vm = vm
    this.key = key
    this.updateFn = updateFn

    Dep.target = this
    this.vm[this.key]
    Dep.target = null
  }

  update() {
    this.updateFn.call(this.vm, this.vm[this.key])
  }
}

class Dep {
  constructor() {
    this.deps = []
  }
  addDep(dep) {
    this.deps.push(dep)
  }
  notify() {
    this.deps.forEach(w => w.update())
  }
}