const Koa = require('koa'),
    router = require('koa-router')(),
    render = require('koa-art-template'),
    path = require('path'),
    static = require('koa-static'),
    koaBody = require('koa-body'),
    session = require('koa-session'),
    admin = require('./routes/admin'),
    sha1 = require('sha1'),
    api = require('./routes/api'),
    cors = require('koa2-cors')



/////////////////////////////////////////////////////

//实例化对象
const app = new Koa()
const server = require('http').createServer(app.callback())
const io = require('socket.io')(server)

//全局常量
// global.host = 'http://localhost:3030'

//配置静态资源
// app.use(static('statics'))
app.use(static(path.join(__dirname, 'statics')))

//配置模板
render(app, {
    root: path.join(__dirname, 'views'),
    extname: '.html',
    debug: process.env.NODE_ENV !== 'production'
});

//配置koaBody
app.use(koaBody({
    multipart: true
}))

//配置session
app.keys = ['some secret hurr'];

const CONFIG = {
    key: 'koa.sess',
    /** (string) cookie key (default is koa.sess) */
    /** (number || 'session') maxAge in ms (default is 1 days) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    maxAge: 86400000,
    overwrite: true,
    /** (boolean) can overwrite or not (default true) */
    httpOnly: true,
    /** (boolean) httpOnly or not (default true) */
    signed: true,
    /** (boolean) signed or not (default true) */
    rolling: false,
    /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
    renew: false,
    /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
    secure: false,
    /** (boolean) secure cookie*/
    sameSite: null,
    /** (string) session cookie sameSite options (default null, don't set it) */
};

app.use(session(CONFIG, app));

//配置cors
app.use(cors({
    origin: function (ctx) {
        if (ctx.url === '/test') {
            return false;
        }
        return '* ';
    },
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
    maxAge: 5,      //允许时间
    credentials: true, //信任
    allowMethods: ['GET', 'POST', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'Token'],
}));

/////////////////////////////////////////////////////
//创建socket连接
io.on('connect', (socket) => {
    socket.on('message', (msg) => {
        console.log("前端发来的消息:" + msg);
        io.emit("message", '来自服务器端的消息')
    });
    //监听连接断开
    socket.on('disconnect', () => {
        console.log('user disconnected');
    })
})
//首页
router.get('/', ctx => {
    ctx.body = 'HomePage!'
})

//后台管理系统
router.use('/admin', admin)

//密码路由测试
// router.get('/test',(ctx)=>{
//     let pwd='admin'
//     let res=sha1(sha1(pwd))
//     let pwd1=res.substring(3,30)
//     console.log(pwd1)
// })

/////////////////////////////////////////////////////
//api
router.use('/api', api)

//socket
router.get('/socket',async ctx =>{
    //接收表单数据
    let {title} =ctx.query;
    
    io.emit('message',title)
    ctx.body="消息已发送"
})

router.get('/sendmsg',ctx =>{
    ctx.render('sendmsg');  
})

//配置路由
app
    .use(router.routes())
    .use(router.allowedMethods())

//监听服务器
server.listen(3130, () => {
    console.log('run at*3130')
})