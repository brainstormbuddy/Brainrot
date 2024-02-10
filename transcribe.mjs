import OpenAI from 'openai';
import fs from 'fs';
import dotenv from 'dotenv';
import { generateTranscriptAudio } from './eleven.mjs';
import getAudioDuration from './audioduration.mjs';
dotenv.config();
import { readFile, writeFile } from 'fs/promises';
import concatenateAudioFiles from './concat.mjs';

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

function srtTimeToSeconds(srtTime) {
	const [hours, minutes, secondsAndMillis] = srtTime.split(':');
	const [seconds, milliseconds] = secondsAndMillis.split(',');
	return (
		Number(hours) * 3600 +
		Number(minutes) * 60 +
		Number(seconds) +
		Number(milliseconds) / 1000
	);
}

function secondsToSrtTime(seconds) {
	const pad = (num, size) => String(num).padStart(size, '0');
	const hrs = Math.floor(seconds / 3600);
	const mins = Math.floor((seconds % 3600) / 60);
	const secs = Math.floor(seconds % 60);
	const millis = Math.round((seconds % 1) * 1000); // Round the milliseconds
	return `${pad(hrs, 2)}:${pad(mins, 2)}:${pad(secs, 2)},${pad(millis, 3)}`;
}

export default async function transcribeFunction() {
	const audios = await generateTranscriptAudio();
	let startingTime = 0;

	concatenateAudioFiles();

	for (const audio of audios) {
		const transcription = await openai.audio.transcriptions.create({
			file: fs.createReadStream(audio.audio),
			model: 'whisper-1',
			response_format: 'srt',
			prompt: 'transcribe every single individual word',
		});

		const srtContent = String(transcription);
		const lines = srtContent.split('\n');
		const incrementedSrtLines = lines.map((line) => {
			const timeMatch = line.match(
				/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/
			);
			if (timeMatch) {
				const startTime = srtTimeToSeconds(timeMatch[1]) + startingTime;
				const endTime = srtTimeToSeconds(timeMatch[2]) + startingTime;
				const incrementedStartTime = secondsToSrtTime(startTime);
				const incrementedEndTime = secondsToSrtTime(endTime);
				return `${incrementedStartTime} --> ${incrementedEndTime}`;
			}
			return line;
		});

		const incrementedSrtContent = incrementedSrtLines.join('\n');

		await writeFile(
			`public/srt/${audio.person}-${audio.index}.srt`,
			incrementedSrtContent,
			'utf8'
		);

		const duration = await getAudioDuration(audio.audio);
		// 0.28 is the silence duration
		startingTime += duration + 0.12;
	}
}

await transcribeFunction();