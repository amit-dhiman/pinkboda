const FCM = require('fcm-push');

const sendNotification = async (data,deviceToken) => {
    // var fcm = new FCM(Config.APP_CONSTANTS.SERVER.NOTIFICATION_KEY);
    var fcm = new FCM("AAAA6rtcmlA:APA91bGQBAz5SfoAH-npu5iZ9KnFxG3RTosUIVEb3V-7CEvsrb0nXVZe3aqZ4nj2gQFa0mBD1YCs1lR4B4rDeCnNFqfFMRZ0hA0RGWZl0f61IkQu5PNiV6Psgs_csOYYayGYHmtGTdWj");
    if(!deviceToken){
      // mine f23's
      deviceToken = "f2AMNQr5S7KYr88sIecc3b:APA91bGU0pi3aTEcJcOOLTiYtS3tXKy7B_IlurasG9g4A2c6HsPoufLHtA0qBhF-dV5yoCzcdI4ju4u7_O7iMeGMAvNCeIjjsmrstH1uNBKJ45dJ4fxgvdAA5dAks7WYRHIx0kluPSF1"
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
        if(err) {console.log("----------err",err)}
        else{console.log("---------result",result)}
    });
};
