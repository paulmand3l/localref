const { aliasDangerous } = require('react-app-rewire-alias/lib/aliasDangerous')

const aliasMap = {
  example: './src',
  '@library': '../../src',
}

module.exports = aliasDangerous(aliasMap)
