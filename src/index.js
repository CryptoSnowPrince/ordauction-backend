const app = require("./app");

var server = require('http').createServer(app);

const port = process.env.PORT || 3306;
server.listen(port, () => console.log(`Listening on port ${port}..`));
