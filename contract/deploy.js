const WalletProvider = require('@truffle/hdwallet-provider')
const Web3 = require('web3')
const { interface, bytecode } = require('./compile')

require('dotenv').config()

const provider = new WalletProvider(
  process.env.WALLET_MNEMONIC,
  process.env.WALLET_ENDPOINT
)

const web3 = new Web3(provider)

const deploy = async () => {
  const accounts = await web3.eth.getAccounts()

  const result = await new web3.eth.Contract(JSON.parse(interface)) // tell web3 what our contract looks like (ABI)
    .deploy({ data: bytecode }) // tell web3 that we want to deploy a new copy of this contract
    .send({ from: accounts[0], gas: '1000000' }) // tell web3 to send out a transaction to creates this contract

  console.log('CONTRACT ADDRESS TO COPY:')
  console.log(result.options.address)
  console.log('–––')
  console.log('INTERFACE TO COPY:')
  console.log(interface)

  provider.engine.stop()
  // return result.options.address
}

deploy()
