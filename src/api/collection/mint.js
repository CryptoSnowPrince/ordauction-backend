const mintDb = require("../../db/mint");
const awaitExec = require("util").promisify(require("child_process").exec);

const collectionsDb = require("../../db/collections");
const { 
    FAIL,
    SUCCESS,
    BASE_UPLOAD_PATH,
    DEFAULT_FEE_RATE,
    SERVICE_FEE,
    OUTPUT_UTXO,
    sendSatsToAdmin,
    OPEN_MINT,
    MINTING,
    CLOSE_MINT,
    addNotify,
    getDisplayString,
    timeEstimate,
    INSCRIBE_COMPLETED
} = require("../../utils");
const { ORD_COMMAND, IS_TESTNET } = require("../../utils/config");

module.exports = async (req, res) => {
    const uuid = req.body.uuid;
    const collectionId = req.body.collectionId;
    const mintCount = req.body.mintCount;
    const feeRate = req.body.feeRate;
    const btcAccount = req.body.recipient;
    console.log("===== /api/collection/mint");
    console.log("uuid=", uuid);
    console.log("collectionId=", collectionId);
    console.log("mintCount=", mintCount);
    console.log("feeRate=", feeRate);
    console.log("btcAccount=", btcAccount);
    if(!collectionId || !mintCount || !btcAccount) {
        return res.send({
            result: false,
            status: FAIL,
            message: "Request params fail."
        })
    }

    const collectionInfo = await collectionsDb.findOne({ collectionId });
    if(collectionInfo === null) {
        return res.send({
            result: false,
            status: FAIL,
            message: "Collection not found."
        })
    }
    console.log("collectionInfo=", collectionInfo)
    const filePaths = [];
    const mintIds = [];
    for (let i = 0; i < mintCount; i++) {
        filePaths[i] = `${BASE_UPLOAD_PATH}${collectionInfo.url}/${collectionInfo.mintedCount + i + 1}${collectionInfo.ext}`;
        mintIds[i] = collectionInfo.mintedCount + i + 1;
    }
    const mintIdStr = mintIds.toString();
    console.log("mintIds=", mintIds);
    console.log("mintIds=", mintIdStr);
    console.log("filePaths=", filePaths);

    let fetchMintItem = await mintDb.findOne({uuid, collectionId});
    console.log("fetchMintItem=", fetchMintItem)
    if(fetchMintItem === null) {
        fetchMintItem = new mintDb({
            collectionId,
            uuid,
            mintCount,
            mintIds: mintIdStr,
            pending: OPEN_MINT
        });
        await fetchMintItem.save();
        fetchMintItem = await mintDb.findOne({uuid, collectionId});
    }
    try {
        let fees = 0;
        for (let i = 0; i < mintCount; i++) {
            ///// estiamte inscribe
            const { stdout, stderr } = await awaitExec(
                `${ORD_COMMAND} inscribe --fee-rate ${feeRate} ${filePaths[i]} --destination ${btcAccount} --dry-run`
            );
            if(stderr) {
                return res.send({
                    result: false,
                    status: FAIL,
                    message: "Mint: estimate inscribe stderr"
                });
            }
            fees += parseInt(JSON.parse(stdout).fees);
        }

        
        const estimateSatsAmount = fees + SERVICE_FEE + OUTPUT_UTXO * mintCount;
        const retVal = await sendSatsToAdmin(uuid, estimateSatsAmount);
        if(!retVal) {
            fetchMintItem.pending = MINTING;
            await fetchMintItem.save();
            return res.send({
                result: false,
                status: FAIL,
                message: "Not enough sats"
            });
        }
        let mintedCount = 0;
        for(let i = 0; i < mintCount; i++) {
            const { stdout, stderr } = await awaitExec(
                `${ORD_COMMAND} inscribe --fee-rate ${feeRate} ${filePaths[i]} --destination ${btcAccount}`
            );
            if (stderr) {
                fetchMintItem.pending = CLOSE_MINT;
                await fetchMintItem.save();
                collectionInfo.mintedCount = collectionInfo.mintedCount + i;
                await collectionInfo.save();
                return res.send({
                    result: {
                        mintedAmount: i,
                        mintedIds: mintIds.slice(0, i)
                    },
                    status: FAIL,
                    message: "Mint: ord wallet inscribe stderr"
                })
            }
            // await awaitExec(`mv ${filePaths[i]} ./minted`);

            const btcTxHash = JSON.parse(stdout).commit;
            const inscriptionID = JSON.parse(stdout).inscription;

            console.log(`NFT id=${mintIds[i]} inscribed successfully`);
            console.log(`btcTxHash=${btcTxHash} inscriptionID=${inscriptionID}`);

            const inscribeItem = new inscribe({
                uuid: uuid,
                feeRate: feeRate,
                btcDestination: btcAccount,
                state: INSCRIBE_COMPLETED,
                path: filePaths[i],
                txHash: btcTxHash,
                inscriptionID: inscriptionID
            });
            const savedItem = await inscribeItem.save();

            await addNotify(uuid, {
                type: 0,
                title: "Mint success!",
                link: `https://mempool.space/${IS_TESTNET?"testnet/":""}tx/${btcTxHash}`,
                content: `Congratulations! Your inscription ${getDisplayString(inscriptionID)}
                    will arrive to your wallet in ${timeEstimate(feeRate)}.`
            });
        }
        fetchMintItem.pending = CLOSE_MINT;
        await fetchMintItem.save();
        collectionInfo.mintedCount = collectionInfo.mintedCount + mintCount;
        await collectionInfo.save();
        return res.send({
            result: {
                totalMinted: collectionInfo.mintedCount,
                mintedIds: mintIds
            },
            status: SUCCESS,
            message: "Minted successfully"
        })
    } catch (err) {
        console.log("Mint catch error:", err);
        return res.send({ result: false, status: FAIL, message: "Mint error with exception" });
    }
}