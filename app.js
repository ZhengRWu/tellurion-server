const express = require('express')
const router = require('./router')
const cors = require('cors') // 导入跨域中间件
const sqlite3 = require('sqlite3').verbose();
// 初始化数据库
var file = 'db';
global.sqlitedb = new sqlite3.Database(file);

const app = express()
app.use(cors()) // 在router之前启用跨域
app.use(router)

app.listen(80, '0.0.0.0', () => {
    console.log('expreess server running at http://127.0.0.1')
})
