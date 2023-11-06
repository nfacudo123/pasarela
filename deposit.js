const express = require('express');
const { Web3 } = require('web3');
const { generateAccount } = require('tron-create-address');
const cw = require("crypto-wallets");
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

app.get('/generar-billetera', async (req, res) => {
    try {
        const selectedNetwork = req.query.network;

        if (!selectedNetwork) {
            return res.status(400).json({ error: 'Red blockchain no especificada' });
        }

        // Función para obtener el precio de una criptomoneda en USD
async function getCoinPrice(coinId) {
    try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
        const data = response.data;
        return data[coinId].usd;
    } catch (error) {
        console.error('Error al obtener el precio de', coinId, error);
        return null;
    }
}

// Para BNB
const bnbPrice = await getCoinPrice("binancecoin");
console.log('Precio de BNB en USD:', bnbPrice);

// Para BTC
const btcPrice = await getCoinPrice("bitcoin");
console.log('Precio de BTC en USD:', btcPrice);

// Para TRX
const tronPrice = await getCoinPrice("tron");
console.log('Precio de TRX en USD:', tronPrice);

// Para ETH
const ethPrice = await getCoinPrice("ethereum");
console.log('Precio de ETH en USD:', ethPrice);

// Para USDT TRC20
const usdtTrc20Price = await getCoinPrice("tether");
console.log('Precio de USDT TRC20 en USD:', usdtTrc20Price);



        // Lógica para generar la billetera según la red blockchain seleccionada
        let walletData = {};

        switch (selectedNetwork) {
            case "BNB":
                // Genera billetera BNB
                const newWalletBNB = web3.eth.accounts.create();
                const addressBNB = newWalletBNB.address;
                const privateKeyBNB = newWalletBNB.privateKey;

                const balanceBNBWei = await web3.eth.getBalance(addressBNB);
                const balanceBNB = web3.utils.fromWei(balanceBNBWei, 'ether');

                const qrCodeBNB = await generateQRCode(addressBNB);

                walletData = {
                    address: addressBNB,
                    privateKey: privateKeyBNB,
                    balance: balanceBNB,
                    qrCode: qrCodeBNB,
                    qprice: bnbPrice,
                };
                break;

            case "BTC":
                // Genera billetera BTC
                const newWalletBTC = cw.generateWallet("BTC");
                const addressBTC = newWalletBTC.address;
                const qrCodeBTC = await generateQRCode(addressBTC);

                // Debes implementar la obtención del saldo de BTC y otros detalles
                // ...

                walletData = {
                    address: addressBTC,
                    // Otros datos relevantes de la billetera BTC
                    qrCode: qrCodeBTC,
                    qprice: btcPrice,
                };
                break;

            case "TRX":
                // Genera billetera TRX
                const newWalletTRX = generateAccount();
                const addressTRX = newWalletTRX.address.toString(); // Convierte la dirección TRX a cadena de texto
                const privateKeyTRX = newWalletTRX.privateKey;

                // Debes implementar la obtención del saldo de TRX y otros detalles
                // ...

                const qrCodeTRX = await generateQRCode(addressTRX);

                walletData = {
                    address: addressTRX,
                    privateKey: privateKeyTRX,
                    // Otros datos relevantes de la billetera TRX
                    qrCode: qrCodeTRX,
                    qprice: tronPrice,
                };
                break;

            case "ETH":
                // Genera billetera ETH
                const newWalletETH = cw.generateWallet("ETH");
                const addressETH = newWalletETH.address;

                const balanceETHWei = await web3.eth.getBalance(addressETH);
                const balanceETH = web3.utils.fromWei(balanceETHWei, 'ether');

                const qrCodeETH = await generateQRCode(addressETH);

                walletData = {
                    address: addressETH,
                    // Otros datos relevantes de la billetera ETH
                    balance: balanceETH,
                    qrCode: qrCodeETH,
                    qprice: ethPrice,
                };
                break;

                case "USDT_TRC20":
                    // Genera billetera USDT TRX
                    const newWalletTRXUSDT = generateAccount();
                    const addressTRXUSDT = newWalletTRXUSDT.address.toString(); // Convierte la dirección TRX a cadena de texto
                    const privateKeyTRXUSDT = newWalletTRXUSDT.privateKey;
    
                    // Debes implementar la obtención del saldo de TRX y otros detalles
                    // ...
    
                    const qrCodeTRXUSDT = await generateQRCode(addressTRXUSDT);
    
                    walletData = {
                        address: addressTRXUSDT,
                        privateKey: privateKeyTRXUSDT,
                        // Otros datos relevantes de la billetera TRX
                        qrCode: qrCodeTRXUSDT,
                        qprice: usdtTrc20Price,
                    };
                    break;

                    case "USDT_ERC20":
                        // Genera billetera ETH
                        const newWalletETHUSDT = cw.generateWallet("ETH");
                        const addressETHUSDT = newWalletETHUSDT.address;
        
                        const balanceETHWeiUSDT = await web3.eth.getBalance(addressETHUSDT);
                        const balanceETHUSDT = web3.utils.fromWei(balanceETHWeiUSDT, 'ether');
        
                        const qrCodeETHUSDT = await generateQRCode(addressETHUSDT);
        
                        walletData = {
                            address: addressETHUSDT,
                            // Otros datos relevantes de la billetera ETH
                            balance: balanceETHUSDT,
                            qrCode: qrCodeETHUSDT,
                            qprice: usdtTrc20Price,
                        };
                        break;

            default:
                return res.status(400).json({ error: 'Red blockchain no válida' });
        }

        // Enviar la información de la billetera al cliente
        res.json(walletData);
    } catch (error) {
        console.error('Error al generar la billetera:', error);
        res.status(500).json({ error: 'Error al generar la billetera' });
    }
});

// Lógica para generar códigos QR
async function generateQRCode(data) {
    return new Promise((resolve, reject) => {
        qr.toDataURL(data, (err, qrCode) => {
            if (err) {
                reject(err);
            } else {
                resolve(qrCode);
            }
        });
    });
}

app.listen(port, () => {
    console.log(`Servidor Node.js en funcionamiento en http://localhost:${port}`);
});
