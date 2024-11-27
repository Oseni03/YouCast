import winston from "winston";

// Define custom log format
const customFormat = winston.format.printf(
	({ level, message, timestamp, ...meta }) => {
		const metaString = Object.keys(meta).length
			? ` | ${JSON.stringify(meta)}`
			: "";
		return `${timestamp} [${level.toUpperCase()}]: ${message}${metaString}`;
	}
);

// Create the logger instance
export const logger = winston.createLogger({
	level: process.env.LOG_LEVEL || "info", // Default to "info", can be adjusted via environment variable
	format: winston.format.combine(
		winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
		winston.format.errors({ stack: true }), // Include stack traces for errors
		winston.format.splat(), // Handle interpolation
		winston.format.json(),
		customFormat
	),
	transports: [
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				customFormat
			),
		}),
		new winston.transports.File({
			filename: "logs/app.log", // Write logs to a file
			level: "debug", // Write all logs of "debug" level or higher to file
		}),
	],
});

// Add stream support for libraries like morgan
logger.stream = {
	write: (message) => logger.info(message.trim()),
};

export default logger;
