import OpenAI from 'openai';
import fs from 'fs';
import dotenv from 'dotenv';
import { generateTranscriptAudio } from './eleven.mjs';
import getAudioDuration from './audioduration.mjs';
dotenv.config();
import { writeFile } from 'fs/promises';
import concatenateAudioFiles from './concat.mjs';
import { spawn } from 'child_process';

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

const transcribeAudio = async (audios) => {
	try {
		const response = await fetch('http://127.0.0.1:5000/transcribe', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ audios: audios }),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error transcribing audio:', error);
	}
};

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

	// Concatenate audio files if needed, or comment out if not used
	concatenateAudioFiles();

	// Perform transcription and get the result
	const transcriptionResults = await transcribeAudio(
		audios.map((audio) => audio.audio)
	);

	// Iterate over each transcription result and corresponding audio file
	for (let i = 0; i < transcriptionResults.length; i++) {
		const transcription = transcriptionResults[i][0];
		const audio = audios[i]; // Corresponding audio file object
		let srtIndex = 1; // SRT index starts at 1

		// Initialize SRT content
		let srtContent = '';
		console.log(transcription);

		// Iterate over each segment's words and create SRT entries
		transcription.segments.forEach((segment) => {
			segment.words.forEach((word) => {
				const startTime = secondsToSrtTime(word.start);
				const endTime = secondsToSrtTime(word.end);
				srtContent += `${srtIndex}\n${startTime} --> ${endTime}\n${word.text}\n\n`;
				srtIndex++;
			});
		});

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

		// The name of the SRT file is based on the second element of the audio array but with the .srt extension
		const srtFileName = audio.audio
			.replace('voice', 'srt')
			.replace('.mp3', '.srt');

		// Write the SRT content to the file
		await writeFile(srtFileName, incrementedSrtContent, 'utf8');

		const duration = await getAudioDuration(audio.audio);
		startingTime += duration + 0.3;
	}
}

await transcribeFunction();