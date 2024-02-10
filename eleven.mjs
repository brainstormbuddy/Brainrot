import fetch from 'node-fetch';
import fs from 'fs';
import dotenv from 'dotenv';
import transcriptFunction from './transcript.mjs';
dotenv.config();

export async function generateTranscriptAudio() {
	const transcript = (await transcriptFunction('Matrix Multiplication'))
		.transcript;

	const audios = [];

	for (let i = 0; i < transcript.length; i++) {
		const person = transcript[i].person;
		const line = transcript[i].line;

		const voice_id =
			person === 'JOE_ROGAN'
				? process.env.JOE_ROGAN_VOICE_ID
				: process.env.JORDAN_PETERSON_VOICE_ID;

		await generateAudio(voice_id, person, line, i);
		audios.push({
			person: person,
			audio: `public/voice/${person}-${i}.mp3`,
			index: i,
		});
	}

	return audios;
}

export async function generateAudio(voice_id, person, line, index) {
	const response = await fetch(
		`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
		{
			method: 'POST',
			headers: {
				'xi-api-key': process.env.ELEVEN_API_KEY,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				model_id: 'eleven_multilingual_v2',
				text: line,
				voice_settings: {
					stability: 0.5,
					similarity_boost: 0.75,
				},
			}),
		}
	);

	if (!response.ok) {
		throw new Error(`Server responded with status code ${response.status}`);
	}

	const audioStream = fs.createWriteStream(
		`public/voice/${person}-${index}.mp3`
	);
	response.body.pipe(audioStream);

	return new Promise((resolve, reject) => {
		audioStream.on('finish', () => {
			resolve('Audio file saved as output.mp3');
		});
		audioStream.on('error', reject);
	});
}

await generateTranscriptAudio();