const mysql = require('mysql'),
      dbconfig = require('./dbconfig')

class MSQL {

    //在构造函数中创建数据库连接
    constructor(){

        //创建连接池
        let pool = mysql.createPool({...dbconfig})

        //创建连接
        pool.getConnection((err,connection) =>{
            if (err){
                console.log(err)
            } else {
                console.log('数据库连接成功!!!!')
                //创建连接对象，把它存到对象的属性中
                this.con = connection
            }
        })
    }

    //执行数据库操作
    query(sql){
        return new Promise((resolve,reject) =>{
            this.con.query(sql,(err,res) =>{
                if (err){
                    reject(err)
                } else {
                    resolve(res)
                }
            })

        })
    }

}

//创建实例
module.exports = new MSQL()