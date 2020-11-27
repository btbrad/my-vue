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
