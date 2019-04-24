import { getInstance } from '../initialiser'

class Base {
  constructor() {
    this.isDestroyed = false
  }

  _stackSave(...args) {
    const {
      exports: { stackSave },
    } = getInstance()

    return stackSave(...args)
  }

  _stackAlloc(...args) {
    const {
      exports: { stackAlloc },
    } = getInstance()

    return stackAlloc(...args)
  }

  _stackRestore(...args) {
    const {
      exports: { stackRestore },
    } = getInstance()

    return stackRestore(...args)
  }

  destroy() {
    this.isDestroyed = true
  }

  _throwIfDestroyed() {
    if (this.isDestroyed) {
      throw new Error(`${this.constructor.name} has been destroyed.`)
    }
  }
}

export default Base
