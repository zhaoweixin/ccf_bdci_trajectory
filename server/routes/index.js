var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var d3 = require('d3');
var urlModule = require('url');

var sql_operation = require('./db/dbOperation/operation');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/geo_data',function(req, res, next) {

  let {url:url,query} = urlModule.parse(req.url,true)

  res.setHeader("Access-Control-Allow-Origin", "*");

  fs.readFile(path.join(__dirname,`../public/dataset/2017-${query.param}.csv`),(err,data)=>{

    let table = [];
    data = data.toString();
    let rows = data.split("\r\n");
    rows.forEach(d=>{
      table.push(d.split(","));
    });
    console.log(table);
    res.json(table.toString());
  });

});

router.get('/add', function(req, res, next){
  sql_operation.add(req, res, next)
});

router.get('/query', function(req, res, next){
  sql_operation.query(req, res, next);
});

router.get('/update', function(req, res, next){
  sql_operation.update(req, res, next)
});

router.get('/delete', function(req, res, next){
  sql_operation.delete(req, res, next)
});

router.get('/test', function(req, res, next){
  //res.setHeader("Access-Control-Allow-Origin", '*')
  sql_operation.test(req, res, next)
});

router.get('/poi_haikou', function(req, res, next){
  //res.setHeader("Access-Control-Allow-Origin", '*')
  sql_operation.poi_haikou(req, res, next)
});

router.post('/basic_line', function(req, res, next){
  sql_operation.basic_line(req, res, next)
});

router.get('/weather', function(req, res, next){
  sql_operation.weather(req, res, next)
})
module.exports = router;
