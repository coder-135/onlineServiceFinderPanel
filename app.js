const express = require('express');
const cors = require('cors');
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv").config({ path: __dirname + "/.env" });
const morgan = require("morgan");
const moment = require('moment-jalaali');
const initializer = require("./utility/initializer");
const bodyParser = require('body-parser');
const app = express();

app.use(morgan(function (tokens, req, res) {
  return [
    req.headers["x-real-ip"] || req.ip,
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    moment().format('jYYYY/jMM/jDD-HH:mm:ss')
  ].join(' ')
}));
app.use(express.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use('/uploads',express.static(__dirname+'/uploads/'));

//فراخوانی و اجرای همه سرویس ها
const serviceNames = fs.readdirSync('./services');
serviceNames.forEach(serviceName => {
  const service = require(`./services/${serviceName}/routes.js`)
  app.use('/api', service)
});


app.use(express.static(path.join(__dirname, 'public')));


app.use((req,res)=>{
  res.sendFile(path.join( __dirname, 'public' , 'index.html'));
})

app.all("*", (req, res) => {
  res.status(404).json({
    status:'fail',
    data:{
    message: "روت درخواستی موجود نمی باشد",
    }
  })
});


if (dotenv.error) {
  throw dotenv.error;
}

//run initial config
initializer.Initialize().then(()=>console.log('mongodb connected successfully'));

//run server
const port = process.env.SERVER_PORT || 5000;

app.listen(port, ()=>console.log(`Server is running on port ${port}`));