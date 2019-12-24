const { createLogger, format, transports } = require('winston')
const moment = require('moment')
const fs = require('fs')

const config = require('../config')

const { combine, timestamp, label, printf } = format;
const tsFormat = () => moment().format('YYYY-MM-DD hh:mm:ss').trim();
const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${tsFormat()} [${label}] ${level.toUpperCase()}: ${message}`;
});

function dailyRotateFileTransport(type) {
    const pathFileLog = `${config.LOG_DIR}/${type}`

    if (!fs.existsSync(pathFileLog)) {
        fs.mkdirSync(pathFileLog);
    }

    return new transports.File({
        filename: `${pathFileLog}/log-${moment().format('YYYY-MM-DD')}.log`,
    });
}

function logger(type) {
    return createLogger({
        level: config.ENV == 'DEV' ? 'debug' : 'info',
        format: combine(
            label({ label: `${config.VAR_APPLICATION_NAME}` }),
            timestamp(),
            myFormat
        ),
        transports: [
            dailyRotateFileTransport(type),
            new transports.Console({
                format: format.combine(
                    format.colorize(),
                    format.printf(
                        info => `${tsFormat()} ${info.level}: ${info.message}`
                    )
                )
            })
        ]
    })
}

module.exports = logger