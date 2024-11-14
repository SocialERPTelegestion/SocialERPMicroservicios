// Implementación: https://tutoriales.adsib.gob.bo/_08/index.html
// <-- Ejecutar y Depurar
// Toma el fichero data.xml, y lo devuelve firmado en xml.xml
// facturaElectronicaCompraVenta
// Puedo recibir en el cuerpo -> XML
// https://www.tutsmake.com/node-js-express-rest-api-file-upload-example/

// DGII-eCF (DGII) - Dirección General de Impuestos Internos de República Dominicana.
// Este paquete contiene las herramientas necesarias para autenticar y firmar archivos eletrónicos para realizar la facturación electrónica para aplicaciones nodejs.
// https://github.com/victors1681/dgii-ecf?tab=readme-ov-file
// MULTIPART Node: https://tanaikech.github.io/2017/07/27/multipart-post-request-using-node.js/


const Dsig = require('pkcs12-xml');//módulo
const fs = require('fs');
const archivos = './lib/firma-xml/Archivos/'
const path = require('path');
var { P12Reader } = require('dgii-ecf')
var { Signature } = require('dgii-ecf')


exports.proxyTest = async (req, res, next) => {

    const thePath = decodeURIComponent(req.originalUrl);
    if (thePath === '/') {
        res.status(400).json({ error: { msg: 'error.message', stack: 'error.stack' } })
        return
    }
    const attributes = req.query.attributes || '';
    res.status(200).json({ resp: 'hola' })

    // res.status(err.response.status).json({ "status": err.response.status, "error": `${err.response.statusText}`, "message": `${err.message}` });


};
var parser = require('xml2json');

const firmaXMLbo = (req, res, next) => {
    req = req
    return new Promise(async (resolve, reject) => {

        var dsig = new Dsig(`${archivos}softoken.p12`);//certificado
        const set = require('./secr.settings')//contiene datos secretos. No se sincroniza
        // const ficheroFacturaXML = `${archivos}facturaSIT.xml`//XML de la factura
        let data = req.body
        let buff = Buffer.from(data, 'base64');
        let text = buff.toString('utf-8');
        const ficheroFacturaXML = `${archivos}facturaelectronicaSIT.xml` //XML de la factura

        fs.writeFileSync(ficheroFacturaXML, text);

        //Parece lo mismo que abrir el archivo pero la firma falla ¿?:
        // var snowman = Buffer.from(text, "utf-8")
        // var snowmanXML = dsig.computeSignature(snowman, '')
        //console.log(snowmanXML)

        fs.readFile(ficheroFacturaXML, function (err, data) {
            try {
                // dsig.openSession('Statrodrigo2');
                dsig.openSession(set.psw);
                var xml = data
                var json = parser.toJson(data)
                var jsonObj = JSON.parse(json)
                //pasa por el json y en el primer nivel toma nota del nombre de la propiedad:
                var firstProp;
                for (var key in jsonObj) {
                    if (jsonObj.hasOwnProperty(key)) {
                        firstProp = jsonObj[key];
                        break;
                    }
                }

                var cabecera
                var raiz
                try {
                    raiz = firstProp
                } catch (e) {
                    console.info('no es facturaElectronicaCompraVenta')
                }
                cabecera = raiz.cabecera
                console.log(cabecera.nombreRazonSocial)
                console.log(key, " Nº ->", cabecera.numeroFactura); console.log("Documento ->", cabecera.numeroDocumento + '\r');
                var resultado = dsig.computeSignature(xml, '')  //Segundo parámetro id y Reference URI
                fs.writeFileSync(`${archivos}facturaelectronicaFirm.xml`, resultado);
                resolve(resultado)
            } catch (e) {
                console.error(e);
                reject(e)
            } finally {
                dsig.closeSession();
            }
        });
    })
};

const firmaXMLdo = (req, res, next) => {
    req = req
    return new Promise(async (resolve, reject) => {

        const set = {
            psw: req.headers['x-key'] //password del certificado
        }
        const secret = set.psw
        let certBase64 = req.headers['x-cert']
        let certbuff = Buffer.from(certBase64, 'base64');
        let ficheroCertificado = `${archivos}certificado.p12` //ruta certificado
        fs.writeFileSync(ficheroCertificado, certbuff);

        const reader = new P12Reader(secret);
        const certs = reader.getKeyFromFile(
            // path.resolve(__dirname, req.file.path)
            path.resolve(__dirname, 'Archivos/certificado.p12')
        );

        if (!certs.key || !certs.cert) {
            return;
        }

        let data = req.body.xml
        let buff = Buffer.from(data, 'base64');
        let text = buff.toString('utf-8');
        const ficheroFacturaXML = `${archivos}facturaelectronicaSIT.xml` //XML de la factura
        fs.writeFileSync(ficheroFacturaXML, text);

        //Get the XML file to add the signature
        const seedXml = fs.readFileSync(
            path.resolve(__dirname, 'Archivos/facturaelectronicaSIT.xml'),
            'utf-8');

        //Sign the document
        const signature = new Signature(certs.key, certs.cert);
        const signedXml = signature.signXml(seedXml, 'ECF');
        fs.writeFileSync(`${archivos}facturaelectronicaFirm.xml`, signedXml);
        resolve(signedXml)

        try {
            var xml = seedXml
            var json = parser.toJson(xml);
            var jsonObj = JSON.parse(json)

            //pasa por el json y en el primer nivel toma nota del nombre de la propiedad:
            var firstProp;
            for (var key in jsonObj) {
                if (jsonObj.hasOwnProperty(key)) {
                    firstProp = jsonObj[key];
                    break;
                }
            }

            var cabecera
            var raiz
            try {
                raiz = firstProp
            } catch (e) {
                console.info('no es facturaElectronicaCompraVenta')
            }
            cabecera = raiz.cabecera
            console.log('Firmado', firstProp.fecha)


        } catch (e) {
            console.error(e.message);
            resolve(e.message)
        } finally {
            fs.unlink(ficheroCertificado, err => {
                if (err) {
                    resolve(err.message)
                }
                console.log('Certificado eliminado.')
            })
            fs.unlink(`${archivos}facturaelectronicaFirm.xml`, err => {
                if (err) {
                    resolve(err.message)
                }
                console.log('xml firmado eliminado.')
            })
            fs.unlink(`${archivos}facturaelectronicaSIT.xml`, err => {
                if (err) {
                    resolve(err.message)
                }
                console.log('xml factura eliminado.')
            })
        }

    }
    )
};

const firmaSemillaXMLdo = (req, res, next) => {
    req = req
    return new Promise(async (resolve, reject) => {

        const set = {
            psw: req.headers['x-key'] //password del certificado
        }
        const secret = set.psw
        let certBase64 = req.headers['x-cert']
        let certbuff = Buffer.from(certBase64, 'base64');
        let ficheroCertificado = `${archivos}certificado.p12` //ruta certificado
        fs.writeFileSync(ficheroCertificado, certbuff);

        const reader = new P12Reader(secret);
        const certs = reader.getKeyFromFile(
            // path.resolve(__dirname, req.file.path)
            path.resolve(__dirname, 'Archivos/certificado.p12')
        );

        if (!certs.key || !certs.cert) {
            return;
        }

        let data = req.body.xml
        let buff = Buffer.from(data, 'base64');
        let text = buff.toString('utf-8');
        const ficheroFacturaXML = `${archivos}facturaelectronicaSIT.xml` //XML de la factura
        fs.writeFileSync(ficheroFacturaXML, text);

        //Get the XML file to add the signature
        const seedXml = fs.readFileSync(
            path.resolve(__dirname, 'Archivos/facturaelectronicaSIT.xml'),
            'utf-8');

        //Sign the document
        const signature = new Signature(certs.key, certs.cert);
        const signedXml = signature.signXml(seedXml, 'SemillaModel');
        fs.writeFileSync(`${archivos}facturaelectronicaFirm.xml`, signedXml);
        resolve(signedXml)

        try {
            var xml = seedXml
            var json = parser.toJson(xml);
            var jsonObj = JSON.parse(json)

            //pasa por el json y en el primer nivel toma nota del nombre de la propiedad:
            var firstProp;
            for (var key in jsonObj) {
                if (jsonObj.hasOwnProperty(key)) {
                    firstProp = jsonObj[key];
                    break;
                }
            }

            var cabecera
            var raiz
            try {
                raiz = firstProp
            } catch (e) {
                console.info('no es facturaElectronicaCompraVenta')
            }
            cabecera = raiz.cabecera
            console.log('Firmado', firstProp.fecha)


        } catch (e) {
            console.error(e.message);
            resolve(e.message)
        } finally {
            fs.unlink(ficheroCertificado, err => {
                if (err) {
                    resolve(err.message)
                }
                console.log('Certificado eliminado.')
            })
            fs.unlink(`${archivos}facturaelectronicaFirm.xml`, err => {
                if (err) {
                    resolve(err.message)
                }
                console.log('xml firmado eliminado.')
            })
            fs.unlink(`${archivos}facturaelectronicaSIT.xml`, err => {
                if (err) {
                    resolve(err.message)
                }
                console.log('xml factura eliminado.')
            })
        }

    }
    )
};

module.exports = { firmaXMLbo, firmaXMLdo, firmaSemillaXMLdo };