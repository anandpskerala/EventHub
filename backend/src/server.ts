import { App } from "./app.js";
import { config } from "./config/config.js";
import { startReleaseJob } from "./utils/cronJob.js";


const port = config.port;
const server = new App();
startReleaseJob();
server.listen(port);