import * as winston from 'winston';

const simpleFormat = winston.format.printf(({ severity, message, timestamp, stack }) => {
    return `${timestamp} ${severity} ${message}${stack ? '\n' : ''}${stack || ''}`;
});

const gcpLogFormat = winston.format(info => {
    info.severity = info.level.toUpperCase();
    delete info.level;
    if (!info.stack && info.meta?.stack) {
        info.stack = info.meta.stack;
    }
    return info;
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'debug',
    format: winston.format.combine(
        gcpLogFormat(),
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        (process.env.LOG_FORMAT || 'json') == 'json' ? winston.format.json() : simpleFormat,
    ),
    transports: [
        new winston.transports.Console({
            handleExceptions: true,
            silent: process.env.NO_LOGS === 'true',
        })
    ],
});

export default logger;
