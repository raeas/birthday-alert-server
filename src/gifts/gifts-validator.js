const logger = require('../logger')

const NO_ERRORS = null

function getGiftsValidationError({ gift_name }) {
  if (!gift_name)
  {
    logger.error(`Invalid title '${gift_name}' supplied`)
    return {
      error: {
        message: `'Gift name' is required`
      }
    }
  }

  return NO_ERRORS
}

module.exports = getGiftsValidationError