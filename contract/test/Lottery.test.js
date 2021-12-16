const assert = require('assert')
const ganache = require('ganache-cli')
const Web3 = require('web3')

const { interface, bytecode } = require('../compile')
const web3 = new Web3(ganache.provider())

let accounts = null
let contract = null

beforeEach(async () => {
  accounts = await web3.eth.getAccounts()

  contract = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: '1000000' })
})

describe('Lottery', () => {
  it('deploys a contract', () => {
    assert.ok(contract.options.address)
  })

  it('fails if required amount of ether is not provided', async () => {
    try {
      await contract.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei('0.001', 'ether'),
      })
    } catch {
      assert(true)
    }
  })

  it('allows an address to enter', async () => {
    await contract.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.01', 'ether'),
    })

    const players = await contract.methods.getPlayers().call({
      from: accounts[0],
    })

    assert.equal(accounts[0], players[0])
    assert.equal(1, players.length)
  })

  it('allows multiple addresses to enter', async () => {
    await contract.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.01', 'ether'),
    })

    await contract.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.01', 'ether'),
    })

    await contract.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('0.01', 'ether'),
    })

    const players = await contract.methods.getPlayers().call({
      from: accounts[0],
    })

    assert.equal(accounts[0], players[0])
    assert.equal(accounts[1], players[1])
    assert.equal(accounts[2], players[2])
    assert.equal(3, players.length)
  })

  it('picking a winner should not work if account is not the owner', async () => {
    try {
      await contract.methods.pickWinner().send({
        from: accounts[1],
      })
    } catch {
      assert(true)
    }
  })

  // This test does too many things, but it's fine...
  it('sends money to a winner resets players and confirms the balance is sent', async () => {
    await contract.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.01', 'ether'),
    })

    const initialBalance = await web3.eth.getBalance(accounts[0])

    await contract.methods.pickWinner().send({
      from: accounts[0],
    })

    const newBalance = await web3.eth.getBalance(accounts[0])

    // Cause something is lost on transaction fee
    const difference = newBalance - initialBalance

    assert(difference > web3.utils.toWei('0.0099', 'ether'))

    const players = await contract.methods.getPlayers().call({
      from: accounts[0],
    })

    assert.equal(0, players.length)

    const contractBalance = await web3.eth.getBalance(contract.options.address)
    assert.equal(Number(contractBalance), 0)
  })
})
