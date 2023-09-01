const { Op } = require('sequelize')
const db = require('../../models/index');
const User = db.users;
const libs = require('../../libs/queries');
const commonFunc = require('../../libs/commonFunc');
require('dotenv').config();
const CONFIG = require('../../config/scope');



const driverSignup = async (req, res) => {
    try {
        let { username, gender, country_code, mobile_number, model, license_plate, year, device_type, device_token } = req.body;

        // if (username) { 
        //     const getUsername = await libs.getData(User, {where:{
        //         username: username,     // id: {[Op.not]: userData.id},
        //     }});

        //     if(getUsername){
        //         return res.status(400).json({error:"user name already exist"});
        //     }
        // }

        const getData=await libs.getData(User,{where:{mobile_number:mobile_number}});

        if (getData) {
            console.log('----getData----', getData);
            return res.status(400).json({error:"mobile number already exist"});
        }

        let data = {
            username: username,
            mobile_number: mobile_number,
            gender: gender,
            country_code: country_code,
        };

        if (device_type) { data.device_type = device_type }
        if (device_token) { data.device_token = device_token }
        

        let saveData = await libs.createData(User, data);

        let token_info = { id: saveData.id, mobile_number: saveData.mobile_number };
        let token = await commonFunc.generateAccessToken(saveData, token_info, process.env.user_secretKey);
        console.log('---------token--------------', token);
        return SUCCESS.DEFAULT(res, token.access_token)
    } catch (err) {
        ERROR.ERROR_OCCURRED(res, err);
        // console.log('-----er------',err);
        // res.status(500).json(err.toString());
    }
};














module.exports = { driverSignup, }

