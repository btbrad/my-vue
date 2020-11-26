class MyVue{
  constructor(options) {
    this.$options = options
    this.$data = options.data

    // 数据响应式
    observe(this.$data)
    // 代理
    proxy(this, '$data')
    // 编译模板
    new Compile(this.$options.el, this)
  }
}

function defineReactive(obj, key, val) {

  observe(val)

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      console.log('get ' + val)
      return val
    },
    set(newVal) {
      if (newVal !== val) {
        val = newVal
        observe(val)
        console.log('set ' + val)

        watchers.forEach(w => w.update())
      }
    }
  })
}

// 数据代理
function proxy(obj, sourceKey) {
  Object.keys(obj[sourceKey]).forEach(key => {
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        return obj[sourceKey][key]
      },
      set(newVal) {
        obj[sourceKey][key] = newVal
      }
    })
  })
}

function observe(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return
  }
  // 创建Observer实例
  new Observer(obj)
}

function set(obj, key, val) {
  defineReactive(obj, key, val)
}

// 根据对象的类型决定如何做响应化
class Observer {
  constructor(value) {
    this.value

    // 判断其类型
    if (typeof value === 'object') {
      this.walk(value)
    }

  }

  // 对象数据响应化
  walk(obj) {
    Object.keys(obj).forEach(key => {
      defineReactive(obj, key, obj[key])
    })
  }

  // 数组数据响应化
}

// 观察者: 保存更新函数， 值发生变化调用更新函数
const watchers = []
class Watcher{
  constructor(vm, key, updateFn) {
    this.vm = vm
    this.key = key
    this.updateFn = updateFn
    watchers.push(this)
  }

  update() {
    this.updateFn.call(this.vm, this.vm[this.key])
  }
}