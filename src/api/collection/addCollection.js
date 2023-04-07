const collectionsDb = require("../../db/collections");
const { FAIL, SUCCESS } = require("../../utils");

module.exports = async(req, res) => {
    const params = {
        name: req.body.name,
        collectionId: req.body.collectionId,
        totalCount: req.body.totalCount,
        url: req.body.url
    }
    console.log("addCollection params:", params);
    try {
        const collectionItem = new collectionsDb(params);

        // const collectionItem = new collectionsDb({
        //    name: "Fat boys",
        //    collectionId: 1,
        //    totalCount: 10,
        //    url: "/0fatboys",
        //    ext: ".png"
        // })
        collectionItem.save();
        return res.send({result: true, status: SUCCESS, message: "Successfully added the collection"});
    } catch (err) {
        console.log("Error saving item:", err);
        return res.send({result: false, status: FAIL, message: "Error saving item!"});
    }
}

