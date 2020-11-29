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