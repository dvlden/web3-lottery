const path = require('path')
const fs = require('fs')
const solc = require('solc')

const contractPath = path.resolve(__dirname, 'contracts', 'Lottery.sol')

const contractSource = fs.readFileSync(contractPath, 'utf8')

module.exports = solc.compile(contractSource, 1).contracts[':Lottery']
