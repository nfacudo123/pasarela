const cw = require("crypto-wallets")

const wallet = cw.generateWallet("BTC")
console.log('Nueva billetera BTC generada:');
console.log('Dirección:', wallet.address);
console.log('Clave privada:', wallet.privateKey);