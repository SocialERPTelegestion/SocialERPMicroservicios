
const fs = require('fs');
const path = require('path');
const archivos = './lib/firma-xml/Archivos/'

const guardarCertificado = (req, res, next) => {
    req = req
    return new Promise(async (resolve, reject) => {
        try {
            const p12FilePath = path.resolve(__dirname, 'Archivos/certificado.p12')
            let certBase64 = req.headers['x-cert']
            let certbuff = Buffer.from(certBase64, 'base64');
            let ficheroCertificado = `${archivos}certificado.p12` //ruta certificado
            fs.writeFileSync(ficheroCertificado, certbuff);
            resolve(p12FilePath)
        } catch (err) {
            reject(err)
        }
    })
}

module.exports = guardarCertificado;