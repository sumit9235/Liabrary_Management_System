const express= require('express')
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUI= require('swagger-ui-express')
const { connection } = require('./controllers/db')
const { userRouter } = require('./routes/users.route')
const { bookRouter } = require('./routes/books.routes')
require('dotenv').config()
const app = express()
app.use(express.json())

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Liabrary Management System',
            version: '1.0.0',
        },
      servers:[
          {
              url:'http://localhost:5000/'
        }
      ]
    },
    apis: [,'./index.js','./routes/users.route.js','./routes/books.routes.js'], // files containing annotations as above
  };

const swaggerSpec=swaggerJsdoc(options)
app.use('/api-docs',swaggerUI.serve,swaggerUI.setup(swaggerSpec))

/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome and API Health Check
 *     description: This API route is used for welcoming and checking whether the API methods are working correctly.
 *     responses:
 *       200:
 *         description: Returns a message to test the GET method and confirm API health.
 */
app.get("/",(req,res)=>{
    res.send("Welcome to inde.gg Library management system")
})

app.use("/users",userRouter)
app.use("/books",bookRouter)

const PORT=process.env.PORT||5000

app.listen(PORT,async()=>{
    try {
        await connection
        console.log("Connected to NoSql Database")
    } catch (error) {
        console.log(error.message)
    }
    console.log(`Connected to Port ${PORT}`)
})
