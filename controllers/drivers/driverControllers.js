const { Op } = require('sequelize')
const db = require('../../models/index');
const libs = require('../../libs/queries');
const commonFunc = require('../../libs/commonFunc');
const {upload} = require('../../libs/commonFunc');
require('dotenv').config();
const CONFIG = require('../../config/scope');
const ERROR= require('../../config/responseMsgs').ERROR;
const SUCCESS= require('../../config/responseMsgs').SUCCESS;
const fs = require('fs');
const Promise = require('fs/promises');

const a =upload.fields([{name:'license',maxCount:1},{name:'id_card',maxCount:1},{name:'passport_photo',maxCount:1},{name:'vechile_insurance',maxCount:1}]);


const driverSignup = async (req, res) => {
    try {
        let {username,gender,country_code,mobile_number,model,license_plate,year,device_type, device_token} = req.body;
        console.log('-------req.body-------',req.body);
        console.log('------req.files-------',req.files);

        // if (username) { 
        //     const getUsername = await libs.getData(User, {where:{
        //         username: username,     // id: {[Op.not]: userData.id},
        //     }});

        //     if(getUsername){
        //         return res.status(400).json({error:"user name already exist"});
        //     }
        // }

        const getData=await libs.getData(db.drivers,{where:{mobile_number:mobile_number}});

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

        let saveData = await libs.createData(db.drivers, data);

        let token_info = { id: saveData.id, mobile_number: saveData.mobile_number };
        let token = await commonFunc.generateAccessToken(saveData, token_info, process.env.driver_secretKey);
        console.log('---------token--------------', token);


        return SUCCESS.DEFAULT(res,"signUp successfully", token)
    } catch (err) {
        console.log('----err---',err);
        if (req.files) {
            Object.values(req.files).map(files=>files.map(file=>fs.unlink(file.path,(err)=>{if(err)return})));
        }
        ERROR.ERROR_OCCURRED(res, err);
        // console.log('-----er------',err);
        // res.status(500).json({code:500,message:"error occured"});
    }
};














module.exports = { driverSignup, }

