
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

const destroyData = async (model, query) => {
    try {
        let updateData = await model.destroy(query);
        console.log('------updateData------',updateData);
        return updateData;
    } catch (err) {
        throw err;
    }
}









module.exports={ 
    createData,
    getData,checkEmail,updateData,
    setData,findAndUpdate,destroyData,getAllData

};

