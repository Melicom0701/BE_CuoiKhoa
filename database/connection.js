const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '127.0.0.1', // địa chỉ host của MySQL
  user: 'root', // tên đăng nhập
  password: '12345678', // mật khẩu đăng nhập
  database: 'duy' // tên cơ sở dữ liệu
});

// connection.connect(function (err) {
//     if (err) console.log("not connect");
//     console.log('Connected!');
// });

module.exports = connection;

// connection.connect(function(err) {
//     if (err) throw err;
//     console.log('Connected!');
// });
// connection.query('SELECT * FROM Item', function (err, rows) {
//    // if (err) throw err;
//     console.log(err);
//     console.log('Data received from DB:\n');
//     console.log(rows);
// });
// connection.end(function(err) {
//     if (err) throw err;
//     console.log('Connection closed!');
// });
