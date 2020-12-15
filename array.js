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
  arrayProto[methods] = function () {
    originalProto[method].apply(this, arguments)
    console.log('数组执行' + method + '操作')
  }
})