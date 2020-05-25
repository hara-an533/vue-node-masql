const router = require('koa-router')(),
      sha1=require('sha1'),
      msql=require('../lib/dbclass'),
      class1=require('./class1'),
      class2=require('./class2'),
      class3=require('./class3'),
      product=require('../routes/product')


//路由守卫
router.use(async (ctx, next) => {
    //正则表达式
    let rexg = /^[a-zA-Z]{5}$/
    if (ctx.url.includes('login')||ctx.url.includes('loginDo')) {
        await next()
    } else {
        if (!rexg.test(ctx.session.admin)) {
            ctx.redirect('admin/login')
        } else {
            await next()
        }
    }
})

//后台首页
router.get('/', ctx => {
    // console.log("后台跟路由");
    ctx.render('admin',{uname:ctx.session.admin})
})

router.get('/login', ctx => {
    ctx.render('login')
})

//验证登录
router.post('/loginDo',async(ctx)  => {
    // console.log(ctx.request.body);
    let {username,pwd}=ctx.request.body;
    // console.log(username,pwd);  
    //处理数据
    let password=sha1(sha1(pwd)).substring(3,30)
    //验证数据库
    let sql=`SELECT uname FROM admin WHERE uname='${username}' AND pwd='${password}'`
    let res=await msql.query(sql)
    // console.log(res);
    if(res.length>0){
        //已经创建了session了
        ctx.session.admin=username;
        //跳转后台首页
        ctx.redirect('/admin')
    }else {
        ctx.body="登录失败"
    }
})

//退出登录
router.get('/exit',ctx=>{
    ctx.session.admin=''
    ctx.redirect('/admin/login')
})

//一级分类管理
router.use('/class1',class1)

//二级分类管理
router.use('/class2',class2)

//三级分类管理
router.use('/class3',class3)

router.use('/product',product)

//404
router.get('*',ctx=>{
    ctx.body="页面不存在"
})

module.exports = router.routes()