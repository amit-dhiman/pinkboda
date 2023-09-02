const { Op } = require('sequelize')
const db = require('../../models/index');
const libs = require('../../libs/queries');
const commonFunc = require('../../libs/commonFunc');
const {upload,driver_upload} = require('../../libs/commonFunc');
require('dotenv').config();
const CONFIG = require('../../config/scope');
const ERROR= require('../../config/responseMsgs').ERROR;
const SUCCESS= require('../../config/responseMsgs').SUCCESS;
const fs = require('fs');
const Promise = require('fs/promises');

// const a =upload.fields([{name:'license',maxCount:1},{name:'id_card',maxCount:1},{name:'passport_photo',maxCount:1},{name:'vechile_insurance',maxCount:1}]);


const driverSignup = async (req, res) => {
    try {
        let {username,gender,country_code,mobile_number,model,license_plate,year,device_type, device_token} = req.body;
        console.log('------req.body C-------',req.body);
        console.log('------req.files-------',req.files); 
        console.log('-----Object.values(req.fil)----', Object.values(req.files))
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
            if (req.files) {
                Object.values(req.files).map(files=>files.map(file=>fs.unlink(file.path,(err)=>{if(err)return})));
            }
            return res.status(400).json({error:"mobile number already exist"});
        }

        let data = {
            username: username,
            gender: gender,
            mobile_number: mobile_number,
            country_code: country_code,
            model:model,
            license_plate:license_plate,
            year:year,
        };

        if(req.files.license){data.license= req.files.license[0].filename}
        if(req.files.id_card){data.id_card= req.files.id_card[0].filename}
        if(req.files.passport_photo){data.passport_photo= req.files.passport_photo[0].filename}
        if(req.files.vechile_insurance){data.vechile_insurance= req.files.vechile_insurance[0].filename}

        if (device_type) { data.device_type = device_type }
        if (device_token) { data.device_token = device_token }

        console.log('-------data---------',data);

        let saveData = await libs.createData(db.drivers, data);

        let token_info = { id: saveData.id, mobile_number: saveData.mobile_number };
        let token = await commonFunc.generateAccessToken(saveData, token_info, process.env.driver_secretKey);

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

