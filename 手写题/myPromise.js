const IS_ERROR = {}
let LAST_ERROR = null

function tryCallOne(fn, a) {
  try {
    fn(a)
  } catch (e) {
    LAST_ERROR = e
    return IS_ERROR
  }
}

function tryCallTwo(fn, a, b) {
  try {
    fn(a, b)
  } catch (e) {
    LAST_ERROR = e
    return IS_ERROR
  }
}

function CPromise(fn) {
  this._state = 0
  this._value = null
  this._deferreds = null
  this._deferState = 0

  doResolve(fn, this)
}

CPromise._noop = () => {}

function resolveCPromiseWithValue(value) {
  const promise = new CPromise(CPromise._noop)
  promise._state = 1
  promise._value = value
  return promise
}

const TRUE = resolveCPromiseWithValue(true)
const FALSE = resolveCPromiseWithValue(false)
const UNDEFINED = resolveCPromiseWithValue(undefined)
const NULL = resolveCPromiseWithValue(null)
const EMPTYSTRING = resolveCPromiseWithValue('')
const ZERO = resolveCPromiseWithValue(0)

CPromise.resolve = function (value) {
  if (value === true) return TRUE
  if (value === false) return FALSE
  if (value === undefined) return UNDEFINED
  if (value === null) return NULL
  if (value === '') return EMPTYSTRING
  if (value === 0) return ZERO

  if (value instanceof CPromise) return value
  return resolveCPromiseWithValue(value)
}

CPromise.reject = function (reason) {
  const promise = new CPromise(CPromise._noop)
  promise._state = 2
  promise._value = reason
  return reason
}

CPromise.race = function (values) {
  return new CPromise((resolve, reject) => {
    Array.from(values).forEach(resolve, reject)
  })
}

CPromise.all = function (values) {
  return new CPromise((resolve, reject) => {
    let len = values.length
    let count = 0
    let res = []

    Array.from(values).forEach((value, index) => {
      CPromise.resolve(value).then(
        (val) => {
          count++
          res[index] = val

          if (count === len) {
            resolve(res)
          }
        },
        (reason) => {
          reject(reason)
        }
      )
    })
  })
}

CPromise.prototype.then = function (onFulfilled, onRejected) {
  const deferredPromise = new CPromise(CPromise._noop)

  handle(this, new Handler(deferredPromise, onFulfilled, onRejected))

  return deferredPromise
}

CPromise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected)
}

CPromise.prototype.finally = function (fn) {
  const onFulfilled = function (value) {
    return CPromise.resolve(fn()).then(() => {
      return value
    })
  }

  const onRejected = function (reason) {
    return CPromise.resolve(fn()).then(() => {
      throw reason
    })
  }

  return this.then(onFulfilled, onRejected)
}

function doResolve(fn, promise) {
  let done = false
  let a = function (value) {
    if (done) return
    done = true
    resolve(value, promise)
  }

  let b = function (reason, promise) {
    if (done) return
    done = true
    reject(reason, promise)
  }

  let res = tryCallTwo(fn, a, b)
  if (res == IS_ERROR && done === false) {
    reject(LAST_ERROR, promise)
  }
}

function resolve(value, promise) {
  if (value == promise) {
    throw new Error('can not resolve self')
  }
  if (
    typeof value === 'object' ||
    (typeof value === 'function' && value !== null)
  ) {
    if (value instanceof CPromise) {
      promise._state = 3
      promise._value = value

      finale(promise)
    }
  }

  promise._state = 1
  pormise._value = value
  finale(promise)
}

function reject(reason, promise) {
  promise._state = 2
  promise._value = reason

  finale(promise)
}

function finale(promise) {
  if (promise._deferState === 1) {
    handle(promise, promise._deferreds)
  } else if (promise._deferState === 2) {
    for (let i = 0; i < promise._deferreds.length; i++) {
      handle(promise, promise._deferreds[i])
    }
  }
}

function handle(promise, deferred) {
  while (promise._state === 3) {
    promise = promise._value
  }

  if (promise._state === 0) {
    if (promise._deferState === 0) {
      promise._deferreds = deferred
      promise._deferState = 1
      return
    } else if (promise._deferState === 1) {
      promise._deferreds = [promise._deferreds, deferred]
      return
    }
    promise._deferreds.push(deferred)
    return
  }

  invokeHandler(promise, deferred)
}

function invokeHandler(promise, deferred) {
  const task = function () {
    let callback =
      promise._state === 1 ? deferred.onFulfilled : deferred.onRejected

    if (callback === null) {
      if (promise._state === 1) {
        resolve(promise._value, deferred.promise)
      } else {
        reject(promise._value, deferred.promise)
      }
      return
    }

    let res = tryCallOne(callback, promise._value)
    if (res == IS_ERROR) {
      reject(LAST_ERROR, deferred.promise)
    } else {
      resolve(res, deferred.promise)
    }
  }
  setTimeout(task, 0)
}

function Handler(deferredPromise, onFulfilled, onRejected) {
  this.promise = deferredPromise
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null
  this.onRejected = typeof onRejected === 'function' ? onRejected : null
}
