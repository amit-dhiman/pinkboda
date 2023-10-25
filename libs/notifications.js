const FCM = require('fcm-push');
require('dotenv').config();

const sendNotifyToUser = async (data,deviceToken) => {
    let fcm = new FCM(process.env.user_serverKey);
    console.log('------------ToUser-deviceToken-----------',deviceToken);
    // if(!deviceToken){
    //   // mine f23's  pinkboda
    //   deviceToken = "cdWfcVZSSVKAS9Ks-HkDRR:APA91bFkmIIByTf4Cy7D8qIxJaPo_qJKv_Kc_n5hENGIvX32vcsSsrlv-ai7xtWWlBLBO6S58oSoNXGvGE7SOeZ6OIhl_PqJ6AVPbgcwJpwNEiNjm9Vw-rfPo0w8HPu8yXb-L6RHlSrn"
    // }
    let message = {
        to : deviceToken,
        // data: {
        //     your_custom_data_key: 'your_custom_data_value'
        // },
        notification : {
            title : data.title,
            message : data.message,
            // pushType : data.type,
            body : data.message,
            sound : "default",
            badge : 0,
        },
        data : data,
        priority : 'high'
    };

    // if(data.imageUrl){
    //     message.notification.imageUrl= data.imageUrl
    // }
    console.log("---------message usr---------",message)

    fcm.send(message, function (err, result) {
        if(err) {console.log("-----fcm err usr-------",err)}
        else{console.log("-------fcm result----",result)}
    });
};


const sendNotifyToDriver = async (data,deviceToken) => {
    let fcm = new FCM(process.env.driver_serverKey);
    console.log('---------------ToDriver---------------');
    // if(!deviceToken){
    //   deviceToken = "cdWfcVZSSVKAS9Ks-HkDRR:APA91bFkmIIByTf4Cy7D8qIxJaPo_qJKv_Kc_n5hENGIvX32vcsSsrlv-ai7xtWWlBLBO6S58oSoNXGvGE7SOeZ6OIhl_PqJ6AVPbgcwJpwNEiNjm9Vw-rfPo0w8HPu8yXb-L6RHlSrn"
    // }
    let message = {
        to : deviceToken,
        data: {
            your_custom_data_key: 'your_custom_data_value'
        },
        notification : {
            title : data.title,
            message : data.message,
            // pushType : data.type,
            body : data.message,
            sound : "default",
            badge : 0,
        },
        data : data,
        priority : 'high'
    };

    // if(data.imageUrl){
    //     message.notification.imageUrl= data.imageUrl
    // }
    console.log("---------message dr---------",message)

    fcm.send(message, function (err, result) {
        if(err) {console.log("-----fcm err dr-------",err)}
        else{console.log("-------fcm result----",result)}
    });
};

module.exports={sendNotifyToUser,sendNotifyToDriver};

