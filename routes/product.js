const router = require('koa-router')(),
    msql = require('../lib/dbclass'),
    helper = require('../utils/helper'),
    path = require('path'),
    fs = require('fs')

//产品新增
router.get('/add', async ctx => {
    //获取一级分类
    //获取一级分类的数据
    let sql = `SELECT id,c1name FROM xm_class1`
    let res = await msql.query(sql)
    ctx.render('product_add', { res })
})

//获取二级分类数据
router.get('/getclass2', async ctx => {
    let { c1id } = ctx.query
    let option = ''
    //根据一级分类id获取二级分类数据
    let sql = `SELECT id,c2name FROM xm_class2 WHERE cid=${c1id}`
    let res = await msql.query(sql)
    //转换成html
    for (let i = 0; i < res.length; i++) {
        option += '<option value="' + res[i].id + '">' + res[i].c2name + '</option>'
    }
    ctx.body = "<option value=''>请选择二级分类</option>" + option
})

//获取三级分类数据
router.get('/getclass3', async ctx => {
    let { c2id } = ctx.query
    let option = ''
    //根据一级分类id获取二级分类数据
    let sql = `SELECT id,c3name FROM xm_class3 WHERE c2id=${c2id}`
    let res = await msql.query(sql)
    //转换成html
    for (let i = 0; i < res.length; i++) {
        option += '<option value="' + res[i].id + '">' + res[i].c3name + '</option>'
    }
    ctx.body = "<option value=''>请选择三级分类</option>" + option
})

//执行图片上传
router.post('/upload', async ctx => {
    let file = ctx.request.files.file;
    let res = helper.upload(file)
    // console.log(res);

    ctx.body = res;
})

//表单上传
router.post('/submit', async ctx => {
    let { class1, class2, class3, title, price, comment, desc } = ctx.request.body;
    let fileName = global.uploadedFileName;
    let dt = new Date().getTime()
console.log(fileName);

    //接收轮播
    let fileData = ctx.request.files.photos

    //转义
    desc = desc.replace(/\"/g, '\'')
    //入库
    if (class1 && class2 && class3 && title) {
        let sql = `INSERT INTO xm_product (c1id,c2id,c3id,title,price,comment,poster,descript,dt) VALUES 
        (${class1},${class2},${class3},"${title}",${price},'${comment}','${fileName}',"${desc}",${dt})`
        let res = await msql.query(sql)

        if (res.affectedRows > 0) {
            ctx.body = 'success'
            let tempArr = []
            //获取插入的id
            let pid = res.insertId;


            //上传缩略图
            for (let i = 0; i < fileData.length; i++) {
                let fname = helper.upload(fileData[i], i, 'multiple')
                tempArr.push(fname)
            }

            if (tempArr.length > 0) {
                let values = ''
                for (let j = 0; j < tempArr.length; j++) {
                    values += `(${pid},'${tempArr[j]}'),`
                }
                //去掉最后的逗号
                values = values.substring(0, values.length - 1)
                //插入语句
                let sql2 = `INSERT INTO xm_productimg (pid,url) VALUES ${values}`
                //执行语句
                let res2 = await msql.query(sql2)
            }
        } else {
            ctx.body = 'fail'
        }
    } else {
        ctx.body = "缺少参数"
    }

})

//列表
router.get('/list', async (ctx) => {
    // let sql = 'SELECT c3.id,c3.c1id,c1.c1name,c3.c2id,c2.c2name,c3.c3name,c3.poster FROM xm_class3 as c3,xm_class2 as c2,xm_class1 as c1 where c2.id=c3.c2id and c1.id=c3.c1id'
    // let sql=`SELECT c3.id,c1name,c2name,c3name,poster FROM xm_class3 as c3 LEFT JOIN xm_class2 as c2 ON (c3.c2id=c2.cid)`
    let sql = `SELECT p.id,title,c1name,c2name,c3name,p.poster FROM xm_product as p LEFT JOIN xm_class3 as c3 ON (p.c3id=c3.id) LEFT JOIN xm_class2 as c2 ON (p.c2id=c2.id) LEFT JOIN xm_class1 as c1 ON(p.c1id=c1.id)`
    let res = await msql.query(sql)
    // console.log(res);

    //渲染
    ctx.render('product_list', { res })
})

//删除
router.get('/del', async (ctx) => {
    //要删除的id
    let { id } = ctx.query
    if (id) {
        //获取要删除的文件
        let sql_img = `SELECT url FROM xm_productimg WHERE pid=${id}`
        let res_img = await msql.query(sql_img)
        // console.log(res_img);
        if (res_img.length > 0) {
            for (let i = 0; i < res_img.length; i++) {
                let fileName = res_img[i].url
                let fullPath = path.join(__dirname.slice(0, -6), 'statics/upload/' + fileName)
                // console.log(fullPath);
                //判断文件是否存在
                let isExist = fs.existsSync(fullPath)
                if (isExist) {
                    fs.unlinkSync(fullPath)
                }
            }
        }
        //获取要删除的封面文件名
        let sql_poster = `SELECT poster FROM xm_product WHERE id=${id} LIMIT 1`
        let res_poster = await msql.query(sql_poster)
        if (res_poster[0].poster && res_poster[0].poster != 'undefined') {
            let poster = res_poster[0].poster
            let fullPathPoster = path.join(__dirname.slice(0, -6), 'statics/upload/' + poster)
            // console.log(fullPathPoster);

            //判断文件是否存在
            let isExistPoster = fs.existsSync(fullPathPoster)
            if (isExistPoster) {
                fs.unlinkSync(fullPathPoster)
            }
        }

        //删除缩略图表
        let sql_data1 = `DELETE FROM xm_productimg WHERE pid=${id}`
        let res2 = await msql.query(sql_data1)
        //删除主表数据
        let sql_data2 = `DELETE FROM xm_product WHERE id=${id}`
        let res = await msql.query(sql_data2)
        if (res.affectedRows > 0) {
            ctx.body = 'success'
        } else {
            ctx.body = 'fail'
        }
    } else {
        ctx.body = "fail"
    }
})


module.exports = router.routes()