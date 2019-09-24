var express = require('express');
var router = express.Router();

// var urlModule = require('url');//pathname  query

var sql_operation = require('./db/dbOperation/operation');

//测试
// var MysqlPool = require('./mysql/mysql_pool.js');
// var mysqlPool = new MysqlPool();
// var pool = mysqlPool.getPool();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/add', function(req, res, next){
  sql_operation.add(req, res, next)
});

router.get('/query', function(req, res, next){

  sql_operation.query(req, res, next);

  // var {url:url,query} = urlModule.parse(req.url,true);
  //res.setHeader("Access-Control-Allow-Origin", "*");
  // if(query.name === 'start_geohash' || query.name === 'end_geohash'){
  //   pool.query(`SELECT * FROM db_traffic.${query.name}`,(err,rows)=>{
  //     if(err) throw err;
  //     //console.log(rows);
  //     res.send(rows);
  //   });
  // }
  // else
  //   res.end('Collection Not Found!');
});

router.get('/update', function(req, res, next){
  sql_operation.update(req, res, next)
});

router.get('/delete', function(req, res, next){
  sql_operation.delete(req, res, next)
});

module.exports = router;
