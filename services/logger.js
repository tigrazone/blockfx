
const today = new Date();
const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

const SimpleNodeLogger = require('simple-node-logger'),
    opts = {
        logFilePath:'logs/log.'+date+'.log',
        timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
    },
log = SimpleNodeLogger.createSimpleLogger( opts );

module.exports = log;