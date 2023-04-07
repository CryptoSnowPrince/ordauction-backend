const { exec } = require('child_process');
const { SUCCESS, FAIL, getInscriptions, addNotify, getDisplayString, isMine, delay } = require('../../utils')
const { user } = require('../../db');
const { ORD_COMMAND } = require('../../utils/config');

module.exports = async (req_, res_) => {
    // console.log("getUserInscriptions: ", req_.body);
    const btcAccount = req_.body.btcAccount;

    // console.log("btcAccount: ", btcAccount)

    if (!btcAccount) {
        console.log("null: ", !btcAccount);
        return res_.send({ result: false, status: FAIL, message: "get list fail" });
    }

    if (btcAccount === "all") {
        exec(`${ORD_COMMAND} inscriptions`, (error, stdout, stderr) => {
            if (error) {
                console.log(`exec error: ${error}`);
                return res_.send({ result: error, status: FAIL, message: "get all inscriptions err" });
            }
            if (stderr) {
                console.log(`exec stderr: ${stderr}`);
                return res_.send({ result: stderr, status: FAIL, message: "get all inscriptions stderr" });
            }
            ////console.log(`stdout: ${stdout}`);
            return res_.send({ result: JSON.parse(stdout), status: SUCCESS, message: "get all inscriptions success" });
        });
    } else {
        const oldInscription = await inscription.findOne({ btcAccount: btcAccount })
        // console.log('oldInscription: ', oldInscription)
        let nowInscription = await getInscriptions(btcAccount);
        // console.log('nowInscription: ', nowInscription)

        let oldInscriptionItems;
        if (!oldInscription) {
            oldInscriptionItems = []
        } else {
            oldInscriptionItems = oldInscription.inscription;
        }
        // console.log('InscriptionItems old: ', oldInscriptionItems)

        if ('error' in nowInscription.data) {
            return res_.send({ result: false, status: FAIL, message: "get inscriptions first fetch err" });
        }
        if (nowInscription.data.length <= 0) {
            await delay(2000);
            nowInscription = await getInscriptions(btcAccount);
            // console.log('nowInscription: ', nowInscription)
            if ('error' in nowInscription.data) {
                return res_.send({ result: false, status: FAIL, message: "get inscriptions double fetch err" });
            }
        }
        const nowInscriptionItems = nowInscription.data;

        // console.log('InscriptionItems now: ', nowInscriptionItems)

        // check deposit
        const depositInscriptions = nowInscriptionItems.filter(itemNow => !oldInscriptionItems.some(itemOld => itemOld.inscription_number === itemNow.inscription_number))
        // console.log('depositInscriptions: ', depositInscriptions)
        if (depositInscriptions.length > 0) {
            const findUser = await user.findOne({ btcAccount: btcAccount, active: true })
            if (findUser) {
                // console.log('depositInscriptions: ', depositInscriptions)
                for (let index = 0; index < depositInscriptions.length; index++) {
                    const isOwner = await isMine(depositInscriptions[index].id, btcAccount)
                    if (isOwner) {
                        await addNotify(findUser.uuid, {
                            type: 0,
                            title: 'Your inscription successfully deposited!',
                            link: `https://ordinals.com/inscription/${depositInscriptions[index].id}`,
                            content: `Your inscription ${getDisplayString(depositInscriptions[index].id, 8, 8)} successfully deposited. You can see your inscription in your inscription page.`
                        })
                    }
                }
            }
        }

        // check withdraw
        const withdrawInscriptions = oldInscriptionItems.filter(itemOld => !nowInscriptionItems.some(itemNow => itemNow.inscription_number === itemOld.inscription_number))
        // console.log('withdrawInscriptions: ', withdrawInscriptions)
        if (withdrawInscriptions.length > 0) {
            const findUser = await user.findOne({ btcAccount: btcAccount, active: true })
            if (findUser) {
                // console.log('withdrawInscriptions: ', withdrawInscriptions)
                for (let index = 0; index < withdrawInscriptions.length; index++) {
                    const isOwner = await isMine(withdrawInscriptions[index].id, btcAccount)
                    if (!isOwner) {
                        await addNotify(findUser.uuid, {
                            type: 0,
                            title: 'Your inscription successfully withdrawn!',
                            link: `https://ordinals.com/inscription/${withdrawInscriptions[index].id}`,
                            content: `Your inscription ${getDisplayString(withdrawInscriptions[index].id, 8, 8)} successfully withdrawn.`
                        })
                    }
                }
            }
        }

        // Extract content_length and content_type from each item in the array
        const nowInscriptionItemsExtract = nowInscriptionItems.map(item => ({
            content: item.content || '',
            content_length: item.content_length || '',
            content_type: item.content_type || '',
            genesis_fee: item.genesis_fee || '',
            genesis_height: item.genesis_height || '',
            genesis_transaction: item.genesis_transaction || '',
            id: item.id || '',
            inscription_number: item.inscription_number || '',
            location: item.location || '',
            offset: item.offset || '',
            output: item.output || '',
            output_value: item.output_value || '',
            preview: item.preview || '',
            sat: item.sat || '',
            timestamp: item.timestamp || '',
            title: item.title || '',
        }));

        // console.log(nowInscriptionItemsExtract);
        const _findOne = await inscription.findOne(
            { btcAccount: btcAccount }
        )
        if (!_findOne) {
            const inscriptionItem = new inscription({
                btcAccount: btcAccount,
                inscription: nowInscriptionItemsExtract,
            })

            try {
                const savedItem = await inscriptionItem.save();
                // console.log("new inscriptionItem object saved: ", savedItem);
                console.log("new inscriptionItem object saved: ");
            } catch (error) {
                // console.log('Error saving item:', error);
                console.log('Error saving item:');
            }
        } else {
            const _findOneAndUpdate = await inscription.findOneAndUpdate(
                { btcAccount: btcAccount }, // Your query here
                { inscription: nowInscriptionItemsExtract }, // Update operator to push new data
            )

            if (!_findOneAndUpdate) {
                // console.log('user Inscription _findOneAndUpdate err', _findOneAndUpdate)
                console.log('user Inscription _findOneAndUpdate err')
            } else {
                console.log('user Inscription _findOneAndUpdate success')
            }
        }

        return res_.send({ result: nowInscriptionItems, status: SUCCESS, message: nowInscription.result });
    }
}
