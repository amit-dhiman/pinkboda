const FCM = require('fcm-push');
require('dotenv').config();

const sendNotifyToUser = async (data,deviceToken) => {
    let fcm = new FCM(process.env.user_serverKey);
    console.log('------------ToUser-deviceToken-----------',deviceToken);
 
    let message = {
        to : deviceToken,
        notification : {
            title : data.title,
            message : data.message,
            pushType : data.pushType,
            body : data.message,
            sound : "default",
            badge : 0,
        },
        data : data,
        priority : 'high'
    };

    // if(data.imageUrl){message.notification.imageUrl= data.imageUrl }

    fcm.send(message, function (err, result) {
        if(err) {console.log("-----fcm err usr-------",err)}
        else{console.log("-------fcm result usr----",result)}
    });
};


const sendNotifyToDriver = async (data,deviceToken) => {
    let fcm = new FCM(process.env.driver_serverKey);
    console.log('-----------data----------',data);
    console.log('-----------ToDriver----------',deviceToken);

    let message = {
        to : deviceToken,
        notification : {
            title : data.title,
            message : data.message,
            pushType : data.pushType,
            body : data.message,
            notificationData: data.notificationData,
            sound : "default",
            badge : 0,
        },
        data : data,
        priority : 'high'
    };

    // if(data.imageUrl){message.notification.imageUrl= data.imageUrl }

    console.log("---------message dr---------",message)

    fcm.send(message, function (err, result) {
        if(err) {console.log("---------fcm err driver-------------",err)}
        else{console.log("-------------fcm result driver--------------",result)}
    });
};


const sendMassNotifyToUser = async (data,deviceToken) => {
    let fcm = new FCM(process.env.user_serverKey);
    console.log('------------ToUser-deviceToken-----------',deviceToken);
    // if(!deviceToken){
    //   // mine f23's  pinkboda
    //   deviceToken = "cdWfcVZSSVKAS9Ks-HkDRR:APA91bFkmIIByTf4Cy7D8qIxJaPo_qJKv_Kc_n5hENGIvX32vcsSsrlv-ai7xtWWlBLBO6S58oSoNXGvGE7SOeZ6OIhl_PqJ6AVPbgcwJpwNEiNjm9Vw-rfPo0w8HPu8yXb-L6RHlSrn"
    // }
    
    // i have tyo stop this------ not a good way
    for(let token of deviceToken){

    let message = {
        to : token,
        // data: {
        //     your_custom_data_key: 'your_custom_data_value'
        // },
        notification : {
            title : data.title,
            message : data.message,
            pushType : data.pushType,
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
    // console.log("---------message usr---------",message)

    fcm.send(message, function (err, result) {
        if(err) {console.log("-----fcm err usr-------",err)}
        else{console.log("-------fcm result usr----",result)}
    });
}
};


const sendMassNotifyToDriver = async (data,deviceToken) => {
    let fcm = new FCM(process.env.driver_serverKey);
    console.log('---------------ToDriver---------------',deviceToken);
    // if(!deviceToken){
    //   deviceToken = "cdWfcVZSSVKAS9Ks-HkDRR:APA91bFkmIIByTf4Cy7D8qIxJaPo_qJKv_Kc_n5hENGIvX32vcsSsrlv-ai7xtWWlBLBO6S58oSoNXGvGE7SOeZ6OIhl_PqJ6AVPbgcwJpwNEiNjm9Vw-rfPo0w8HPu8yXb-L6RHlSrn"
    // }
    for(let token of deviceToken){
        let message = {
            to : token,
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
        console.log("---------message dr---------",message)

        fcm.send(message, function (err, result) {
            if(err) {console.log("---------fcm err driver-------------",err)}
            else{console.log("-------------fcm result driver--------------",result)}
        });
    }

};



module.exports={sendNotifyToUser,sendNotifyToDriver,sendMassNotifyToUser,sendMassNotifyToDriver};

