const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const User = require('../models/user');
const checkAuth = require('../middleware/check-auth');

router.post('/signup',(req, res, next)=>{
    User.find({email:req.body.email})
    .exec()
    .then(result=>{
        if(result!=""){
            console.log("this is "+result)
            return res.status(409).json({
                message:'mail exists'
            })
        }else{
            bcrypt.hash(req.body.password,5,(err,hash)=>{
                if(err){
                    console.log('hash problem')
                    return res.status(500).json({
                        error:err
                    })
                }else{
                    const user = new User({
                        _id:mongoose.Types.ObjectId(),
                        email:req.body.email,
                        password:hash,
                    })
                user.save()
                .then(result=>{
                    res.status(200).json({
                        message:'user created',
                    });
                })
                .catch(err => {
                    res.status(500).json({
                        error:err,
                })
                })}
            })
        }
    })
});

router.get('/',(req,res,next)=>{
    User.find()
    .exec()
    .then(results=>{
        var us = {
            count : results.length,
            Users : results.map(result =>{
                return{
                    _id: result._id,
                    email: result.email,
                }
            })
        }
        res.status(200).json({us});
    })
    .catch(err=>{
        res.status(500).json({
            error:err,
        });
    });
})
router.delete('/:userID',checkAuth,(req, res, next)=>{
    var id = req.params.userID;
    User.remove({_id:id})
    .exec()
    .then(result=>{
        res.status(200).json({
            message:'user deleted',
        })
    })
    .catch(err=>{
        res.status(500).json({
            error:err,
        });
    })
})
router.post('/login',checkAuth,(req , res, next)=>{
    User.find({email:req.body.email})
    .exec()
    .then(user=>{
        if(user.length<1){
            return res.status(404).json({
                message:'Auth failed',
            })
        }else{
         bcrypt.compare(req.body.password,user[0].password,function(err,result){
                if(!result){
                    return res.status(404).json({
                        message:'Auth failed',
                    })
                }
                else if(result){
                    var token = jwt.sign({
                        email:user[0].email,
                        userID:user[0]._id
                    },
                    process.env.jwt_key,
                {
                    expiresIn:"2h"
                })
                    return res.status(200).json({
                        message:'Auth success',
                        token : token,
                    })
                }
            })
        }

    })
    .catch(err=>{
        res.status(500).json({
            error:err
        });
    })
});

module.exports = router;
