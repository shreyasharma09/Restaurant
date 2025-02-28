const express=require("express")
const cors=require("cors")
const Routes=require("./Routes/Routes")
const connectDB=require("./Connection")
require("dotenv").config()
const app=express()
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'));  //files ko upload krne ke lie nd also make a folder of img/files dynamically
connectDB()
app.use("/api",Routes)

app.listen(process.env.PORT_NO || 3010,()=>console.log(`Server Started At:${process.env.PORT_NO || 3010}`))