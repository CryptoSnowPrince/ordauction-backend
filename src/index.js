const { INDEXING_TIME, ORD_COMMAND_HEADER } = require("./utils/config");
const awaitExec = require("util").promisify(require("child_process").exec);
const server = require('./socket').server;
const Auction_Monitor = require("./socket").Auction_Monitor;
Auction_Monitor();

const port = process.env.PORT || 3306;
server.listen(port, () => console.log(`Listening on port ${port}..`));


setInterval(async () => {
    // console.log("----- indexing -----");
    try {
        const {stdout, stderr} = await awaitExec(`${ORD_COMMAND_HEADER} index`);
    } catch(err) {
        console.log(">>> [Conflict] <<<Indexing error:") //,err);
    }
}, INDEXING_TIME );