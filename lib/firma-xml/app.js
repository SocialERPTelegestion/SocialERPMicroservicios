// Implementación: https://tutoriales.adsib.gob.bo/_08/index.html
// <-- Ejecutar y Depurar
// Toma el fichero data.xml, y lo devuelve firmado en xml.xml
// facturaElectronicaCompraVenta
// Puedo recibir en el cuerpo -> XML
// https://www.tutsmake.com/node-js-express-rest-api-file-upload-example/


const Dsig = require('pkcs12-xml');//módulo
const fs = require('fs');
const archivos = 'lib/firma-xml/Archivos/'

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

}

const firmaXMLdo = (req, res, next) => {
    req = req
    return new Promise(async (resolve, reject) => {

        // let certdata = req.body.certificado
        // let certbuff = Buffer.from(certdata, 'base64');
        // let certtext = certbuff.toString('utf-8');

        // const ficheroCertificado = `${archivos}certificado`
        // fs.writeFileSync(ficheroCertificado, certtext);
        // var dsig = new Dsig(ficheroCertificado);

        var dsig = new Dsig(req.file.path);//certificado p12. No necesita extensión

        // const set = require('./secr.settings')//contiene datos secretos. No se sincroniza
        const set = {
            psw: req.headers['x-key'] //password del certificado
        }
        // const ficheroFacturaXML = `${archivos}facturaSIT.xml`//XML de la factura
        let data = req.body.xml
        let buff = Buffer.from(data, 'base64');
        let text = buff.toString('utf-8');
        const ficheroFacturaXML = `${archivos}facturaelectronicaSIT.xml` //XML de la factura
        fs.writeFileSync(ficheroFacturaXML, text);

        fs.readFile(ficheroFacturaXML, function (err, data) {
            try {
                // dsig.openSession('Statrodrigo2');
                dsig.openSession(set.psw);
                var xml = data

                var json = parser.toJson(data);
                var jsonObj = JSON.parse(json)
                // var cabecera = jsonObj.facturaElectronicaCompraVenta.cabecera
                // console.log(cabecera.nombreRazonSocial)
                // console.log("nº Factura ->", cabecera.numeroFactura); console.log("nº Documento ->", cabecera.numeroDocumento + '\r');

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
                console.error(e.message);
                resolve(e.message)
            } finally {
                fs.unlink(req.file.path, err => {
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
                dsig.closeSession();
            }
        });
    })

}
module.exports = firmaXMLbo;
module.exports = firmaXMLdo;
