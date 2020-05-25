const router = require('koa-router')(),
    sha1 = require('sha1'),
    msql = require('../lib/dbclass')

//新增
router.get('/add', ctx => {
    ctx.render('class1_add')
})

//执行新增
router.get('/addDo', async (ctx) => {
    let { title } = ctx.query
    if (title) {
        let sql = `INSERT INTO xm_class1 (c1name) VALUES ('${title}')`
        let res = await msql.query(sql)
        if (res.affectedRows > 0) {
            ctx.body = 'success'
        } else {
            ctx.body = 'fail'
        }
    }
    // console.log(title);
})

//列表
router.get('/list',async(ctx)=>{
    let sql='SELECT id,c1name FROM xm_class1'
    let res=await msql.query(sql)
    //渲染
    ctx.render('class1_list',{res})
})


//删除
router.get('/del',async(ctx)=>{
    let {id}=ctx.query
    if(id){
        let sql= `DELETE FROM xm_class1 WHERE id=${id}`
        let res=await msql.query(sql)
        if(res.affectedRows>0){
            ctx.body="success"
        }else {
            ctx.body='fail'
        }
    }
})
module.exports = router.routes()
