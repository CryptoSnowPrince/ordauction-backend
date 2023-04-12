const { setIntervalAsync } = require('set-interval-async/fixed')

const { Auction, Bid } = require("./db");

const app = require("./app");
const { AUCTION_STARTED, AUCTION_ENDED } = require('./utils');
var server = require('http').createServer(app);

const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on('connection', (client) => {
    client.on('disconnect', () => {
        console.log(">>> User Disconnected <<<");
    });
    client.on('event', data => {
        console.log("user event", data);
        client.emit("hello", data);
    });
});

global.socketIO = io;

const Auction_Monitor = () => {
    setIntervalAsync(
        async () => {
            try {
                const auctionData = await Auction.aggregate([{
                    $match: {
                        state: AUCTION_STARTED
                    },
                 }, 
                 {
                    "$project": {
                        _id: 1,
                        auctionID: 1,
                        inscriptionID: 1,
                        bidCounts: 1,
                        amount: 1,
                        auctionEnd: { $toLong: "$endDate" }
                    }
                }
                ]);
                if(auctionData.length == 0) return;
                const _now = Date.now();
                console.log("_now=", _now);
                for(let i = 0;i<auctionData.length;i++) {
                    console.log(`i=${i} auctionEnd=${auctionData[i].auctionEnd} now=${_now} ended=${auctionData[i].auctionEnd <= _now}`);
                    if(auctionData[i].auctionEnd <= _now) {
                        const _bidData = await Bid.find({auctionID: auctionData[i].auctionID});
                        console.log(`winnnerOrdWallet=${_bidData[_bidData.length - 1].ordWallet}`);
                        await Auction.findByIdAndUpdate(auctionData[i]._id, {
                            state: AUCTION_ENDED,
                            winnerOrdWallet: _bidData[_bidData.length - 1].ordWallet
                        });
                        /// get funds from winner Wallet to owner's...
                        /// ##################
                    }
                }
                
            } catch(err) {
                console.log(">>> error <<< :", err.message);
            }
        }, 1000
    )
}

module.exports = {
    server,
    Auction_Monitor    
}