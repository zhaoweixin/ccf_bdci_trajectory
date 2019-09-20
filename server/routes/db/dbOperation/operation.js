var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var config = require('./dbconfig');
var $sql = require('./sql');

var pool = mysql.createPool( config.mysql );

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
        pool.getConnection(function(err, connection) {
            connection.query($sql.queryAll, function(err, result) {
                if(err) {
                    res.send(err); 
                }else{
                    res.send(result);
                }
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
            var id = +req.query.id;
            connection.query($sql.delete, id, function(err, result) {
                if(err) {
                    res.send(err); 
                }else{
                    res.send('delete success');
                }
                connection.release();
            });
        });
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