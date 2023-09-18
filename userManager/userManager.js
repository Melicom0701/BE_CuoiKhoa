const express = require('express');
const user_router = express.Router();
const validateUser = require('../midleware/checkUser').validateUser;
const checkAccess = require('../midleware/checkUser').checkAccess;
const knex = require("../database/knex");
const jsonwebtoken = require('jsonwebtoken');
const upload = require('../multerConfig');
const { hashPass } = require('../helper/hashing')
const env = require('dotenv');
var FormData = require('form-data');
env.config();

user_router.use(express.json());
user_router.use(express.urlencoded({ extended: true }));

//get total record
user_router.get('/total-records', checkAccess("View user"), async (req, res) => {
    try {
        const totalRecordsQuery = knex('user').count('id as totalCount').first();
        const totalRecordsResult = await totalRecordsQuery;

        if (!totalRecordsResult || totalRecordsResult.totalCount === undefined) {
            return res.status(500).send("Error while getting total user count.");
        }

        const totalRecords = totalRecordsResult.totalCount;

        res.send({ totalRecords });
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred.");
    }
});


//get list user
user_router.get('/', checkAccess("View user"), (req, res) => {
    let pageNumber = req.query.page;
    const PAGE_SIZE = req.query.pagesize || 2;
    if (pageNumber) {
        // pagination
        pageNumber = parseInt(pageNumber)-1;
        if (pageNumber >= 0) {
            const skip = pageNumber * PAGE_SIZE;
            knex
                .select('user.*', 'roles.name as role_name') // Lấy thông tin từ cả bảng user và bảng user_roles
                .from('user')
                .leftJoin('user_roles', 'user.id', 'user_roles.user_id') // LEFT JOIN để kết hợp bảng user_roles
                .leftJoin('roles', 'user_roles.role_id', 'roles.id') // LEFT JOIN để kết hợp bảng roles
                .limit(PAGE_SIZE)
                .offset(skip)
                .then((result) => {
                    res.send(result);
                }).catch((err) => {
                    throw err;
                });
        } else {
            res.status(400).send("Số trang không hợp lệ");
        }
    } else {
        //get all
        knex
            .select('user.*', 'roles.name as role_name') // Lấy thông tin từ cả bảng user và bảng user_roles
            .from('user')
            .leftJoin('user_roles', 'user.id', 'user_roles.user_id') // LEFT JOIN để kết hợp bảng user_roles
            .leftJoin('roles', 'user_roles.role_id', 'roles.id') // LEFT JOIN để kết hợp bảng roles
            .then((result) => {
                res.send(result);
            }).catch((err) => {
                throw err;
            });
    }
});


// Lấy chi tiết user
user_router.get('/id/:id', checkAccess("View user"), async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const result = await knex
            .select('user.*', 'user_roles.role_id as role')
            .from('user')
            .leftJoin('user_roles', 'user.id', 'user_roles.user_id')
            .where('user.id', id);

        if (result.length > 0) {
            res.send(result);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occurred: ' +err.message });
    }
});


// Thêm user mới
user_router.post('/', upload.single('avatar'), validateUser, checkAccess("Add user"), async (req, res) => {
    const author = req.headers.authorization.substring(7);
    const id = jsonwebtoken.verify(author, process.env.secretKey).id;
    const { name, age, gender, password, email, username, userRole, status } = req.body;
    console.log(req.body);
    const avatarFilename = req.file ? req.file.filename : null;
    const { hashPassword, salt } = hashPass(password);
            const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
            try {
                const insertedUserIds = await knex('user').insert({
                    name: name,
                    age: age,
                    gender: gender,
                    password: hashPassword,
                    salt: salt,
                    email: email,
                    username: username,
                    CreatedAt: createdAt,
                    createdby: id,
                });

                const userId = insertedUserIds[0]; // Lấy ID của người dùng đã được chèn

                // Thêm vai trò của người dùng vào bảng user_role
                await knex('user_roles').insert({
                    user_id: userId,
                    role_id: userRole
                });

                res.status(200).json({ message: 'User added' });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Failed to add user' });
            }
        } 
);


// Cập nhật thông tin user
user_router.put('/:id', validateUser, checkAccess("Edit user"), async (req, res) => {
    const id = parseInt(req.params.id);
    // Kiểm tra quyền truy cập
        const updatedUser = {
            name: req.body.name,
            age: req.body.age,
            gender: req.body.gender,
            email: req.body.email,
            username: req.body.username,
            status: req.body.status,
            CreatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
        };
        try {
            await knex('user').where('id', id).update(updatedUser);
            // Thay đổi vai trò của người dùng trong bảng user_role
            if (req.body.role) {
                const newRoleId = req.body.role; // ID của vai trò mới
                await knex('user_roles')
                        .where('user_id', id)
                        .update({ role_id: newRoleId });

                res.status(200).json({ message: 'User +role updated' });
                } 
            else {
                res.status(200).json({ message: 'User updated' });
            }
        } catch (error) {
            console.error(error);
            res.status(404).json({ message: 'User not found' });
        }
    });


// Xóa user
user_router.delete('/:id', checkAccess("Delete user"),async (req, res) => {
    const id = parseInt(req.params.id);
        knex('user').where('id', id).del().then(() => {
            res.status(200).json({ message: 'User deleted' });
        }).catch((err) => {
            console.log(err);
            res.status(404).json({ message: 'User not found' });
        });
    });

// Exports cho biến user_router
module.exports = user_router;
