const fs = require("fs");
const path = require("path");
const ytdl = require("ytdl-core");

async function download(url, outputPath) {
	return new Promise((resolve, reject) => {
		// Make sure the output directory exists
		const outputDir = path.dirname(outputPath);
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
		}

		const videoStream = ytdl(url, {
			quality: "highestaudio",
			filter: "audioonly",
			requestOptions: {
				headers: {
					"User-Agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
				},
			},
		});

		const writeStream = fs.createWriteStream(outputPath);

		videoStream.pipe(writeStream);

		writeStream.on("finish", () => {
			resolve(outputPath);
		});

		writeStream.on("error", (error) => {
			console.log(error);
			reject(error);
		});

		videoStream.on("error", (error) => {
			console.log(error);
			reject(error);
		});
	});
}

// Set a sample YouTube URL and output path
const testUrl = "https://www.youtube.com/watch?v=bbaf3eAfyd4"; // Replace with a valid YouTube URL
const outputPath = path.join(__dirname, "output", "testAudio.mp3");

async function testDownload() {
	try {
		console.log("Starting download...");
		const result = await download(testUrl, outputPath);
		console.log("Download completed successfully:", result);
	} catch (error) {
		console.error("Download failed:", error.message);
	}
}

// Run the test
testDownload();
