# A contract for simple Lottery

Deployed on Rinkeby Testnet through Infura. The contract is written using older Solidity compiler – version `^0.4.17`. _(Because I'm learning from ancient resources... Rewriting it for latest compiler compatibility, should be fairly simple.)_

### Prerequisite

If you want to deploy this on a different network or the same one, but use your own wallet for ownership, make sure to follow the steps below.

- rename `.env.example` file to `.env` and make sure to fill-in required variables [protip: `mv .env.example .env`]
- register on [Infura](https://infura.io/register) and create new project
- change endpoints dropdown from **mainnet** to whichever testnet you desire
- copy the **https** endpoint and place it as a value of `WALLET_ENDPOINT` in `.env`
- install [MetaMask](https://metamask.io/) and follow their instructions to create a wallet
  - while in this process, copy mnemonic words _(secret phrase)_ and place it as a value of `WALLET_MNEMONIC` in `.env`
- finally, run `npm i` to install some dependencies

### Scripts

- `npm run test` – to run test coverage
- `npm run deploy` – to run deploy script

By deploying the contract, you'll get two outputs in the terminal. You'll need both of these outputs for the client-side application, that's written with Vue 3. _(Not a fan of React, sorry...)_

This is a necessity, because I'm not using Truffle or an alternative, but instead for learning purposes, a manual deployment script.
