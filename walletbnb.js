const Web3 = require('web3');

// Conecta a la red Binance Smart Chain (mainnet)
const web3 = new Web3('https://bsc-dataseed.binance.org/');

// Genera una nueva billetera BNB
const newWallet = web3.eth.accounts.create();
console.log('Nueva billetera BNB generada:');
console.log('Dirección:', newWallet.address);
console.log('Clave privada:', newWallet.privateKey);