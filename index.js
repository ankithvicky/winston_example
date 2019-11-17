const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, errors, json } = format
require('winston-daily-rotate-file');

const info_format = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${JSON.stringify(message)}`;
});
const ignoreError = format((info, opts) => {
    if (info.level != 'info')
        return false;
    return info;
});
let storage = {
    info: new transports.DailyRotateFile({
        level: 'info',
        format: combine(
            timestamp(),
            ignoreError(),
            info_format
        ),
        datePattern: 'YYYY-MM-DD-HH',
        maxSize: '50m',
        maxFiles: '14d',
        filename: 'logs/info/winston-%DATE%.log',
    }),
    error: new transports.DailyRotateFile({
        level: 'error',
        format: combine(
            timestamp(),
            errors({ stack: true }),
            json()
        ),
        datePattern: 'YYYY-MM-DD-HH',
        maxSize: '50m',
        maxFiles: '14d',
        filename: 'logs/error/winston-%DATE%.log',
    })
}
const logger = createLogger({
    transports: [storage.info, storage.error]
})


function logInfo(module, message) {
    logger.info({ label: module, message });
}
function logError(module, error) {
    logger.log('error', `${module} `, error);
}

logInfo('Login Module', 'Vicky logged in');
logError('Login Module', new Error("Attempted more than 3 times"));
