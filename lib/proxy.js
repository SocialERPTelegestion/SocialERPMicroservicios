const { writeFileSync, promises } = require('fs');
const firmaXMLbo = require('./firma-xml/app.js')
const firmaXMLdo = require('./firma-xml/app.js')
const firmaSemillaXMLdo = require('./firma-xml/app.js')
const obtenerToken = require('./firma-xml/obtenertoken.js');
const utils = require('./utils.js')

// const { checkSesion, HHTPError, cookieToObject } = require('./scripts/dbutils.js');

function IsJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    // console.info('no es un json');
    return false;
  }
  return true;
}

function tryParseJSON(jsonString) {
  try {
    var o = JSON.parse(jsonString);

    // Handle non-exception-throwing cases:
    // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
    // but... JSON.parse(null) returns null, and typeof null === "object", 
    // so we must check for that, too. Thankfully, null is falsey, so this suffices:
    if (o && typeof o === "object") {
      return o;
    }
  }
  catch (e) { }

  return false;
};

exports.proxy = async (req, res, next) => {

  //si no sirve lo que viene devuelve el error y no sigue.
  await utils.comprobarContenido(req, res)

  const thePath = decodeURIComponent(req.originalUrl).split('/');
  let FicheroFirmado
  if (thePath[1] === '') {
    res.status(400).json({ error: { msg: 'error.message', stack: 'error.stack' } })
    return
  } else {
switch (thePath[2]) {
    case 'firma':
    case 'firmabo':
        console.log("Ejecutando firmaXMLbo");
        FicheroFirmado = await firmaXMLbo(req, res);
        break;
    case 'firmado':
        console.log("Ejecutando firmaXMLdo");
        FicheroFirmado = await firmaXMLdo(req, res);
        break;
    case 'firmasemilla':
        console.log("Ejecutando firmaSemillaXMLdo");
        FicheroFirmado = await firmaSemillaXMLdo(req, res);
        break;
    case 'obtenertoken':
        console.log("Ejecutando obtenerToken");
        FicheroFirmado = await obtenerToken(req, res);
        break;
    default:
        console.log("Caso no reconocido:", thePath[2]);
}

    res.header("Content-Type", "application/xml");
    res.status(200).send(FicheroFirmado)

  }
  // const attributes = req.query.attributes || '';
  // res.status(200).json({ resp: 'hola' })

  // res.status(err.response.status).json({ "status": err.response.status, "error": `${err.response.statusText}`, "message": `${err.message}` });


};
