const libs = require('./queries');
const ERROR = require('../config/responseMsgs').ERROR;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
let nodeMailer = require('nodemailer');
require('dotenv').config()
const Models = require("../models/index");
const multer = require('multer');
const path = require('path');
const axios = require('axios');


const generateAccessToken = async (saveData, token_info, secret_key) => {
  try {
    // console.log('-----------token_info-----------',token_info);

    let tokenPayload = { ...token_info };
    if (tokenPayload.device_token) { delete tokenPayload.device_token }

    const gen_token = jwt.sign(tokenPayload, secret_key);

    let update = { access_token: gen_token };

    if (token_info.device_token) { update.device_token = token_info.device_token }
    if (token_info.device_type) { update.device_type = token_info.device_type };

    // console.log('---------token_info----------', token_info);

    let updatedData = await libs.setData(saveData, update);
    return updatedData;
  } catch (err) {
    console.log('-----token-err----', err);
    throw err;
  }
};


const verify_token = (scope) => {
  return async (req, res, next) => {
    try {
      let secretKey = null;
      let model = null;

      if (scope == 'users') { model = Models.users, secretKey = process.env.user_secretKey }
      if (scope == 'drivers') { model = Models.drivers, secretKey = process.env.driver_secretKey }
      if (scope == 'admins') { model = Models.admins, secretKey = process.env.admin_secretKey }

      let token = req.headers.authorization;
      if (!token) return ERROR.TOKEN_REQUIRED(res);

      const decoded = jwt.verify(token, secretKey);
      console.log('------decoded-------', decoded);

      if (decoded) {
        const creds = await libs.getData(model, { where: { access_token: token } });
        if (creds) {
          req.creds = creds;
          next();
        } else { return ERROR.UNAUTHORIZED(res) }
      } else { return ERROR.INVALID_TOKEN(res); }
    } catch (err) {
      return ERROR.ERROR_OCCURRED(res, err)
    }
  }
}


const securePassword = async (password) => {
  try {
    let hash = await bcrypt.hash(password, 10);
    return hash;
  } catch (error) {
    throw error;
  }
}

const compPassword = async (password, dbPassword) => {
  try {
    let result = await bcrypt.compare(password, dbPassword);
    return result;
  } catch (err) {
    throw err
  }
}

let sendMail = (otp, email) => {

  let transport = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: "",
      pass: ""
    }
  })

  let options = {
    from: "",
    // from: email,
    to: "",
    subject: "from nodemailer",
    text: `your otp is: ${otp}`
  }

  transport.sendMail(options, function (err, info) {
    if (err) {
      console.log('-----email err---------', err)
    } else {
      console.log("email has been sent" + info.response)
    }
  })
}

// const sendSms = async (number,otp)=>{
//   try {
//     console.log('-----sendSms----------');
//     let result = await client.messages.create({
//         body: `Hello, this is a otp ${otp}`,
//         from: +12518423377,
//         to: number
//     })
//     .then(message => console.log('Message sent:', message.sid))
//     .catch(error => console.error('---Error sending message:--', error));

//     return result;
//   } catch (err) {
//     throw err
//   }
// }

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/users/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1000)}.png`;
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})
const upload = multer({ storage: storage });


const driverstorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // const driverPath= path.join(`${__dirname}`,'../public/uploads/drivers/');
    // console.log('-------d path----',process.env.driver_image_baseUrl)
    cb(null, './public/uploads/drivers/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1000)}.png`;
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})
const driver_upload = multer({ storage: driverstorage })


const adminstorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // const adminPath= path.join(`${__dirname}`,'../public/uploads/admins/');
    cb(null, './public/uploads/admin/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1000)}.png`;
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})
const admin_upload = multer({ storage: adminstorage })


const admin_auth = async (req, res, next) => {
  // console.log('------------req.session-------------',req.session);
  // console.log('------------admin-------------',req.session.admin);
  // console.log('------------role-------------',req.session.role);
  if (req.session && req.session.role == 'admin') {
    const verify = await libs.getData(Models.admins, { where: { id: req.session.admin.id } });
    if (verify) {
      return next();
    };
  } else {
    return res.redirect('/admin/login');
  }
};



const findDistanceByRoad = async(loc) => {
  try {
    console.log('-----------loc---------',loc);
    const apiKey = process.env.google_api_key;

    const pickup = `${loc.pickup_lat},${loc.pickup_long}`;
    const drop = `${loc.drop_lat},${loc.drop_long}`;

    const apiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${pickup}&destinations=${drop}&key=${apiKey}`;

    const response = await axios.get(apiUrl);
    const data = response.data;
    if (data.status === 'OK') {
      console.log('--------data.rows[0]--------',data.rows[0]);
      const distance = data.rows[0].elements[0].distance.text;
      console.log(`Distance by road: ${distance}`);
      return distance;
    } else {
      console.error('No results found');
      return 'No results found';
    }
  } catch (err) {
    console.log('----er-------',err);
    throw err;
  }
}




module.exports = {
  generateAccessToken, verify_token, securePassword, compPassword, sendMail, upload, driver_upload, admin_upload, admin_auth, findDistanceByRoad,
}
