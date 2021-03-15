const logger = require('../logger')

const NO_ERRORS = null

function getPeopleValidationError({ first_name }) {
  if (!first_name)
  {
    logger.error(`Invalid title '${first_name}' supplied`)
    return {
      error: {
        message: `'First name' is required`
      }
    }
  }

  return NO_ERRORS
}

module.exports = getPeopleValidationError