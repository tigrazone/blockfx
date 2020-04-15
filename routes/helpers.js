import User from '../models/User';

function equalsObjectNotStrict(obj1, obj2){
    for(let key in obj1){
        if(!obj1.hasOwnProperty(key1)){
            continue;
        }
        if(!obj2.hasOwnProperty(key1) || obj1[key] != obj2[key]){
            return false;
        }
    }

    return true;
}

/**
 * @param req
 * @returns {Promise<User>}
 */
async function getUserByReq(req){
    const uid = req.user.id;
    return await User.findById(uid);
}

export {
    equalsObjectNotStrict,
    getUserByReq
}