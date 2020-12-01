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

/**
 * 定义响应式
 * @param {*} obj 对象
 * @param {*} key 键值
 * @param {*} val 属性值
 */
function defineReactive(obj, key, val) {

  // 若属性值为对象，则递归值进行响应式操作
  observe(val)

  // 传建一个Dep和当前的key一一对应
  const dep = new Dep()

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      console.log('get ' + val)
      // 依赖收集在这里
      Dep.target && dep.addDep(Dep.target)
      return val
    },
    set(newVal) {
      if (newVal !== val) {
        val = newVal
        observe(val)
        console.log('set ' + val)
        // 通知更新
        // watchers.forEach(w => w.update())
        dep.notify()
      }
    }
  })
}

/**
 * 
 * @param {*} obj 对象
 * @param {*} sourceKey 数据属性key
 */
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

/**
 * 在声明后，额外添加响应式属性
 * @param {*} obj 
 * @param {*} key 
 * @param {*} val 
 */
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
class Watcher{
  constructor(vm, key, updateFn) {
    this.vm = vm
    this.key = key
    this.updateFn = updateFn

    Dep.target = this
    this.vm[key] // 读取触发了getter
    Dep.target = null // 收集完就置空
  }

  update() {
    this.updateFn.call(this.vm, this.vm[this.key])
  }
}

// Dep: 依赖管理某个key相关的所有watcher实例
class Dep {
  constructor() {
    this.deps = []
  }

  addDep(dep) {
    this.deps.push(dep)
  }

  notify() {
    this.deps.forEach(dep => dep.update())
  }
}

