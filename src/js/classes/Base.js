import { getInstance } from '../initialiser'

class Base {
  _isDestroyed = false

  get isDestroyed() {
    return this._isDestroyed
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
    this._isDestroyed = true
  }

  _throwIfDestroyed() {
    if (this._isDestroyed) {
      throw new Error(`${this.constructor.name} has been destroyed.`)
    }
  }
}

export default Base
