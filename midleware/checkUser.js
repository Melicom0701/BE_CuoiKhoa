const jsonwebtoken = require('jsonwebtoken');
const knex = require("../database/knex");
function validateUser(req, res, next) {
    const { name, age } = req.body;
    console.log(req.body);
    const regex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ ]+$/; // biểu thức chính quy kiểm tra tên
    if (!name || !age) {  res.status(400).json({ message: 'Tên hoặc tuổi không được để trống' }); }
    else if (!regex.test(name)) {
        res.status(400).json({ message: 'Tên không được chứa số hoặc kí tự đặc biệt' });
        
    }
    else if(age <= 0) {
        res.status(400).json({ message: 'Tuổi phải lớn hơn 0' });
    }
    else {
        next();
    }
}
//hàm kiểm tra role
async function kiemTraQuyenTruyCap(role, permission) {
  return true;
}

function checkAccess(permission) {
    return async (req, res, next) => {
       next();
    };
}

module.exports={validateUser,checkAccess} ;