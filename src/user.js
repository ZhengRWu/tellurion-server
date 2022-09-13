const { hash_get, formatDate, formatYearDate } = require("./tool")


function transform_data_toString(arr) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].file_size > 1048576 && arr[i].file_size <= 1073741824) {
            arr[i].file_size = `${(arr[i].file_size / 1048576).toFixed(2)} MB`
        } else if (arr[i].file_size > 1073741824) {
            arr[i].file_size = `${(arr[i].file_size / 1073741824).toFixed(2)} GB`
        } else if (arr[i].file_size > 1024 && arr[i].file_size <= 1048576) {
            arr[i].file_size = `${(arr[i].file_size / 1024).toFixed(2)} KB`
        } else if (arr[i].file_size < 1024) {
            arr[i].file_size = `${arr[i].file_size} B`
        }
    }
    return (arr)
}

let register = async (user_id, password, ip) => {
    // function register(user_id, password, ip) {
    var timestamp = new Date().getTime()
    var str_ = `dadslglnx_${timestamp}_${user_id}_${password}`
    var token = hash_get(str_)
    var password = hash_get(password)

    // var sql = global.sqlitedb.prepare(`insert into user_info values ('${user_id}', '${token}''${password}', '${ip}') `)

    return new Promise((resolve, reject) => {
        global.sqlitedb.exec(`insert into user_info values ('${user_id}', '${token}','${password}', '${ip}') `, (info) => {
            if (info != null) {
                if (info.errno == 19) {
                    resolve("用户已存在")
                }
            } else {
                resolve(`insert into user_info values ('${user_id}', '${token}','${password}', '${ip}') 成功`)
            }

        })
    })
}

let login = async (user_id, password) => {
    var password = hash_get(password)
    return new Promise((resolve, reject) => {
        global.sqlitedb.all(`select password from user_info where user_id='${user_id}'`, (err, row) => {
            if (row.length === 0) {
                resolve({ code: 11002, value: "User ID is not registered" })
            } else if (row[0].password === password) {
                var timestamp = new Date().getTime()
                var str_ = `dadslglnx_${timestamp}_${user_id}_${password}`
                var token = hash_get(str_)
                global.sqlitedb.exec(`update user_info set token='${token}' where user_id='${user_id}'`, (info) => {
                    resolve({ code: 11000, value: token })
                })
            } else {
                resolve({ code: 11001, value: "Password err" })
            }
        })
    })

}

let upload_file_metadata = async (token, file_size, file_name, note, file_path) => {
    return new Promise((resolve, reject) => {
        global.sqlitedb.all(`select user_id from user_info where token='${token}'`, (err, row) => {
            if (row.length === 0) {
                resolve({ code: 11003, value: "State err" })
            } else {
                var chunks_sum = Number.parseInt(file_size / 10485760)
                if(chunks_sum === 0){
                    chunks_sum = 1
                }
                var date = new Date().getTime()
                var file_id = hash_get(`${file_size}_${file_name}_${date}`)
                global.sqlitedb.exec(`insert into file_list values ('${file_id}', ${file_size},${chunks_sum}, '${file_name}',${date},'${row[0].user_id}', '${note}','${file_path}') `, (info) => {
                    resolve({ code: 11000, value: file_id })
                })
            }
        })
    })
}

let get_file_list = async (token, page, limit) => {
    return new Promise((resolve, reject) => {
        global.sqlitedb.all(`select user_id from user_info where token='${token}'`, (err, row) => {
            if (row.length === 0) {
                resolve({ code: 11003, value: "State err" })
            } else {
                global.sqlitedb.all("SELECT COUNT(file_id) FROM file_list", (err, row) => {
                    var all_num = row[0]["COUNT(file_id)"]
                    global.sqlitedb.all(`SELECT file_id, file_size, file_name, date, user_name, note FROM file_list fl left join user_info ui ON fl.user_id  = ui.user_id limit ${limit} offset ${limit * (page - 1)}
                `, (err, row) => {
                        for (var i = 0; i < row.length; i++) {
                            row[i].date = formatDate(row[i].date)
                        }
                        row = transform_data_toString(row)
                        resolve({ code: 0, count: all_num, data: row })
                    })
                })
            }
        })
    })
}

var search_file = async (token, user_name, file_name, page, limit) => {
    return new Promise((resolve, reject) => {
        global.sqlitedb.all(`select user_id from user_info where token='${token}'`, (err, row) => {
            if (row.length === 0) {
                resolve({ code: 11003, value: "State err" })
            } else {
                if (user_name === "" && file_name === "") {
                    resolve({ code: 11011, msg: "WARNING:Enter at least one word" })
                }
                global.sqlitedb.all(`SELECT COUNT(*)  FROM file_list fl right join user_info ui on fl.user_id = ui.user_id WHERE user_name LIKE '%${user_name}%' AND file_name LIKE '%${file_name}%'`, (err, row) => {
                    var all_num = row[0]["COUNT(*)"]
                    global.sqlitedb.all(`SELECT file_id, file_size, file_name, date, user_name, note FROM file_list fl right join user_info ui on fl.user_id = ui.user_id WHERE user_name LIKE '%${user_name}%' AND file_name LIKE '%${file_name}%' limit ${limit} offset ${limit * (page - 1)}`, function (err, row) {
                        transform_data_toString(row)
                        resolve({ code: 0, count: all_num, data: row })
                    })
                })
            }
        })
    })
}

var get_share_file = function (token) {
    return new Promise((resolve, reject) => {
        global.sqlitedb.all(`select user_id from user_info where token='${token}'`, (err, row) => {
            if (row.length === 0) {
                resolve({ code: 11003, value: "State err" })
            } else {
                global.sqlitedb.all(`SELECT file_id, file_name,file_path, file_size, date, note FROM file_list WHERE user_id = "${row[0].user_id}" `, (err, row) => {
                    transform_data_toString(row)
                    resolve({ code: 0, data: row })
                })
            }
        })
    })
}


var get_target_ip = function (token,file_id) {
    return new Promise((resolve, reject) => {
        global.sqlitedb.all(`select user_id from user_info where token='${token}'`, (err, row) => {
            if (row.length === 0) {
                resolve({ code: 11003, value: "State err" })
            } else {
                global.sqlitedb.all(`SELECT ui.ip, ui.port FROM file_list fl right join user_info ui on fl.user_id = ui.user_id WHERE fl.file_id = '${file_id}'`,(err,row)=>{
                    resolve({code:11000, data:row[0]})
                })
             }
        })
    })
}

var get_target_file = function(token,file_id){
    return new Promise((resolve, reject) => {
        global.sqlitedb.all(`select user_id from user_info where token='${token}'`, (err, row) => {
            if (row.length === 0) {
                resolve({ code: 11003, value: "State err" })
            } else {
                global.sqlitedb.all(`SELECT file_path from file_list WHERE file_id = '${file_id}'`,(err,row)=>{
                    resolve({code:11000, data:row[0]})
                })
            }
        })
    })
}


module.exports = {
    register: register,
    login: login,
    upload_file_metadata: upload_file_metadata,
    get_file_list: get_file_list,
    search_file: search_file,
    get_share_file: get_share_file,
    get_target_ip:get_target_ip,
    get_target_file:get_target_file
}