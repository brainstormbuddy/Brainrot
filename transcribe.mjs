import OpenAI from 'openai';
import fs from 'fs';
import dotenv from 'dotenv';
import { generateTranscriptAudio } from './eleven.mjs';
dotenv.config();

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export default async function transcribeFunction() {
	const audios = await generateTranscriptAudio();

	for (const audio of audios) {
		const transcription = await openai.audio.transcriptions.create({
			file: fs.createReadStream(audio.audio),
			model: 'whisper-1',
			response_format: 'srt',
			prompt: 'transcribe every single individual word',
		});

		fs.writeFileSync(`public/srt/${audio.audio}.srt`, String(transcription));
	}
}

await transcribeFunction();