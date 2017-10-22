///<reference path="./extensions.d.ts"/>

// https://gist.github.com/insin/9299529
function intersperse(array, something) {
  if (array.length < 2) return array
  const result = []
  let i = 0, l = array.length
  if (typeof something == 'function') {
    for (; i < l; i ++) {
      const e = array[i]
      if (i !== 0) { result.push(something(e, i)) }
      result.push(array[i])
    }
  }
  else {
    for (; i < l; i ++) {
      if (i !== 0) { result.push(something) }
      result.push(array[i])
    }
  }
  return result
}
Array.prototype.intersperse = function(data) { return intersperse(this, data) }
