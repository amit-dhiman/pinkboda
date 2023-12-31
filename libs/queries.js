
const createData = async (model, data) => {
    try {
        let createData = null;
        if (Array.isArray(data)) {
            createData = await model.bulkCreate(data);
        } else {
            createData = await model.create(data);
        }
        return createData;
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
        const user = await model.findByPk(query);
        const updatedUser= await user.update(updateData);
        return updatedUser;
    } catch (err) {
        console.log('-------q err------------',err);
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

const getLimitData = async (model, query,skp) => {
    try {
        let getData= await model.findAll(query).limit(10).offset(skp);
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

const destroyData = async (model, query) => {
    try {
        let destroyData = await model.destroy(query);
        return destroyData;
    } catch (err) {
        throw err;
    }
}

const disableData = async (model, data,query) => {
    try {
        let disableData = await model.update(data,query);
        return disableData;
    } catch (err) {
        throw err;
    }
}


module.exports={ 
    createData,getData,checkEmail,updateData,setData,findAndUpdate,destroyData,getAllData,getLimitData
};

