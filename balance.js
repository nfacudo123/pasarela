const express = require('express');
const { Web3 } = require('web3');
const { generateAccount } = require('tron-create-address')
const cw = require("crypto-wallets")
const qr = require('qrcode'); 
const axios = require('axios');
const app = express();
const port = 3000;

// Conecta a la red Binance Smart Chain (mainnet)
const web3 = new Web3('https://bsc-dataseed.binance.org/');

app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/generar-billetera', async (req, res) => {
    // Genera una nueva billetera BNB
    const newWalletBNB = web3.eth.accounts.create();
    const addressBNB = newWalletBNB.address;
    const privateKeyBNB = newWalletBNB.privateKey;
    
    const balanceBNBWei = await web3.eth.getBalance(addressBNB);
    const balanceBNB = web3.utils.fromWei(balanceBNBWei, 'ether');
    // Genera una nueva billetera BTC
    const newWalletBTC = cw.generateWallet("BTC");
    // Genera una nueva billetera TRX
    const newWalletTRX = generateAccount();
    const bitcoinAddress = newWalletBTC.address;
    const blockchainInfoAPI = `https://blockchain.info/q/addressbalance/${bitcoinAddress}`;
    
    


    

    const newWalletETH = cw.generateWallet("ETH");
    const addressETH = newWalletETH.address;
    const balanceETHWei = await web3.eth.getBalance(addressETH);
    const balanceETH = web3.utils.fromWei(balanceETHWei, 'ether');


    axios.get(blockchainInfoAPI)
        .then((response) => {
            const balanceSatoshis = response.data;
            const balanceBTC = balanceSatoshis / 100000000; // Convertir desde Satoshis a BTC
            console.log('Saldo BTC:', balanceBTC, 'BTC');

            // Continuar con la generación de códigos QR y la respuesta
            // ...
        

    // Genera los códigos QR
    qr.toDataURL(addressBNB, (err, qrCodeBNB) => {
        if (err) {
            console.error(err);
            res.send('Error al generar el código QR de BNB');
        } else {
            qr.toDataURL(newWalletTRX.address, (err, qrCodeTRX) => {
                if (err) {
                    console.error(err);
                    res.send('Error al generar el código QR de TRX');
                }else {
                    qr.toDataURL(newWalletETH.address, (err, qrCodeETH) => {
                        if (err) {
                            console.error(err);
                            res.send('Error al generar el código QR de ETH');
                        } else {
                    qr.toDataURL(newWalletBTC.address, (err, qrCodeBTC) => {
                        if (err) {
                            console.error(err);
                            res.send('Error al generar el código QR de BTC');
                        } else {
                            res.send(`Nueva billetera BNB generada:<br>
                                      Dirección: ${addressBNB}<br>
                                      Clave privada: ${privateKeyBNB}<br>
                                      Balance: ${balanceBNB}<br>
                                      <img src="${qrCodeBNB}"><br><br>
                                      Nueva billetera TRX generada:<br>
                                      Dirección: ${newWalletTRX.address}<br>
                                      Clave privada: ${newWalletTRX.privateKey}<br>
                                      <img src="${qrCodeTRX}"><br><br>
                                      Nueva billetera BTC generada:<br>
                                      Dirección: ${newWalletBTC.address}<br>
                                      Clave privada: ${newWalletBTC.privateKey}<br>
                                      Balance: ${balanceBTC}<br>
                                      <img src="${qrCodeBTC}"><br><br>
                                      Nueva billetera ETH generada:<br>
                                      Dirección: ${newWalletETH.address}<br>
                                      Clave privada: ${newWalletETH.privateKey}<br>
                                      Balance: ${balanceETH}<br>
                                      <img src="${qrCodeETH}">`);
                        }
                    });

                    }
                });
                }
            });
        }
    });

})
.catch((error) => {
    console.error('Error al obtener el saldo BTC:', error);
});

});

app.listen(port, () => {
    console.log(`Servidor Node.js en funcionamiento en http://localhost:${port}`);
});