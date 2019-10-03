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
        
        console.log(req.body)
        pool.getConnection(function(err, connection){
            if(err){
                console.log(err)
                return;
            } else {
                let typeDict = {
                    '0': {
                        'name': '运输需求量',
                        'halftable': 'ordercount_mean'
                    },
                    '1': {
                        'name': '运输距离',
                        'halftable': 'distance_mean'
                    },
                    '2': {
                        'name': '运输流向',
                        'halftable': 'angle'
                    },
                    '3': {
                        'name': '起运时间',
                        'halftable': 'time_mean'
                    }
                }

                let dataType = req.body.config.legend_val,
                    unit = req.body.config.unit == 'Hour' ? 'h_' : 'd_',
                    sql = '',
                    resData = []
                dataType.forEach((d,i) => {
                    sql = sql + 'select * from ' + unit + typeDict[d]['halftable'] + '; '
                })
                connection.query(sql, function(err, result){
                    if(err){
                        res.send(err);
                    } else {
                        //res.setHeader("Access-Control-Allow-Origin", "*");
                        //res.send(result)
                        result = JSON.parse(JSON.stringify(result))
                        if(dataType.length == 1){
                            result = [result]
                        }

                        result.forEach((d,i) => {
                            xScale = d.map( v => +v.x)
                            yScale = d.map( v => +v.y)
                            xScale_max = Math.max.apply(null,xScale)
                            xScale_min = Math.min.apply(null,xScale)
                            yScale_max = Math.max.apply(null,yScale)
                            yScale_min = Math.min.apply(null,yScale)

                            _yscale = d3.scaleLinear().domain([yScale_min, yScale_max]).range([0, 1])
                            _xscale = d3.scaleLinear().domain([xScale_min, xScale_max]).range([0, 1])

                            for(var j=0; j< d.length; j++){
                                d[j].x = _xscale(+d[j].x)
                                d[j].y = _yscale(+d[j].y)
                            }

                            resData.push({
                                'name': req.body.config.legend[i],
                                'values': d,
                                'xScale': [xScale_min, xScale_max],
                                'yScale': [yScale_min, yScale_max]
                            })
                        })
                        res.setHeader("Access-Control-Allow-Origin", "*");
                        res.send(resData)
                    }
                })
                //let t = d3.range(21).map(function(d,i) { return {"y": d3.randomUniform(1)() ,"x": scale(i)} })

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
