const path = require('path'),
      fs = require('fs')

const helper = {
    //主机名
    host:'http://localhost:3030',
    //文件上传
    upload: function (file, index = 0, tag = '') {
        //创建新文件名
        let newFileName = new Date().getTime() + index
        //文件的扩展名
        let splitArr = file.name.split('.')
        let extension = splitArr[splitArr.length - 1]
        let newFullPath = 'statics/upload/'+ newFileName + '.' + extension
        //创建可读流
        let readStream = fs.createReadStream(file.path)
        //创建可写入流
        let writeStream = fs.createWriteStream(newFullPath)
        //管道流
        let res = readStream.pipe(writeStream)
        if (tag == 'multiple') {
            return newFileName + '.' + extension
        } else {
            //处理上传结果
            if (res.path) {
                //全局保存上传的文件名称
                global.uploadedFileName = newFileName + '.' + extension
                //输出
                return 1
            } else {
                return 0
            }
        }
    }
}

module.exports = helper