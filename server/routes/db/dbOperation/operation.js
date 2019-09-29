var mysql = require('mysql');
var $sql = require('./sql');
var MysqlPool = require('./mysql_pool.js');
var urlModule = require('url');

var mysqlPool = new MysqlPool();
var pool = mysqlPool.getPool();
var d3 = require('d3')

module.exports = {
    add: function (req, res, next) {
        pool.getConnection(function(err, connection) {
            var param = req.query || req.params;

            connection.query($sql.insert, [param.name, param.age], function(err, result) {
                if(err) {
                    res.send(err);
                }else{
                    res.send('add success');
                }
                // 释放连接
                connection.release();
            });
        });
    },
    query: function (req, res, next) {
        var {url:url,query} = urlModule.parse(req.url,true)
        pool.getConnection(function(err, connection) {
            connection.query($sql.queryAll + query.t, function(err, result) {
                if(err) res.send(err);
                //console.log(result);
                res.send(result);
                connection.release();
            });
        });
    },
    update: function (req, res, next) {
        pool.getConnection(function(err, connection) {
            var param = req.query || req.params;

            connection.query($sql.update, [param.name, param.age, +param.id], function(err, result) {
                if(err) {
                    res.send(err);
                }else{
                    res.send('update success');
                }

                connection.release();
            });
        });
    },
    delete: function (req, res, next) {
        pool.getConnection(function(err, connection) {
            connection.query($sql.delete, function(err, result) {
                if(err) {
                    res.send(err);
                }else{
                    res.send('delete success');
                }
                connection.release();
            });
        });
    },
    test: function(req, res, next){
        pool.getConnection(function(err, connection) {
            if(err){
                console.log(err)
            } else {
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Content-Type", "application/json");
                const sql = mysql.format('select * from data')
                connection.query(sql, function(err, result) {
                    if(err) {
                        res.send(err);
                    }else{
                        res.send(result);
                    }
                });
                pool.releaseConnection(connection);
            }
        })
    },
    basic_line: function(req, res, next){
        pool.getConnection(function(err, connection){
            if(err){
                console.log(err)
                return;
            } else {
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Content-Type", "application/json");
                const dataset = d3.range(21).map(function(d,i) { return {"y": d3.randomUniform(1)() ,"x": i} })
                res.send(dataset)
            }
        })
    }
};


//add
//http://localhost:3000/users/add?name=test&age=88
//queryAll
//http://localhost:3000/users/query
//upadte
//http://localhost:3000/users/update?id=5&name=test3&age=99
//delete
//http://localhost:3000/users/delete?id=5
