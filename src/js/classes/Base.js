import { getInstance } from '../initialiser'

class Base {
  constructor() {
    this.destroyed = false
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
    this.destroyed = true
  }

  _throwIfDestroyed() {
    if (this.destroyed) {
      throw new Error('Kernel has been destroyed.')
    }
  }
}

export default Base
