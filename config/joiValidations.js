const joi = require('joi');

const signupUserValid= async (req,res,next)=>{
    let validation = joi.object({
        username: joi.string().required(),
        country_code: joi.number().required(),
        mobile_number: joi.string().required(),
        gender: joi.string().required(),
        device_type: joi.string().valid("android","apple",).optional(),
        device_token: joi.string().optional(),
    })

    let {error}= validation.validate(req.body);
    if(error){
        console.log('------------joi err-----------',error);
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
}


const loginUserValid= async (req,res,next)=>{
    let validation = joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(6).regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
        .message('Password must be at least 6 characters, include at least 1 uppercase letter, 1 lowercase letter, 1 Number.and atleast 1 special case').required(),
        device_type: joi.string().valid("Android","Apple","Windows").optional(),
        device_token: joi.string().optional(),
    })

    let {error}= validation.validate(req.body);
    if(error){
        console.log('--------joi err-------',error);
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
}

const socialloginUserValid= async (req,res,next)=>{
    let validation = joi.object({
        social_key: joi.string().required(),
        device_type: joi.string().valid("Android","Apple","Windows").optional(),
        device_token: joi.string().optional(),
    })

    let {error}= validation.validate(req.body);
    if(error){
        console.log('--------err-------',error);
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
}


const changePasswordValid= async (req,res,next)=>{
    let validation = joi.object({
        oldPassword: joi.string().required(),
        newPassword: joi.string().min(6).regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
        .message('Password must be at least 6 characters, include at least 1 uppercase letter, 1 lowercase letter, 1 Number.and atleast 1 special case').required(),
        confirmPassword: joi.string().min(6).regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
        .message('Password must be at least 6 characters, include at least 1 uppercase letter, 1 lowercase letter, 1 Number.and atleast 1 special case').required(),
        device_type: joi.string().valid("android","apple").optional(),
        device_token: joi.string().optional(),
    })

    let {error}= validation.validate(req.body);
    if(error){
        console.log('--------joi err-------',error);
        return res.status(400).json({error: error.details[0].message});
    }
    next();
}

const editUserValid= async (req,res,next)=>{
    let validation = joi.object({
        first_name: joi.string().optional(),
        last_name: joi.string().optional(),
        username: joi.string().optional(),
        gender: joi.string().optional(),
        device_type: joi.string().valid("android","apple").optional(),
        device_token: joi.string().optional(),
    })

    let {error}= validation.validate(req.body);
    if(error){
        console.log('--------joi err-------',error);
        return res.status(400).json({error: error.details[0].message});
    }
    next();
}


module.exports= { signupUserValid,loginUserValid, changePasswordValid, socialloginUserValid, editUserValid };

