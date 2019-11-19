var express = require("express");
var router = express.Router();
var fs = require("fs");
var path = require("path");
var d3 = require("d3");
var urlModule = require("url");

var sql_operation = require("./db/dbOperation/operation");

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/geo_data", function(req, res, next) {
  let { url: url, query } = urlModule.parse(req.url, true);

  res.setHeader("Access-Control-Allow-Origin", "*");

  fs.readFile(
    path.join(__dirname, `../public/dataset/2017-${query.param}.csv`),
    (err, data) => {
      let table = [];
      data = data.toString();
      let rows = data.split("\r\n");
      rows.forEach(d => {
        table.push(d.split(","));
      });
      console.log(table);
      res.json(table.toString());
    }
  );
});
router.get("/poi_data", function(req, res, next) {
  let { url: url, query } = urlModule.parse(req.url, true);

  res.setHeader("Access-Control-Allow-Origin", "*");

  var file = path.join(__dirname, "../public/dataset/POI/POI.json"); //文件路径，__dirname为当前运行js文件的目录
  //var file = 'f:\\nodejs\\data\\test.json'; //也可以用这种方式指定路径

  //读取json文件
  fs.readFile(file, "utf-8", function(err, data) {
    if (err) {
      res.send("文件读取失败");
    } else {
      res.send(data);
    }
  });
});
router.get("/add", function(req, res, next) {
  sql_operation.add(req, res, next);
});

router.get("/query", function(req, res, next) {
  sql_operation.query(req, res, next);
});

router.get("/update", function(req, res, next) {
  sql_operation.update(req, res, next);
});

router.get("/delete", function(req, res, next) {
  sql_operation.delete(req, res, next);
});

router.get("/test", function(req, res, next) {
  //res.setHeader("Access-Control-Allow-Origin", '*')
  sql_operation.test(req, res, next);
});

router.get("/poi_haikou", function(req, res, next) {
  //res.setHeader("Access-Control-Allow-Origin", '*')
  sql_operation.poi_haikou(req, res, next);
});

router.post("/basic_line", function(req, res, next) {
  sql_operation.basic_line(req, res, next);
});

router.post('/feature_line', function(req, res, next){
  sql_operation.feature_line(req, res, next)
})

router.post('/para_line', function(req, res, next){
  sql_operation.para_line(req, res, next)
})

router.post('/rect_detail', function(req, res, next){
  sql_operation.rect_detail(req, res, next)
})
module.exports = router;
