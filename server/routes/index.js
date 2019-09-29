var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var d3 = require('d3');

var sql_operation = require('./db/dbOperation/operation');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/district',function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  fs.readFile(path.join(__dirname,'../public/dataset/district.json'),(err,data)=>{
    if(err) res.end(err);
    //console.log(data.toString('utf8'));
    res.end(data.toString('utf8'));
  })
});

router.get('/buses',function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  fs.readFile(path.join(__dirname,'../public/dataset/buses_data.json'),(err,data)=>{
    if(err) res.end(err);
    let all_routes = JSON.parse(data.toString());
    let routes = d3.nest().key(d=>d.type).entries(all_routes);
    //console.log(nest.filter(d=>d.key).forEach(d=>console.log(d.key)));
    res.json(routes);
  })
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
})

router.post('/basic_line', function(req, res, next){
  sql_operation.basic_line(req, res, next)
})

module.exports = router;
