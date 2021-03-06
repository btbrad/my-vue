# my-vue
> 手动实现vue

> Vue的三大特性： 数据响应式，模板引擎，虚拟DOM（VirtualDOM）

### 数据响应式
> 数据的变更能够在视图中响应。vue2.0中通过Object.defineProperty来实现。

```js
function defineReactive(obj, key, val) {
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      console.log('get '+ key + ' '+ val)
      return val
    },
    set(newVal) {
      if (newVal === val) {
        return
      }
      val = newVal
      console.log('set '+ key + ' '+ val)
    }
  })
}

const obj = { }

defineReactive(obj, 'a', 1)

obj.a
obj.a = 2
```
> 若对象中存在多个属性，则对对象属性进行遍历。
```js
function observe(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return
  }
  Object.keys(obj).forEach(key => {
    defineReactive(obj, key, obj[key])
  })
}

const obj = { 
  a: 1,
  b: 2
}

observe(obj)

obj.a
obj.b
obj.a = 3
obj.b = 4
```
> 如果对象的值仍是对象，则需要递归遍历， 进行数据响应式操作。
```js
function defineReactive(obj, key, val) {

  observe(val) // 如果属性值为对象，则进行递归遍历

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      console.log('get '+ key + ' '+ val)
      return val
    },
    set(newVal) {
      if (newVal === val) {
        return
      }
      val = newVal
      console.log('set '+ key + ' '+ val)
    }
  })
}
```
> 如果给一个非属性赋值为对象，则需要在赋值时对值进行遍历做响应式操作。
```js
function defineReactive(obj, key, val) {

  observe(val) // 如果属性值为对象，则进行递归遍历

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      console.log('get '+ key + ' '+ val)
      return val
    },
    set(newVal) {
      if (newVal === val) {
        return
      }
      val = newVal

      observe(val) // 若赋值为对象，则进行递归遍历进行响应式操作

      console.log('set '+ key + ' '+ val)
    }
  })
}
```
> 如果要给响应式操作过得对象，添加属性值，则使用一个set方法
```js
function set(obj, key, val) {
  defineReactive(obj, key, val)
}

const obj = { 
  a: 1,
  b: {
    c: 3
  },
  d: 4
}

observe(obj)

obj.a
obj.b.c
obj.a = 111
obj.b.c = 333
obj.d = {
  foo: 4
}
obj.d.foo = 4004
set(obj, 'e', 5)
// obj.e = 5
obj.e = 6
```
> 封装MyVue类
```js
class MyVue {
  constructor(options) {
    this.$options = options
    this.$data = options.data

    observe(this.$data)
  }
}
```
> 在页面中使用
```html
<div id="app">
  <p>{{counter}}</p>
</div>

<script src="./myVue.js"></script>
<script>

  const vm = new MyVue({
    data: {
      counter: 0
    }
  })  

  setInterval(() => {
    vm.$data.counter++
  }, 1000);

</script>
```
> 为了操作数据方便， 把data中的数据代理到myvue实例上
```js
class MyVue {
  constructor(options) {
    this.$options = options
    this.$data = options.data
    // 数据响应式
    observe(this.$data)
    // 数据代理
    proxy(this, '$data')
  }
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
```

### 编译compile
#### 遍历边界el内所有节点
```js
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
      } else if (node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)) {
        console.log('文本节点', node)
      }
      if (node.childNodes && node.childNodes.length) {
        this.compile(node)
      }
    })
  }
}

class MyVue {
  constructor(options) {
    this.$options = options
    this.$data = options.data

    observe(this.$data)

    proxy(this, '$data')

    new Compile(this, this.$options.el)
  }
}
```
#### 编译文本节点
```js
compile(el) {
  const childNodes = el.childNodes
  console.log('所有节点', childNodes)
  Array.from(childNodes).forEach(node => {
    if (node.nodeType === 1) {
      console.log('元素节点', node)
    } else if (node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)) {
      console.log('文本节点', node)
      this.compileText(node, this.$vm)
    }
    if (node.childNodes && node.childNodes.length) {
      this.compile(node)
    }
  })
}

compileText(node, vm) {
  node.textContent = vm[RegExp.$1.trim()]
}
```
#### 编译指令节点
```js
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
  node.textContent = exp
}

html(node, exp) {
  node.innerHTML = this.$vm[exp]
}

```
### 依赖收集
> 每读取到一个插值文本或指令，则创建一个watcher, 在watcher的构造函数中读取响应key值，触发getter,进行依赖收集；文本和元素的编译都统一使用update方法来初始化和更新
```js
class Watcher {
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

update(node, exp, dir) {
  const fn = this[dir+'Updater']
  fn && fn(node, this.$vm[exp])
  new Watcher(this.$vm, exp, function(val) {
    fn && fn(node, val)
  })
}

compileText(node) {
  // node.textContent = this.$vm[RegExp.$1.trim()]
  this.update(node, RegExp.$1.trim(), 'text')
}

text(node, exp) {
  // node.textContent = exp
  this.update(node, exp, 'text')
}

html(node, exp) {
  // node.innerHTML = this.$vm[exp]
  this.update(node, exp, 'html')
}

textUpdater(node, val) {
  node.textContent = val
}
  
htmlUpdater(node, val) {
  node.innerHTML = val
}
```
> 创建Dep, 集中管理watcher
```js
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
      dep.notify()
    }
  })
}
```

### 数组响应式
- 找到数组原型
- 覆盖那些能够修改数组的更新方法，使其可以通知更新
- 将得到的新的原型设置到数组实例原型上
```js
const originalProto = Array.prototype
const arrayProto = Object.create(originalProto)
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]
methodsToPatch.forEach(method => {
  arrayProto[method] = function () {
    originalProto[method].apply(this, arguments)
    console.log('数组执行' + method + '操作')
  }
})

// 根据对象的类型决定如何做响应化
class Observer {
  constructor(value) {
    this.value

    // 判断其类型
    if (Array.isArray(value)) {
      this.handleArray(value)
    }
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
  handleArray(arr) {
    arr.__proto__ = arrayProto
    const keys = Object.keys(arr)
    for (let i = 0; i < keys.length; i++) {
       new Observer(arr[i])     
    }
  }
}
```

### 处理事件
```js
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
```

### 编译v-model
```js
model(node, exp) {
  this.update(node, exp, 'model')

  node.addEventListener('input', e => {
    this.$vm[exp] = e.target.value
  })
}
modelUpdater(node, value) {
  node.value = value
}
```
