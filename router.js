var expreess = require('express')
const { register, login, upload_file_metadata, get_file_list, search_file, get_share_file, get_target_ip, get_target_file } = require('./src/user')
var router = expreess.Router()

router.get('/register', async function (req, res) {
    let rg = await register(req.query.user_id, req.query.password, `${req.ip}`)
    res.send(rg)
})

router.get('/login', async function (req, res) {
    var data = await login(req.query.user_id, req.query.password)
    res.send(data)
})

router.get('/upload_file_metadata', async function (req, res) {
    var data = await upload_file_metadata(req.query.token, req.query.file_size, req.query.file_name, req.query.note,req.query.file_path)
    res.send(data)
})

router.get('/get_file_list', async function (req, res) {
    var data = await get_file_list(req.query.token, req.query.page, req.query.limit)
    res.send(data)
})

router.get('/search_file', async function (req, res) {
    var data = await search_file(req.query.token, req.query.user_name, req.query.file_name, req.query.page, req.query.limit)
    res.send(data)
})

router.get('/get_share_file', async function (req, res) {
    var data = await get_share_file(req.query.token)
    res.send(data)
})

router.get('/get_target_ip', async function(req, res){
    var data = await get_target_ip(req.query.token, req.query.file_id)
    res.send(data)
})

router.get('/get_target_file', async function(req, res){
    var data = await get_target_file(req.query.token, req.query.file_id)
    res.send(data)
})
module.exports = router