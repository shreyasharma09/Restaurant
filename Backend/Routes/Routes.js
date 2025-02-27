const express = require("express")
const { handleResponse, handleError } = require("../Responses/Responses")
const Users = require("../Tables/UserTable")
const Category = require("../Tables/CategoryTable")
const { generateotp, verifyotp } = require("../Services/OtpService/OTPService")
const { otptoemailforverification } = require("../Services/EmailService/EmailService")
const jwt = require("jsonwebtoken")
const Routes = express.Router()
const { checkUserDetails } = require("../Middlewares/CheckUserDetails")
require("dotenv").config()
Routes.get("/", (req, resp) => handleResponse(resp, 200, "Server Health is Okay!"))

Routes.post("/verifyUser", async (req, resp) => {
    const { name, phone, email, password } = req.body
    if (!name || !phone || !email || !password) return handleResponse(resp, 404, "All fields are required")

    const dbQuery = `Select * from ${process.env.USER_TABLE} where email='${email}'`  //find with email
    Users.query(dbQuery, async (error, results) => { //ek se jdya obj aa skte h to ARRAY OF OBJ aayga
        if (error) return handleError(resp, error)
        if (results.length !== 0) return handleResponse(resp, 404, "Account related to this email is already exists")
        const otp = generateotp(email)
        return await otptoemailforverification(resp, email, otp)
    })
})

Routes.post("/createUser", async (req, resp) => {
    const { name, phone, email, password, otp } = req.body
    if (!name || !phone || !email || !password) return handleResponse(resp, 404, "All fields are required")

    const dbQuery = `Select * from ${process.env.USER_TABLE} where email='${email}'`  //find with email
    Users.query(dbQuery, async (error, results) => {
        if (error) return handleError(resp, error)
        if (results.length !== 0) return handleResponse(resp, 404, "Account related to this email is already exists")
        if (!otp) return handleResponse(resp, 404, "Enter the otp")
        const result = verifyotp(email, otp)
        if (!result.status) return handleResponse(resp, 401, result.message)

        const Query = `INSERT INTO \`${process.env.USER_TABLE}\` (\`name\`, \`phone\`, \`email\`, \`password\`, \`role\`) VALUES (?, ?, ?, ?, 'owner');`;   //? m variable ki value aaygi
        Users.query(Query, [name, phone, email, password], (error, result) => {
            if (error) return handleError(resp, error)
            return handleResponse(resp, 201, "Account Created Successfully", result)
        })
    })
})

Routes.post("/login", (req, resp) => {
    const { email, password } = req.body
    if (!email || !password) return handleResponse(resp, 404, "All fields are required")

    const dbQuery = `Select * from ${process.env.USER_TABLE} where email='${email}'`
    Users.query(dbQuery, (error, results) => {  //results m array aata h 
        if (error) return handleError(resp, error)
        if (results.length === 0) return handleResponse(resp, 401, "Invalid Email")
        if (results[0].password !== password) return handleResponse(resp, 401, "Invalid Password")
        const payload = {
            id: results[0].id
        }
        const token = jwt.sign(payload, process.env.JWT_KEY)
        return handleResponse(resp, 202, "Login Successfully", { token, role: results[0].role })
    })
})


Routes.post('/createCategory', checkUserDetails, (req, resp) => {
    const { name } = req.body;

    if (!name) return handleResponse(resp, 404, "Category name is required")

    // Check if category exists
    const checkQuery = `SELECT id FROM ${process.env.CATEGORY_TABLE} WHERE name = '${name}'`;
    Category.query(checkQuery, (error, results) => {
        if (error) return handleError(resp, error)

        if (results.length !== 0) {
            return handleResponse(resp, 400, "This Category already exists.")
        }

        // Insert if not exists
        const insertQuery = `INSERT INTO ${process.env.CATEGORY_TABLE} (name,user_id) VALUES (?,?)`;
        Category.query(insertQuery, [name, req.user.id], (error, result) => {
            if (error) return handleError(resp, error)

            return handleResponse(resp, 201, "Category Created Successfully", result)
        });
    });
});
Routes.get('/getAllCategories', checkUserDetails, (req, resp) => {
    const Query = `SELECT * FROM ${process.env.CATEGORY_TABLE} where user_id=?  ORDER BY id DESC` ;

    Category.query(Query, [req.user.id], (error, results) => {
        if (error) return handleError(resp, error)
        return handleResponse(resp, 202, "Categories fetched successfully", results)
    });
});



module.exports = Routes    