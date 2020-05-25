const router = require('koa-router')(),
    sha1 = require('sha1'),
    msql = require('../lib/dbclass'),
    helper=require('../utils/helper')

//新增
router.get('/add', async ctx => {
    //获取一级分类的数据
    let sql = `SELECT id,c1name FROM xm_class1`
    let res = await msql.query(sql)
    ctx.render('class3_add', { res })
})

//执行新增
router.get('/addDo', async (ctx) => {
    // console.log(ctx.query);
    let { c1id, c2id, title } = ctx.query
    if (title && c1id && c2id) {
        let sql = `INSERT INTO xm_class3 (c1id,c2id,c3name,poster) VALUES (${c1id},${c2id},'${title}','${global.uploadedFileName}')`
        let res = await msql.query(sql)
        if (res.affectedRows > 0) {
            ctx.body = 'success'
        } else {
            ctx.body = 'fail'
        }
    }
    console.log(title);
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
    ctx.body = option
})

//执行图片上传
router.post('/upload', async ctx => {
    let file = ctx.request.files.file;
    let res=helper.upload(file)
    console.log(res);
    
    ctx.body=res;
})

//列表
router.get('/list', async (ctx) => {
    let sql = 'SELECT c3.id,c3.c1id,c1.c1name,c3.c2id,c2.c2name,c3.c3name,c3.poster FROM xm_class3 as c3,xm_class2 as c2,xm_class1 as c1 where c2.id=c3.c2id and c1.id=c3.c1id'
    // let sql=`SELECT c3.id,c1name,c2name,c3name,poster FROM xm_class3 as c3 LEFT JOIN xm_class2 as c2 ON (c3.c2id=c2.cid)`

    let res = await msql.query(sql)
    console.log(res);

    //渲染
    ctx.render('class3_list', { res })
})


//删除
router.get('/del', async (ctx) => {
    let { id } = ctx.query
    if (id) {
        let sql = `DELETE FROM xm_class3 WHERE id=${id}`
        let res = await msql.query(sql)
        if (res.affectedRows > 0) {
            ctx.body = "success"
        } else {
            ctx.body = 'fail'
        }
    }
})
module.exports = router.routes()
