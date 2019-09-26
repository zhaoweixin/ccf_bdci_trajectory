var express = require('express');
var router = express.Router();

var sql_operation = require('./db/dbOperation/operation');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/add', function(req, res, next){
  sql_operation.add(req, res, next)
});

router.get('/query', function(req, res, next){

  res.setHeader("Access-Control-Allow-Origin", "*");
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

module.exports = router;
