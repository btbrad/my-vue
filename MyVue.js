class MyVue{
  constructor(options) {
    this.$options = options
    this.$data = options.data
    observe(this.$data)
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
      }
    }
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