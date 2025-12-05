// const serve = require('koa-static');
// const cors = require('@koa/cors');
// const Koa = require('koa');

let http = require('http');
let hostess = require('vhostess')();

// read .env file
const dotenv = require('dotenv');
dotenv.config({
    path: require('path').join(__dirname, '.env')
});


async function runVhost() {

    let data_app = await require('../server/app')();
    let client_app = require('./app');

    // set admin cors 
    //   let corsOptions = {
    //     origin: (ctx) => {
    //       const requestOrigin = ctx.accept.headers.origin;
    //       // console.log('requestOrigin',requestOrigin)
    //       let whitelist = global.config.valid_cors;

    //       if (!whitelist.includes(requestOrigin))
    //         return ctx.throw(`🙈  ${requestOrigin} is not a valid origin`);

    //       return requestOrigin;
    //     }
    //   };
    //   admin_app.use(cors(corsOptions));


    let port = 8080;
    let server = http.createServer(hostess).listen(port);

    hostess.use('data.goranee.ir', data_app.app.callback());
    hostess.use('goranee.ir', client_app);
    hostess.use('www.goranee.ir', client_app);


    // 404 
    hostess.use(function (req, res) {
        res.statusCode = 404
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.end('subdomain needed')
    });
}

runVhost();