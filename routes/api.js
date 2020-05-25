const router = require('koa-router')(),
    sha1 = require('sha1'),
    msql = require('../lib/dbclass'),
    helper = require('../utils/helper'),
    addtoken = require('../token/createtoken'),
    gettoken=require('../token/gettoken')

router.get('/getclass', async ctx => {
    //获取一级分类的数据
    let sql = `SELECT id,c1name FROM xm_class1 `
    let res = await msql.query(sql)
    ctx.body = res
})

//获取二级三级数据
router.get('/getclass23', async (ctx) => {
    //初始化
    let dataList = []

    let { id } = ctx.query
    // console.log(id);
    // [{class2Title:'xxxx',class3:[{}]}]
    let sql_class2 = `SELECT id,c2name FROM xm_class2 WHERE cid=${id}`
    let res_class2 = await msql.query(sql_class2)
    // console.log(res_class2);

    //遍历class2
    for (let i = 0; i < res_class2.length; i++) {
        //二级分类的id
        let c2id = res_class2[i].id;
        //2级分类的名称
        let c2name = res_class2[i].c2name;
        //根据2级分类的名称和id获取三级分类的数据
        let sql_class3 = `SELECT id,c3name,poster FROM xm_class3 WHERE c2id=${c2id} AND c1id=${id}`
        let res_class3 = await msql.query(sql_class3)

        //遍历，封面地址补全
        res_class3 = res_class3.map((item) => {
            // console.log(item.poster);  //1590023845216.jpg   1590023909952.jpg
            item.poster = helper.host + '/upload/' + item.poster
            return item
        })
        //存入数组
        dataList.push({ class2Title: c2name, class3: res_class3 })
        // console.log(dataList);
    }
    //输出
    ctx.body = dataList;
})
//产品列表
router.get('/getProductList', async ctx => {
    //接收vue三级分类的id
    let { c3id } = ctx.query
    //根据三级分类id获取产品列表
    let sql = `SELECT id,title,comment,price,poster FROM xm_product WHERE c3id=${c3id}`
    let res = await msql.query(sql)
    // console.log(c3id);
    //处理封面,封面地址补全
    res = res.map((item) => {
        item.poster = helper.host + '/upload/' + item.poster
        return item
    })
    ctx.body = res;
})

//产品详情
router.get('/getProductDetial', async ctx => {
    let { pid } = ctx.query
    //获取产品数据
    let sql = `SELECT id,title,price,descript,poster FROM xm_product WHERE id=${pid} LIMIT 1`
    let res = await msql.query(sql)
    // console.log(res[0]);


    
    //获取轮播
    let sql2 = `SELECT url FROM xm_productimg WHERE pid=${pid}`
    let res2 = await msql.query(sql2)

    res2 = res2.map((item) => {
        item.url = helper.host + '/upload/' + item.url
        return item
    })

    res[0].imgs = res2;


    //处理描述图片样式问题
    let newRes = res[0].descript.replace(/<p>/g, '<p style="margin:0;padding:0">')
    res[0].descript = newRes
    ctx.body = res[0]
    // console.log(newRes);
})

//注册
router.post('/reg', async ctx => {
    //接收vue表单注册
    let { username, pwd, tel } = ctx.request.body.params;
    if (username && pwd && tel) {
        let sql = `INSERT INTO xm_user (username,password,tel) VALUES ('${username}','${pwd}','${tel}')`;
        let res = await msql.query(sql)
        if (res.affectedRows > 0) {
            ctx.body = 'success'
        } else {
            ctx.body = 'fail'
        }
    }
})

//验证登录
router.post('/checklogin', async (ctx) => {
    //接收账号
    let { u, p } = ctx.request.body.params
    console.log(u, p);
    //数据库验证
    if (u && p) {
        let sql = `SELECT id FROM xm_user WHERE username="${u}" AND password='${p}'`
        let res = await msql.query(sql)
        if (res.length > 0) {
            //通过验证，创建token，并返回结果
            //创建token
            let tk = addtoken({ username: u, id: res[0].id })
            console.log(tk);
            //返回结果
            ctx.body = {
                tk,
                username: u,
                code: 1,
                status: 200
            }
        } else {
            ctx.body = {
                code:0,
                status: 400
            }
        }
    }
    //创建token  并返回结果
})

//vue我的页面
router.get('/check',ctx=>{
    //获取axios的请求头
    let token=ctx.header.token;
    console.log(token);
    if(token.length>0){
        // 解析token
        let res=gettoken(token)
        // console.log(res);
        if(res&& res.exp<=new Date().getTime()/1000){
            //登录了 但是过期了
            ctx.body={
                msg:'失败，过期',
                code:0
            }
        }else {
            ctx.body={
                msg:'正常',
                code:1
            }
        }
    }else {//没有登录
        ctx.body={
            msg:'失败，无token',
            code:0
        }
    }
})

//搜索
router.get('/search',async ctx =>{
    let{keywords}=ctx.query;
    //搜索语句
    let sql=`SELECT id,title as mane,poster as img,price,comment as ping FROM xm_product WHERE 
    title LIKE '%${keywords}%' OR descript LIKE '%${keywords}%' ORDER BY id DESC`
    console.log(sql);
    
    let res=await msql.query(sql)
    ctx.body=res
})

module.exports = router.routes()