const inscribe = require('../../db/inscribe');
const {
    SUCCESS,
    FAIL
} = require('../../utils');
const { EXPLORER_URL } = require('../../utils/config');

module.exports = async (req_, res_) => {
    try {
        const uuid = req_.body.uuid;
        const fetchItems = await inscribe.find({uuid});
        if (!fetchItems) {
            return res_.send({ result: false, status: FAIL, message: "UserInscribes is empty" });
        }
        // console.log("fetchItems=", fetchItems);
        const result = [];
        for(let i = 0;i<fetchItems.length;i++) {
            result[i] = {...fetchItems[i]._doc};
            if(fetchItems[i].inscriptionID){
                result[i].imageUrl = `${EXPLORER_URL}/content/${fetchItems[i].inscriptionID}`;
                result[i].link = `${EXPLORER_URL}/inscription/${fetchItems[i].inscriptionID}`;
            }
        }
        console.log("result=", result)
        return res_.send({ result, status: SUCCESS, message: "getUserInscribes success" });
    } catch (error) {
        console.log("getUserInscribes error: ", error)
        return res_.send({ result: false, status: FAIL, message: "getUserInscribes fail" });
    }
}
