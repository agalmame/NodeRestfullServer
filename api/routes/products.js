const express = require('express');
const route = express.Router();
const Product = require('../models/product');
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const storage = multer.diskStorage({
    destination:function(req,file, clb){
        clb(null,'upload/');
    },
    filename: function(req, file, clb){
        clb(null,new Date().toString()+ file.originalname);
    }
});
const upload = multer({storage:storage,limits:{
    fileSize:(1024 * 1024)*2,
}});

route.get('/',(req, res, next)=>{
    Product.find()
    .select('_id name price image')
    .exec()
    .then(docs => {
        var result = {
            count:docs.length,
            products:docs.map(doc => {
                return{
                    _id:doc._id,
                    name:doc.name,
                    price:doc.price,
                    image:doc.image,
                    info:{
                        type:'Get',
                        url:'localhost:3000/product/'+doc._id,
                    }    
            }
            })
        };
        res.status(200).json(result);
    })
    .catch(err => {
        res.status(500).json({
            error:err,
        });
     })
});

route.patch('/:productID',checkAuth,(req, res, next) => {
    const id = req.params.productID;
    const opsObj = {};
    for(const ops of req.body )
        opsObj[ops.propName] = ops.value; 
    Product.update({_id:id},{$set:opsObj})
    .select('_id name price')
    .exec()
    .then(results => {
        res.status(200).json({
            message:'updated',
            info:{
                type:'patch',
                url:'/product/'+id,
            }
    })})
    .catch(err => {
        res.status(500).json({
            error:err,
        });
    });
});

route.delete('/:productID',checkAuth,(req, res, next)=>{
    var id = req.params.productID;
    Product.remove({_id:id})
    .exec()
    .then(docs => {
        console.log(docs+"deleted");
        res.status(200).json({
            message:'product deleted'
        })
    })
    .catch(err => {
        res.status(500).json({
            error:err,
        });
     })
});

route.post('/',checkAuth,upload.single('image'),function(req, res, next){
    console.log(req.file)
    const pro = new Product({
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        image: req.file.path,
    });
    pro.save()
    .then(result => {
        console.log(result);
        res.status(200).json({
            message:"handling POST",
            createProduct: pro
        });
        })
        .catch(err => {
             console.log(err);
             res.status(500).json({error:err}); 
        });
});

route.get('/:productID',(req, res, next)=>{
    var id = req.params.productID;
    Product.findById(id)
    .select('_id name price image')
    .exec()
    .then(doc =>{
        var result = {
            product:{
                _id:doc.id,
                name:doc.name,
                price:doc.price,
                image:doc.image,
                info:{
                    type:'Get',
                    url:'/product/'+doc.id,
                }
            }
        };
        if(doc){
        res.status(200).json(result);
        }else
        res.status(404).json({message:'nothing'});
    })
    .catch(err => {
        res.status(500).json({
            error:err,
        });
    })
})

module.exports =route;
