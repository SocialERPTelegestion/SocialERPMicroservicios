
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

const comprobarContenido = (req, res) => {
    return new Promise(async (resolve) => {
        if (req.method == 'POST' && Object.keys(req.body).length === 0) {
            return res.status(400).json({ msg: { error: '¡Body inexistente!' } });
        }
        if (!req.headers['x-key']) {
            //return res.end("No se encuentra autorización.");
            return res.status(400).json({ msg: { error: '¡No se encuentra autorización.' } });
        }
        resolve(true)

    })
}




module.exports = { guardarCertificado, comprobarContenido };