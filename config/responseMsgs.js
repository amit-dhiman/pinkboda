const { StatusCodes }= require('http-status-codes');

exports.ERROR ={
    ERROR_OCCURRED:(res,err)=>{
        res.status(StatusCodes.ERROR_OCCURRED||500).json(err.toString()||"ERROR_OCCURRED")
    },
    EMAIL_ALREADY_EXIST:(res)=>{
        return res.status(StatusCodes.CONFLICT).send("email already exist")
    },
    MOBILE_ALREADY_EXIST:(res)=>{
        return res.status(StatusCodes.CONFLICT).send("MOBILE already exist")
    },

 
    USER_NAME_ALREADY_EXIST:(res)=>{
        return res.status(StatusCodes.CONFLICT).json({
            // statusCode: code,
            message: 'user name already exists',
        })
    },
    INTERNAL_SERVER_ERROR:(res)=>{
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Internal Server Error",
        })
    },

    SOCIAL_KEY_NOT_EXSIST:{
        statusCode: 400,
        message: 'social key not exsist',
        type: 'SOCIAL_KEY_NOT_EXSIST'
    },
    TOKEN_REQUIRED:(res)=>{
        return res.status(407).json("Token is Required") 
    },
    INVALID_TOKEN:(res)=>{
        return res.status(407).json('invalid token please check again') 
    },
    INVALID_EMAIL:(res)=>{
        return res.status(400).json('Email is Incorrect')
    },
    WRONG_OTP:(res)=>{
        return res.status(400).json('otp is Incorrect')
    },
    DATA_NOT_FOUND:(res)=>{
        return res.status(404).json('DATA_NOT_FOUND')
    },
    


    INVALID_PASSWORD  :{
        statusCode: 400,
        message: 'Password is Incorrect.',
        type: 'INVALID_PASSWORD '
    },

    UNAUTHORIZED:(res)=>{ 
        return res.status(401).send("You are not authorized to perform this action")
    },
    INVALID_CREDENTIALS: {
        statusCode: 400,
        message: 'Phone Number or Password is incorrect.',
        type: 'INVALID_CREDENTIALS '
    },    
    WRONG_PASSWORD:(res)=> {
        return res.status(400).json("Password is incorrect")
    },

    SOMETHING_WENT_WRONG:(res)=>{
        return res.status(400).json("Something went wrong")
    },

    // INVALID_EMAIL :{
    //     statusCode: 400,
    //     message: 'Email is Incorrect.',
    //     type: 'INVALID_EMAIL'
    // },

    // INVALID_TOKEN :{
    //     statusCode: 400,
    //     message: 'invalid token please check again',
    // },
}


exports.SUCCESS = {
    DEFAULT:(res,data)=> {
        return res.status(StatusCodes.OK || 200).json(data)
    },
    OTP_SENT:(res,data)=>{
        return res.status(200).json({access_token: data, message: "otp sent to the number"})
    },

    RETURN_ORDER_TIME_OUT : {
        statusCode: 400,    
        message : 'you cannot return product because return time out',
        type: 'RETURN_ORDER_TIME_OUT'
    },

    ADDED : {
        statusCode: 200,
        message : 'Added successfully.',
        type: 'ADDED'
    },
    FORGOT_PASSWORD: {
        statusCode: 200,
        message: "A reset password link is sent to your registered email address.",
        type: 'FORGOT_PASSWORD'
    },
    PASSWORD_RESET_SUCCESSFULL:{
        statusCode:200,
        message :"Your Password has been Successfully Changed",
        type:'PASSWORD_RESET_SUCCESSFULL'
    },
    RESET_PASSWORD:{
        statusCode:200,
        message:"A reset password OTP has been sent to your registered Phone Number",
        type: 'RESET_PASSWORD'
    },
    // DEFAULT:{
    //    statusCode: code,
    //    message: 'Success',
    //    data: data
    // },

};
