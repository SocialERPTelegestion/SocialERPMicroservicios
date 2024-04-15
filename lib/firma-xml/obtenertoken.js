const { ECF, P12Reader } = require('dgii-ecf');
const fs = require('fs');
const path = require('path');
const archivos = './lib/firma-xml/Archivos/'
const guardarCertificado = require('./utils')

const authenticateECF = (req, res, next) => {
    req = req
    return new Promise(async (resolve, reject) => {

        const p12FilePath = await guardarCertificado(req)
        const set = {
            psw: req.headers['x-key'] //password del certificado
        }
        const secret = set.psw

        let certBase64 = req.headers['x-cert']
        let certbuff = Buffer.from(certBase64, 'base64');
        let ficheroCertificado = `${archivos}certificado.p12` //ruta certificado
        fs.writeFileSync(ficheroCertificado, certbuff);

        const reader = new P12Reader(secret);
        const certs = reader.getKeyFromFile(p12FilePath);


        if (!certs.key || !certs.cert) {
            return;
        }

        const auth = new ECF(certs);

        try {
            const tokenData = await auth.authenticate();
            console.log('Token:', tokenData);
            resolve(tokenData)
        } catch (error) {
            console.error('Error during authentication:', error);
        }

    })
}


module.exports = authenticateECF;