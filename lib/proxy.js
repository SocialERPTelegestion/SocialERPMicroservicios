const { writeFileSync, promises } = require('fs');
const firmaXMLbo = require('./firma-xml/app.js')
const firmaXMLdo = require('./firma-xml/app.js')
const obtenerToken = require('./firma-xml/obtenertoken.js');

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

  const thePath = decodeURIComponent(req.originalUrl).split('/');
  let FicheroFirmado
  if (thePath[1] === '') {
    res.status(400).json({ error: { msg: 'error.message', stack: 'error.stack' } })
    return
  } else {
    switch (thePath[2]) {
      case 'firma':
        FicheroFirmado = await firmaXMLbo(req, res, next)
      case 'firmabo':
        FicheroFirmado = await firmaXMLbo(req, res, next)
      case 'firmado':
        FicheroFirmado = await firmaXMLdo(req, res, next)
    }

    res.header("Content-Type", "application/xml");
    res.status(200).send(FicheroFirmado)

  }
  // const attributes = req.query.attributes || '';
  // res.status(200).json({ resp: 'hola' })

  // res.status(err.response.status).json({ "status": err.response.status, "error": `${err.response.statusText}`, "message": `${err.message}` });


};
