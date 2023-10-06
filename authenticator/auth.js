const jwt=require('jsonwebtoken')
const authenticate = (req,res,next)=>{
    const token=req.headers.authorization
    if(token){
        jwt.verify(token,process.env.accessKey,(err,decoded)=>{
            if(decoded){
                req.body.userid=decoded.id
                next()
            }else{
                res.send({"msg":"Please login first","error":err.message})
            }
        })
    }else{
        res.send({"msg":"Authorization failed"})
    }
}
module.exports={authenticate}