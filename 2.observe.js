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
        console.log('set' + val)
      }
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

let obj = { 
  a: 1,
  b: 2,
  c: {
    foo: 9
  },
  d: 8
}

observe(obj)

obj.a = 1111
obj.b = 2222
obj.c.foo = 100000
obj.d = { bar: 99999 }
obj.d.bar = 8888888