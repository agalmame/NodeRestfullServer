const jwt =  require('jsonwebtoken')

module.exports = (req, res, next)=>{
    try{
        var token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token,process.env.jwt_key);
        req.userData = decoded;
        next();
    } catch(error){
        return
            res.status(401).json({
                message:'failed'
        })
    }
}