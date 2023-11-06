const { generateAccount } = require('tron-create-address')

const newWallet = generateAccount();
console.log('Nueva billetera TRX generada:');
console.log('Dirección:', newWallet.address);
console.log('Clave privada:', newWallet.privateKey);