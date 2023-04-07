const inscribe = require('../../db/inscribe');
const {
    SUCCESS,
    FAIL
} = require('../../utils');
const { EXPLORER_URL } = require('../../utils/config');

module.exports = async (req_, res_) => {
    try {
        const fetchItems = await inscribe.find({});
        if (!fetchItems) {
            return res_.send({ result: false, status: FAIL, message: "Inscribes is empty" });
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
        // console.log("result=", result)
        return res_.send({ result, status: SUCCESS, message: "getInscribes success" });
    } catch (error) {
        console.log("get Inscribes error: ", error)
        return res_.send({ result: false, status: FAIL, message: "getInscribes fail" });
    }
}
