const { resolve } = require('path')
import { initialise } from '../initialiser'

describe('initialiser', () => {
  it('initialises without errors', async () => {
    await initialise()
  })

  it('initialises with a custom fileLocation without errors', async () => {
    await initialise(resolve('../../../dcgp.wasm'))
  })
})
