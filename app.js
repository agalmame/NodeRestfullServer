const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const cors = require('cors');


const productsRoutes = require('./api/routes/products');
const ordersRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/users')
// mongoose.connect("mongodb+srv://yassune:"+ process.env.MONGO_ATLAS_PW+"@node-shop-ykwpi.mongodb.net/test")
mongoose.connect("mongodb://yassune:"+ process.env.MONGO_ATLAS_PW + "@node-shop-shard-00-00-ykwpi.mongodb.net:27017,node-shop-shard-00-01-ykwpi.mongodb.net:27017,node-shop-shard-00-02-ykwpi.mongodb.net:27017/test?ssl=true&replicaSet=node-shop-shard-0&authSource=admin",{useMongoClient:true});

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cors());

// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin","*");
//     res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept, Authorization");
//     if(req.method === 'OPTIONS'){
//         res.header('Access-Control-Allow-Methods','PUT, GET, POST, PATCH, DELETE');
//         return res.status(200).json({});
//     }
// });

app.use('/product', productsRoutes);
app.use('/order', ordersRoutes);
app.use('/user',userRoutes);

app.use((req,res,next)=>{
    var error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error,req,res,next)=>{
    res.status(error.status || 500);
     res.json({
         message:  error.message,
         mymessage:'somthing went wrong'
     });
});

module.exports = app;