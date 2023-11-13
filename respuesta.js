const express = require('express');
const mysql = require('mysql2/promise');
const Web3 = require('web3');
const { generateAccount } = require('tron-create-address');
const cw = require("crypto-wallets");
const qr = require('qrcode');
const axios = require('axios');
const app = express();
const port = 3000;

// Conexión a la base de datos MySQL
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Aristo3030..',
    database: 'extreme',
};

let connection;

// Conecta a la red Binance Smart Chain (mainnet)
const web3 = new Web3('https://bsc-dataseed.binance.org/');

app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/billetera.html');
});

app.get('/generar-billetera', async (req, res) => {
    try {
        const selectedNetwork = req.query.network;
        const selectedIdser = req.query.uidser;
        console.log(selectedIdser);

        if (!selectedNetwork) {
            return res.status(400).json({ error: 'Red blockchain no especificada' });
        }

        // Crear la conexión a la base de datos en el nivel global
        const connection = await mysql.createConnection(dbConfig);
        // Verificar si ya existe una billetera para este usuario y criptomoneda
        const existingWalletQuery = 'SELECT * FROM wallets WHERE usder_id = ? AND currency = ?';
        const existingWalletValues = [selectedIdser, selectedNetwork];
        const [existingWalletRows] = await connection.query(existingWalletQuery, existingWalletValues);

        console.log(existingWalletRows.length);

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



        if (existingWalletRows.length > 0) {
            // Si ya existe una billetera, traer los datos existentes y generar el código QR de la dirección existente
            const existingWalletData = existingWalletRows[0];
            const qrCodeExistingWallet = await generateQRCode(existingWalletData.address);
            let pricebin; // Declarar la variable fuera de los bloques if

            if (selectedNetwork === 'bitcoin') {
                pricebin = btcPrice;
            }
            if (selectedNetwork === 'binancecoin') {
                pricebin = bnbPrice;
            }
            if (selectedNetwork === 'tronPrice') {
                pricebin = tronPrice;
            }
            if (selectedNetwork === 'ethereum') {
                pricebin = ethPrice;
            }
            if (selectedNetwork === 'tether' || selectedNetwork === 'tethere') {
                pricebin = usdtTrc20Price;
            }


            return res.json({
                address: existingWalletData.address,
                privateKey: existingWalletData.private_key,
                balance: existingWalletData.balance,
                qrCode: qrCodeExistingWallet,
                qprice: pricebin,
            });
        }

        // Lógica para generar la billetera según la red blockchain seleccionada
        let walletData = {};

        switch (selectedNetwork) {
            case "binancecoin":
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

            case "bitcoin":
                // Genera billetera BTC
                const newWalletBTC = cw.generateWallet("BTC");
                const addressBTC = newWalletBTC.address;
                const privateKeyBTC = newWalletBTC.privateKey;
                const qrCodeBTC = await generateQRCode(addressBTC);

                // Debes implementar la obtención del saldo de BTC y otros detalles
                // ...

                walletData = {
                    address: addressBTC,
                    // Otros datos relevantes de la billetera BTC
                    privateKey: privateKeyBTC,
                    qrCode: qrCodeBTC,
                    qprice: btcPrice,
                };
                break;

            case "tron":
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

            case "ethereum":
                // Genera billetera ETH
                const newWalletETH = cw.generateWallet("ETH");
                const addressETH = newWalletETH.address;
                const privateKeyETH = newWalletETH.privateKey;

                const balanceETHWei = await web3.eth.getBalance(addressETH);
                const balanceETH = web3.utils.fromWei(balanceETHWei, 'ether');

                const qrCodeETH = await generateQRCode(addressETH);

                walletData = {
                    address: addressETH,
                    // Otros datos relevantes de la billetera ETH
                    privateKey: privateKeyETH,
                    balance: balanceETH,
                    qrCode: qrCodeETH,
                    qprice: ethPrice,
                };
                break;

                case "tether":
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

                    case "tethere":
                        // Genera billetera ETH
                        const newWalletETHUSDT = cw.generateWallet("ETH");
                        const addressETHUSDT = newWalletETHUSDT.address;
                        const privateKeyETHUSDT = newWalletETHUSDT.privateKey;
                        const balanceETHWeiUSDT = await web3.eth.getBalance(addressETHUSDT);
                        const balanceETHUSDT = web3.utils.fromWei(balanceETHWeiUSDT, 'ether');
        
                        const qrCodeETHUSDT = await generateQRCode(addressETHUSDT);
        
                        walletData = {
                            address: addressETHUSDT,
                            privateKey: privateKeyETHUSDT,
                            // Otros datos relevantes de la billetera ETH
                            balance: balanceETHUSDT,
                            qrCode: qrCodeETHUSDT,
                            qprice: usdtTrc20Price,
                        };
                        break;

            default:
                return res.status(400).json({ error: 'Red blockchain no válida' });
        }
      
        (async () => {
            let connection;
        
            try {
                // Crear la conexión a la base de datos
                connection = await mysql.createConnection(dbConfig);
        
                // Establecer la conexión a la base de datos
                await connection.connect();
                console.log('Conexión a MySQL exitosa');
                // Realizar una inserción en la tabla
               
                const sql = 'INSERT INTO wallets (address, private_key, currency,usder_id) VALUES (?, ?, ?, ?)';
                const values = [walletData.address, walletData.privateKey,selectedNetwork,selectedIdser];
                const [result] = await connection.query(sql, values);
        
                // Realizar una consulta SELECT a la tabla
                const [rows, fields] = await connection.query('SELECT * FROM wallets');
        
                // Los resultados de la consulta están en la variable 'rows'
                console.log('Resultados de la consulta SELECT:', rows);
            } catch (error) {
                console.error('Error al conectar a MySQL:', error);
                process.exit(1); // Terminar la aplicación si no se puede conectar a la base de datos
            } finally {
                // Cerrar la conexión a la base de datos después de la consulta
                if (connection) {
                    await connection.end();
                }
            }
        })();
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
