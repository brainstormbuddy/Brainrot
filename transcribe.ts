import OpenAI from 'openai';
import fs from 'fs';

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
	const transcription = await openai.audio.transcriptions.create({
		file: fs.createReadStream('public/audio.mp3'),
		model: 'whisper-1',
		response_format: 'srt',
		prompt: 'transcribe every single individual word',
	});

	console.log(String(transcription));

	fs.writeFileSync('test.srt', String(transcription));
}

main();