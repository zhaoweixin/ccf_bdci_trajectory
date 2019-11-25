var mysql = require('mysql');
var $sql = require('./sql');
var MysqlPool = require('./mysql_pool.js');
var urlModule = require('url');
var d3 = require('d3');

var mysqlPool = new MysqlPool();
var pool = mysqlPool.getPool();

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

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
            
            let sql = $sql.queryAll+req.query.table
            
            connection.query(sql, function(err, result) {
                if(err){
                    console.log('query->', sql)
                    res.send(err)
                };
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
        console.log('request from basic_line')
        //console.log(req.body)
        pool.getConnection(function(err, connection){
            if(err){
                console.log(err)
                return;
            } else {
                let typeDict = {
                    '0': {
                        'name': '运输需求量',
                        'halftable': 'ordercount',
                        'yLabel': 'Sum', // 'Sum / Day' or 'Sum / Week'
                        'xLabel': 'Day'
                    },
                    '1': {
                        'name': '运输距离',
                        'halftable': 'distance',
                        'yLabel': 'Distance', // 'Distance / Day' or 'Distance / Week'
                        'xLabel': 'Day'
                    },
                    '2': {
                        'name': '运输流向',
                        'halftable': 'angle',
                        'yLabel': 'Angle',
                        'xLabel': 'Day'
                    },
                    '3': {
                        'name': '运行时间',
                        'halftable': 'time',
                        'yLabel': 'Time', // 'Time / Day' or 'Time / Week'
                        'xLabel': 'Day'
                    },
                    '4': {
                        'name': '运行速度',
                        'halftable': 'speed',
                        'yLabel': 'Speed',
                        'xLabel': 'Day'
                    }
                }
                let dataType = req.body.config.legend_val,
                        unit = req.body.config.unit,
                        sql = '',
                        resData = []
                    
                if(unit == 'Hour'){ unit = 'h_'}
                else if(unit == 'Day'){ unit = 'd_'}
                else if(unit == 'All'){ unit = 'a_'}
                
                //update unit in typeDict
                for(key in typeDict){
                    typeDict[key].yLabel = typeDict[key].yLabel + ' / ' + req.body.config.unit
                }

                if(req.body.config.unit == 'Day' || req.body.config.unit == 'Hour'){
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
                                xScale_max = parseInt(Math.max.apply(null,xScale))
                                xScale_min = parseInt(Math.min.apply(null,xScale))
                                yScale_max = parseInt(Math.max.apply(null,yScale))
                                yScale_min = parseInt(Math.min.apply(null,yScale))
    
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
                                    'yScale': [yScale_min, yScale_max],
                                    'xLabel': '',
                                    'yLabel': ''
                                })
                            })
    
                            resData.forEach((d,i) => {
                                let ind = req.body.config.legend_val[i]
                                d.xLabel = typeDict[ind].xLabel
                                d.yLabel = typeDict[ind].yLabel
                            })
                            res.setHeader("Access-Control-Allow-Origin", "*");
                            res.send(resData)
                        }
                    })
                    //let t = d3.range(21).map(function(d,i) { return {"y": d3.randomUniform(1)() ,"x": scale(i)} })
                } else if (req.body.config.unit == 'All'){
                    dataType.forEach((d,i) => {
                        sql = sql + 'select * from ' + unit + typeDict[d]['halftable'] + '; '
                    })
                    //sql = 'select * from allTrafficCount'

                    console.log('basic_line ->', sql)
                    connection.query(sql, (err, result) => {
                        if(err){
                            res.send(err);
                        } else {
                            result = JSON.parse(JSON.stringify(result))
                            
                            if(dataType.length == 1){
                                result = [result]
                            }
                            result.forEach((d,i) => {
                                yScale = d.map( v => +v.count)
                                xScale = d.map( v => v.date)
                                yScale_max = parseInt(Math.max.apply(null,yScale))
                                yScale_min = parseInt(Math.min.apply(null,yScale))
                                _yscale = d3.scaleLinear().domain([+yScale_min, +yScale_max]).range([0, 1])
                                arr = []
                                for(var j=0; j < d.length; j++){
                                    arr.push({'x': d[j].date ,'y':_yscale(+d[j].count)})
                                    //d[j].count = _yscale(+d[j].count)
                                }
                                resData.push({
                                    'name': req.body.config.legend[i],
                                    'values': arr,
                                    'xScale': xScale,
                                    'yScale': [yScale_min, yScale_max],
                                    'xLabel': 'date',
                                    'yLabel': 'count'
                                })
                            })

                            resData.forEach((d,i) => {
                                let ind = req.body.config.legend_val[i]
                                d.yLabel = typeDict[ind].yLabel
                            })

                            res.setHeader("Access-Control-Allow-Origin", "*");
                            res.send(resData)
                        }
                    })
                }
            }
        })
    },
    poi_haikou:function (req, res, next) {
        pool.getConnection(function (err, connection) {
            connection.query(`select * from poi_haikou ${req.query.sql}`, function (err, result) {
                if (err){
                    console.log('poi_haikou ->' + req.query.sql)
                    res.send(err);
                } 
                //console.log(result);
                
                res.send(result);
                connection.release();
            });
        });
    },
    feature_line:function(req, res, next){
        
        pool.getConnection(function(err, connection) {
            /*
                req.body = {val: '1'}
            */
            let sql_dict = {
                '0': 'rain',
                '1': 'holiday'
            }
            let sql_key = sql_dict[req.body.val]
            connection.query(`select time,${sql_key} from feature_line`, function(err, result){
                result = JSON.parse(JSON.stringify(result))
                if (err){
                    console.log('select time, * from feature_line')
                    res.send(err);
                } 
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.send(result)
                //res.send(resData)
            })
        })
    },
    para_line: function(req, res, next){
        pool.getConnection(function(err, connection){
            /*
                req.body = {'table', 'vector'}
            */
            let sql_key = req.body.table
            console.log('para_line ->', sql_key)
            connection.query(`select * from ${sql_key}`, function(err, result){
                result = JSON.parse(JSON.stringify(result))
                if(err){
                    console.log('select para_line from ->', sql_key)
                    res.send(err)
                } 
                let species = []
                result.forEach((d,i) => {
                    if(species.indexOf(d.cluster) == -1){
                        species.push(d.cluster)
                    }
                })

                let obj = {
                    'type': req.body.table,
                    'data': result,
                    'dimensions': ['f1', 'f2', 'f3', 'f4', 'f5'],
                    'species': species.sort() //cluster
                }
                
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.send(obj)
            })
            
        })
    },
    rect_detail: function(req, res, next){
        pool.getConnection(function(err, connection){
            //let sql_key = req.body.table
            //block_daily_flowin -> select * from block_overview_flowin where target = 'xxxx' + '; ' sort↓
            //block_overview_flowout -> select * from block_overview_flowout where source = 'xxxx' + '; ' sort↓
            //block_overview_flowratio -> select * from block_overview_flowratio where geo = 'xxxx' + '; '
                //ratio = 1 all flowin / ratio = -1 all flowout
            //block_daily_flowin -> select * from block_daily_flowin where geo = 'xxxx' + '; '
                //according startdate and enddate construct [[date, average, count], [date, average, count]]
            //block_daily_flowout -> select * from block_daily_flowout where geo = 'xxxx' + '; '
                //according startdate and enddate construct [[date, average, count], [date, average, count]]
            
            let geohash = req.body.geohash,
                dailytable = ['block_daily_flowin', 'block_daily_flowout'],
                overviewtable = ['block_overview_flowin', 'block_overview_flowout', 'block_overview_flowratio'],
                sql = `select * from block_overview_flowin where source = '${geohash}'; 
                select * from block_overview_flowout where source = '${geohash}';  
                select * from block_overview_flowratio where geo = '${geohash}'; 
                select * from block_daily_flowin where geo = '${geohash}'; 
                select * from block_daily_flowout where geo = '${geohash}';` 
                
                connection.query(sql, function(err, data){
                    if(err){ res.send(err);}
                    else{
                        data = JSON.parse(JSON.stringify(data))
                        let block_overview_flowin = data[0],
                            block_overview_flowout = data[1],
                            block_overview_flowratio = data[2][0],
                            block_daily_flowin = data[3][0],
                            block_daily_flowout = data[4][0],
                            start_date = data[3][0]['startdate'],
                            end_date = data[3][0]['enddate'],
                            resdata = {}
                        
                        //sort
                        block_overview_flowin.sort((a,b) => (+a.count > +b.count) ? -1 : ((+b.count > +a.count) ? 1 : 0));
                        block_overview_flowout.sort((a,b) => (+a.count > +b.count) ? -1 : ((+b.count > +a.count) ? 1 : 0));
                        //cut length up to 20
                        block_overview_flowin = block_overview_flowin.slice(0, 20)
                        block_overview_flowout = block_overview_flowout.slice(0, 20)

                        //construct date format
                        block_daily_flowin['average'] = block_daily_flowin['average'].toString().substring(1, block_daily_flowin['average'].length-1)
                        block_daily_flowin['average'] = block_daily_flowin['average'].split(',')
                        block_daily_flowin['average'] = block_daily_flowin['average'].map(v => +v)

                        block_daily_flowin['count'] = block_daily_flowin['count'].toString().substring(1, block_daily_flowin['count'].length-1)
                        block_daily_flowin['count'] = block_daily_flowin['count'].split(',')
                        block_daily_flowin['count'] = block_daily_flowin['count'].map(v => +v)

                        block_daily_flowout['average'] = block_daily_flowout['average'].toString().substring(1, block_daily_flowout['average'].length-1)
                        block_daily_flowout['average'] = block_daily_flowout['average'].split(',')
                        block_daily_flowout['average'] = block_daily_flowout['average'].map(v => +v)

                        block_daily_flowout['count'] = block_daily_flowout['count'].toString().substring(1, block_daily_flowout['count'].length-1)
                        block_daily_flowout['count'] = block_daily_flowout['count'].split(',')
                        block_daily_flowout['count'] = block_daily_flowout['count'].map(v => +v)
                        
                        block_daily_flowin['timerange'] = getDates(start_date, end_date)
                        block_daily_flowout['timerange'] = getDates(start_date, end_date)

                        resdata = {
                            'block_overview_flowin': block_overview_flowin,
                            'block_overview_flowout': block_overview_flowout,
                            'block_overview_flowratio': block_overview_flowratio,
                            'block_daily_flowin': block_daily_flowin,
                            'block_daily_flowout': block_daily_flowout
                        }

                        res.setHeader("Access-Control-Allow-Origin", "*");
                        res.send(resdata)
                        
                        function getDates(startDate, stopDate) {
                            startDate = new Date(startDate)
                            stopDate = new Date(stopDate)
                            var dateArray = new Array();
                            var currentDate = startDate;
                            while (currentDate <= stopDate) {
                                dateArray.push(new Date (currentDate).toISOString().split('T')[0]);
                                currentDate = currentDate.addDays(1);
                            }
                            return dateArray;
                        }
                    }
                })
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
