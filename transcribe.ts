import OpenAI from 'openai';
import fs from 'fs';

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
	const transcription = await openai.audio.transcriptions.create({
		file: fs.createReadStream('joe.mp3'),
		model: 'whisper-1',
		response_format: 'srt',
	});

	console.log(String(transcription));

	fs.writeFileSync('transcription.srt', String(transcription));
}

main();
