const express = require('express');
const fs = require('fs');
const { proxy } = require('./lib/proxy');
const { authenticateECF } = require('./lib/firma-xml/obtenertoken')
var https = require('https')
const app = express();
const path = require('path');

const cors = require('cors'); // https://github.com/expressjs/cors

const multer = require('multer')

const port = process.env.PORT || 3002;
const sslport = process.env.SSLPORT || 3003;
const host = process.env.host || '127.0.0.1';
// const serp = require('./lib/scripts/serp');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'; //https://stackoverflow.com/questions/20082893/unable-to-verify-leaf-signature

const archivos = 'lib/firma-xml/Archivos/'
let contador = 0

let whitelist = ['https://adaia.cat', 'https://annturs.org', 'https://telegestion.com', 'https://comunidad.socialerp.net', 'https://fichatujoranada.com', 'http://127.0.0.1:8082', 'https://pelugestion.com', 'https://socialerp.net', 'https://justbuy.net', 'https://www.justbuy.net']

app.use(cors({
    credentials: true,
    origin: function (origin, callback) {
        // allow requests with no origin 
        if (!origin) return callback(null, true);
        if (whitelist.indexOf(origin) === -1) {
            var message = 'The CORS policy for this origin does not ' +
                'allow access from the particular origin.';
            return callback(new Error(message), false);
        }
        return callback(null, true);
    }
}));


// https://www.positronx.io/express-cors-tutorial/
// https://fetch.spec.whatwg.org/#cors-protocol-and-credentials
// https://expressjs.com/en/resources/middleware/cors.html
// https://maximorlov.com/fix-unexpected-field-error-multer/

app.use(function (req, res, next) {
    // res.header("Access-Control-Allow-Origin", "https://adaia.cat");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    // Check if we've already initialised a session
    // if (!req.session.initialised) {
    //   // Initialise our variables on the session object (that's persisted across requests by the same user
    //   req.session.initialised = true;
    //   req.session.x = 1;
    //   req.session.contador = 0;
    //   req.session.testString = '';
    // }
    next();
});

app.all('*', function (error, req, res, next) {
    // console.log('Accessing the secret section ...')
    // res.status(200).send({url: req.originalUrl + ' not found'}),
    next(error); // pass control to the next handler
});


app.use((req, res, next) => {
    contador = contador + 1
    console.info(contador, '-> Conexión:', new Date().toLocaleString())
    if (contador == 500) {
        contador = 0
    }
    const ip = req.ip
    console.info(ip, ' -> Conexión:', new Date().toLocaleString())
    console.info(`--> Path: ${req.originalUrl}`)
    next()
})

app.get('/', proxy);
// app.use('/^\/api', proxy);

//const bodyParser = require("body-parser");

// const bodyParser = require("body-parser");
// app.use(bodyParser.urlencoded({ extended: false }));// create application/x-www-form-urlencoded parser
// app.use(bodyParser.json());

app.use(express.json({ limit: '50mb' })) // for parsing application/json
app.use(express.urlencoded({ limit: '50mb', extended: true })) // for parsing application/

app.get('/api/test', function (req, res, next) {
    // req.file es el `avatar` del archivo
    res.status(200).json({ msg: { estado: '¡Connetado! v1.0' } });
    // req.body tendrá los campos textuales, en caso de haber alguno.
})


app.post('/api/firma', function (req, res, next) {
    // req.file es el `avatar` del archivo
    proxy(req, res, next);
    // req.body tendrá los campos textuales, en caso de haber alguno.
})


var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './' + archivos);
    },

    filename: function (req, file, callback) {
        // callback(null, file.fieldname + '-' + Date.now());
        // callback(null, file.fieldname);
        callback(null, file.originalname);
    }
});

//En caso de que venga un archivo en multipart:
var uploadf = multer({ storage: storage }).single('p12');//nombre del campo donde viene el archivo

app.post('/api/firmabo', function (req, res, next) {
    uploadf(req, res, function (err) {
        if (err) {
            // return res.end("Error uploading file.");
            return res.status(400).json({ msg: { error: 'Error uploading file (multer)!' } });
        }
        proxy(req, res, next);
    });
});

app.post('/api/firmado', function (req, res, next) {

    proxy(req, res, next);
    //En caso de que venga un archivo en multipart
    // uploadf(req, res, function (err) {
    //     if (err) {
    //         return res.end("Error uploading file.");
    //     }
    //     proxy(req, res, next);
    // });
});


app.post('/api/obtenertoken', function (req, res, next) {
    proxy(req, res, next);
})

// app.post('/api/firma', function (req, res, next) {
//     proxy(req, res, next);
// })

//PUNTOS DE ACCESO 
/*
app.use(/^\/rest\/\$catalog/, catalog);
app.use('/rest', proxy);
app.use('/method', proxy);
app.use('/api', proxyDirecto);
*/

app.use(function (error, req, res, next) {
    // https://expressjs.com/en/guide/error-handling.html
    if (error.message) {
        console.log('[index] ' + error.message);
    }
    // res.status(400).json({error: {msg: error.message, stack: error.stack}});
});

app.listen(port, () => console.info(`server started on port ${port} at: http://${host}:${port}`));

// SSL:

https.createServer({
    key: fs.readFileSync('socialerp.key'),
    cert: fs.readFileSync('socialerp.pem')
}, app)
    .listen(sslport, function () {
        console.log(`app listening on secure port ${sslport} at: https://${host}:${sslport}/`);
    })

// https://stackoverflow.com/questions/9049993/node-js-how-to-limit-the-http-request-size-and-upload-file-size#24893992

