const express = require('express');
const mongoose = require('mongoose');
const route = express.Router();
const checkAuth = require('../middleware/check-auth');

const Order = require('../models/order');
const Product = require('../models/product');

route.get('/',(req, res, next)=>{
    Order.find()
    .select('_id product quantity')
    .populate('product')
    .exec()
    .then(results=>{
        var r = {
            count:results.length,
            order:results.map(result=>{
                return{
                _id:result.id,
                product:result.product,
                quantity:result.quantity,
                info:{
                    url:'/order/'+result.id,
                }
                }

            })
        }
        res.status(200).json({r})
    })
    .catch(err=>{
        res.status(500).json({erro:err});
    })
})

route.post('/',checkAuth,(req, res, next)=>{
    Product.findById(req.body.product)
    .exec()
    .then(result =>{
        var order = new Order({
            _id: mongoose.Types.ObjectId(),
            product: req.body.product,
            quantity: req.body.quantity,
        });
        return order.save()})
        .then(results =>{
            res.status(201).json({
                _id:results.id,
                product:results.product,
                quantity:results.quantity
            });
        })
    .catch(err=> {
            res.status(500).json({
                error:err,
                message:'product not found'
            });
        })
    })

    
    // .catch(err=> {
    //     res.status(500).json({error:err});
    // });

route.get('/:orderID',function(req, res, next){
    var id = req.params.orderID;
    Order.findOne({_id:id})
    .populate('product','name')
    .select('_id product quantity')
    .exec()
    .then(result=>{
        var r = {
            _id:result.id,
            product:result.product,
            quantity:result.quantity
        };
        res.status(200).json(r);
    })
    .catch(err=>{error:err});

});

route.delete('/:orderID',checkAuth,(req, res ,next)=>{
    var id = req.params.orderID;
    Order.remove({_id:id})
    .exec()
    .then(result => {
        res.status(200).json({
            message:'order was deleted'
        });
    })
    .catch(err=>{
        res.status(500).json({
            error:err
        })
    })
});
route.patch('/:orderID',checkAuth,(req, res, next) =>{
    var id = req.params.orderID;
    var opsObj = {};
    for(var ops of req.body)
        opsObj[ops.propName] = ops.value;
    Order.updateOne({_id:id},{$set:opsObj})
    .exec()
    .then(result=>{
        res.status(200).json({
            verb:'Patch',
            url:'/order/'+id
        });
    })
    .catch(err=>{
        res.status(500).json({
            error:err,
        });
    })
});

module.exports = route;