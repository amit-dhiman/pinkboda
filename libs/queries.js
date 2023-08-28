
const saveData = async (model, data) => {
    try {
        let saveData = null;
        if (Array.isArray(data)) {
            saveData = await model.bulkCreate(data);
        } else {
            saveData = await model.create(data);
        }
        return saveData;
    } catch (err) {
        throw err;
    }
}

const setData = async (data, update) => {
    try {
        let setData= await data.set(update).save();
        return setData;
    } catch (err) {
        throw err;
    }
}

const findAndUpdate = async (model,query, updateData) => {
    try {
        console.log('-----model,query,updateData-----',typeof model, model);
        const user = await model.findByPk(query);
        const updatedUser= await user.update(updateData);
        return updatedUser;
    } catch (err) {
        throw err;
    }
}


const getData = async (model, query) => {
    try {
        let getData= await model.findOne(query);
        return getData;
    } catch (err) {
        throw err;
    }
}


const getAllData = async (model, query) => {
    try {
        let getData= await model.findAll(query);
        return getData;
    } catch (err) {
        throw err;
    }
}

const checkEmail = async (model, email) => {
    try {
        let getData= await model.findOne({where:{email:email.toLowerCase()}});
        return getData;
    } catch (err) {
        throw err;
    }
}
const updateData = async (model, data,query) => {
    try {
        let updateData = await model.update(data,query);
        return updateData;
    } catch (err) {
        throw err;
    }
}

// const updateData = async (model, data,query) => {
//     try {
//         let updateData = await model.update(data,query);
//         return updateData;
//     } catch (err) {
//         throw err;
//     }
// }









module.exports={ 
    saveData,
    getData,
    checkEmail,
    updateData,
    setData,
    findAndUpdate,
    

};

