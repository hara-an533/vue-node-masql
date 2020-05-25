const router = require('koa-router')(),
    sha1 = require('sha1'),
    msql = require('../lib/dbclass')

//新增
router.get('/add', async ctx => {
    //获取一级分类的数据
    let sql=`SELECT id,c1name FROM xm_class1`
    let res=await msql.query(sql)
    ctx.render('class2_add',{res})
})

//执行新增
router.get('/addDo', async (ctx) => {
    let { title,c1id } = ctx.query
    if (title&&c1id) {
        let sql = `INSERT INTO xm_class2 (c2name,cid) VALUES ('${title}',${c1id})`
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
    let sql='SELECT c2.id,cid,c1name,c2name FROM xm_class2 as c2 LEFT JOIN xm_class1 as c1 ON (c2.cid=c1.id)'
    let res=await msql.query(sql)
    //渲染
    ctx.render('class2_list',{res})
})


//删除
router.get('/del',async(ctx)=>{
    let {id}=ctx.query
    if(id){
        let sql= `DELETE FROM xm_class2 WHERE id=${id}`
        let res=await msql.query(sql)
        if(res.affectedRows>0){
            ctx.body="success"
        }else {
            ctx.body='fail'
        }
    }
})
module.exports = router.routes()
