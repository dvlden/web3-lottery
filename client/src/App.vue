<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen text-gray-100 bg-gray-800 p-4"
  >
    <div
      v-if="chain"
      class="fixed top-5 right-5 bg-gray-500 bg-opacity-50 shadow px-4 py-2 text-xs text-white font-semibold rounded"
    >
      Deployed on: {{ chain.deployed }}

      <div class="absolute -top-0.5 -right-0.5 w-2 h-2">
        <span
          class="animate-ping absolute inset-0 inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75"
        />
        <span
          class="absolute inset-0 inline-flex w-full h-full rounded-full bg-emerald-500"
        />
      </div>
    </div>

    <div
      class="max-w-md text-center bg-gray-900 py-6 px-8 rounded-lg shadow-xl border-t-4 border-purple-400"
    >
      <div v-if="chain.deployed === chain.current">
        <h1
          class="text-4xl uppercase tracking-widest font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 filter drop-shadow-sm mb-8"
        >
          Lottery
        </h1>

        <p v-show="contract.manager">
          This contract is managed by the address:
          <small class="block text-sm font-medium">{{
            contract.manager
          }}</small>
        </p>

        <hr class="border border-cyan-300 w-10 my-6 mx-auto" />

        <div v-if="!account">
          <p class="mb-4">
            To read more details and to participate, first connect with your
            MetaMask wallet.
          </p>

          <button
            type="button"
            class="bg-purple-400 text-white py-2 px-4 rounded outline-none font-semibold uppercase cursor-pointer"
            @click="handleProviderRequest"
          >
            Connect MetaMask
          </button>
        </div>

        <div v-else>
          <p class="text-lg font-medium">
            There are currently {{ contract.players.length }} participants in
            this contest, competing to win Ξ {{ contract.balance }} Ether.
          </p>

          <h2 class="text-2xl my-4 font-semibold">
            Participate to test your luck?
          </h2>

          <form @submit.prevent="handleFormSubmit">
            <fieldset class="flex">
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="0.1"
                class="bg-gray-900 py-2 px-3 w-full rounded-l border-2 border-r-0 border-cyan-600 outline-none"
                v-model="form.deposit"
              />

              <button
                type="submit"
                class="bg-cyan-400 text-black py-2 px-4 rounded-r outline-none font-semibold uppercase cursor-pointer"
              >
                Confirm
              </button>
            </fieldset>
          </form>
        </div>

        <div v-if="isContractManager" class="mt-6">
          <h3 class="text-xl font-semibold">Manager Control</h3>
          <p class="text-sm mb-5">
            If you're the manager, you can initiate the action below, otherwise
            it will fail.
          </p>

          <button
            type="button"
            class="bg-red-500 text-white py-2 px-4 rounded outline-none font-semibold uppercase cursor-pointer"
            @click="handleEndRound"
          >
            End This Round
          </button>
        </div>

        <div
          class="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 mt-8"
        >
          Powered by Solidity + Vue 3
        </div>
      </div>

      <div v-else>
        Please switch from {{ chain.current }} to {{ chain.deployed }} to
        interact with this contract.
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { it } from 'await-it'
import { reactive, ref } from '@vue/reactivity'
import { useToast } from 'vue-toastification'
import { web3, artifact } from './artifact'
import { onMounted, computed } from 'vue'

const toast = useToast()
const account = ref<string>()
const chain = reactive<{
  current?: string
  deployed?: string
}>({})
const contract = reactive<{
  manager?: string
  players: string[]
  balance: string
}>({
  manager: undefined,
  players: [],
  balance: '0'
})
const form = reactive({
  deposit: 0.01
})

const isContractManager = computed(() => {
  return (
    contract.manager !== undefined &&
    account.value !== undefined &&
    contract.manager === account.value
  )
})

const handleProviderRequest = async () => {
  if (typeof window.ethereum === 'undefined' || !window.ethereum.isMetaMask) {
    return toast.warning('MetaMask is not installed in this browser.')
  }

  const [accounts, err] = await it<string[]>(
    window.ethereum.request({
      method: 'eth_requestAccounts'
    })
  )

  if (err) {
    return toast.error('Connection to MetaMask has been rejected.')
  }

  if (accounts) {
    account.value = accounts[0]
  }
}

const handleEndRound = async () => {
  const pendingToast = toast.warning('Waiting on transaction...', {
    timeout: 20e3
  })

  const [, err] = await it(
    artifact.methods.pickWinner().send({
      from: account.value
    })
  )

  toast.dismiss(pendingToast)

  if (err) {
    toast.error('Transaction has been reverted.')
  } else {
    updateContractResults()
    toast.success('Transaction has been processed.')
  }
}

const handleFormSubmit = async () => {
  const pendingToast = toast.warning('Waiting on transaction...', {
    timeout: 20e3
  })

  const [, err] = await it(
    artifact.methods.enter().send({
      from: account.value,
      value: web3.utils.toWei(form.deposit.toString(), 'ether')
    })
  )

  toast.dismiss(pendingToast)

  if (err) {
    toast.error('Transaction has been reverted.')
  } else {
    updateContractResults()
    toast.success('Transaction has been processed.')
  }
}

const updateContractResults = async () => {
  // Set contract players
  contract.players = await artifact.methods.getPlayers().call()

  // Set contract balance
  contract.balance = web3.utils.fromWei(
    await web3.eth.getBalance(artifact.options.address),
    'ether'
  )
}

onMounted(async () => {
  if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
    window.ethereum
      .on('accountsChanged', (accounts: string[]) => {
        account.value = web3.utils.toChecksumAddress(accounts[0])
      })
      // No need to destroy events, fully reload page.
      // Suggested in the official MetaMask docs.
      .on('chainChanged', () => window.location.reload())
  }

  // Get Chain ID
  const networks: Record<number, string> = {
    0: 'Unknown',
    1: 'Ethereum Main Network',
    3: 'Ropsten Test Network',
    4: 'Rinkeby Test Network',
    5: 'Goerli Test Network',
    42: 'Kovan Test Network',
    56: 'Binance Smart Chain',
    1337: 'Ganache'
  }

  // Set supported Chain to Rinkeby
  chain.deployed = networks[4]

  // Fetch current Chain ID
  const [chainId] = await it(web3.eth.getChainId())

  if (chainId) {
    chain.current = networks[chainId]

    if (chain.current !== chain.deployed) {
      return
    }
  }

  // Set currently connected MetaMask account
  const _accounts = await web3.eth.getAccounts()
  account.value = _accounts[0]

  // Set contract manager
  const [manager] = await it<string>(artifact.methods.manager().call())

  if (manager) {
    contract.manager = web3.utils.toChecksumAddress(manager)
  }

  updateContractResults()
})
</script>
