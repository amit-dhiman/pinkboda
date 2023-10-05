const FCM = require('fcm-push');
require('dotenv').config();

const sendNotifyToUser = async (data,deviceToken) => {

    let fcm = new FCM(process.env.user_serverKey);
    if(!deviceToken){
      // mine f23's  pinkboda
      deviceToken = "cdWfcVZSSVKAS9Ks-HkDRR:APA91bFkmIIByTf4Cy7D8qIxJaPo_qJKv_Kc_n5hENGIvX32vcsSsrlv-ai7xtWWlBLBO6S58oSoNXGvGE7SOeZ6OIhl_PqJ6AVPbgcwJpwNEiNjm9Vw-rfPo0w8HPu8yXb-L6RHlSrn"
    }
    console.log('--------process.env.user_serverKey--------',process.env.user_serverKey);
    console.log('--------deviceToken--------',deviceToken);
    console.log('--------data--------',data);

    let message = {
        to : deviceToken,
        // data: {
        //     your_custom_data_key: 'your_custom_data_value'
        // },
        notification : {
            title : data.title,
            message : data.message,
            pushType : data.type,
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
    console.log("---------push_data---------",message)

    fcm.send(message, function (err, result) {
        if(err) {console.log("-----fcm err-----",err)}
        else{console.log("-------fcm result----",result)}
    });
};


const sendNotifyToDriver = async (data,deviceToken) => {
    let fcm = new FCM(process.env.driver_serverKey);

    if(!deviceToken){
      deviceToken = "cdWfcVZSSVKAS9Ks-HkDRR:APA91bFkmIIByTf4Cy7D8qIxJaPo_qJKv_Kc_n5hENGIvX32vcsSsrlv-ai7xtWWlBLBO6S58oSoNXGvGE7SOeZ6OIhl_PqJ6AVPbgcwJpwNEiNjm9Vw-rfPo0w8HPu8yXb-L6RHlSrn"
    }
    let message = {
        to : deviceToken,
        data: {
            your_custom_data_key: 'your_custom_data_value'
        },
        notification : {
            title : data.title,
            message : data.message,
            pushType : data.type,
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
    console.log("---------push_data---------",message)

    fcm.send(message, function (err, result) {
        if(err) {console.log("-----fcm err-----",err)}
        else{console.log("-------fcm result----",result)}
    });
};

module.exports={sendNotifyToUser,sendNotifyToDriver};

