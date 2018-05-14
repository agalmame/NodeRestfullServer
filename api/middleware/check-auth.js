const jwt =  require('jsonwebtoken')


module.exports = (req, res, next)=>{
    var token = req.headers.authorization.split(" ")[1]

    jwt.verify(token, process.env.jwt_key ,function(err,decoded){
        if(err){
            console.log(err);
            return res.status(401).json({
                message:'auth failed',
            });
        }else{
            req.userData = decoded;
            next();
        }
    });

}