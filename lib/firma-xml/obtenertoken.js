const { ECF, P12Reader } = require('dgii-ecf');
const path = require('path');

async function authenticateECF() {
    const p12FilePath = path.resolve(__dirname, '../firma-xml/test/text_identity.p12');
    const secret = 'interface2023';

    const reader = new P12Reader(secret);
    const certs = reader.getKeyFromFile(p12FilePath);

    const auth = new ECF(certs);
    try {
        const tokenData = await auth.authenticate();
        console.log('Token Data:', tokenData);

    } catch (error) {
        console.error('Error during authentication:', error);
    }

}
authenticateECF()

module.exports = authenticateECF;