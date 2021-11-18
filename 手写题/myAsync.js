function* myGenerator(...args) {
  let a = yield Promise.resolve('resolved request')
  console.log(a)
  console.log(args)

  return 'function is end'
}

function createAsyncFunction(myGenerator) {
  return function (...args) {
    let g = myGenerator(...args)
    return new Promise((resolve, reject) => {
      go('next')
      function go(key, arg) {
        let res
        try {
          res = g[key](arg)
        } catch (e) {
          reject(value)
          return
        }

        const { value, done } = res
        if (done) {
          resolve(value)
          return
        } else {
        }

        Promise.resolve(value).then(
          (value) => {
            go('next', value)
          },
          (reason) => {
            go('throw', reason)
          }
        )
      }
    })
  }
}
