import fetch from 'node-fetch';
import fs from 'fs';
import dotenv from 'dotenv';
import transcriptFunction from './transcript.mjs';
import { writeFile } from 'fs/promises';
import path from 'path';

dotenv.config();

export async function generateTranscriptAudio(topic, agentA, agentB) {
	let transcript = (await transcriptFunction(topic, agentA, agentB)).transcript;

	const audios = [];

	for (let i = 0; i < transcript.length; i++) {
		const person = transcript[i].person;
		const line = transcript[i].line;

		const voice_id =
			person === 'JOE_ROGAN'
				? process.env.JOE_ROGAN_VOICE_ID
				: person === 'BARACK_OBAMA'
				? process.env.BARACK_OBAMA_VOICE_ID
				: person === 'BEN_SHAPIRO'
				? process.env.BEN_SHAPIRO_VOICE_ID
				: process.env.JORDAN_PETERSON_VOICE_ID;

		const imageFetch = await fetch(
			`https://www.googleapis.com/customsearch/v1?q=${encodeURI(
				transcript[i].asset
			)}&cx=${process.env.GOOGLE_CX}&searchType=image&key=${
				process.env.GOOGLE_API_KEY
			}&num=1`,
			{
				method: 'GET',
				headers: { 'Content-Type': 'application/json' },
			}
		);

		const imageResponse = await imageFetch.json();

		if (!imageResponse.items || imageResponse.items.length === 0) {
			throw new Error('Image not found');
		}

		await generateAudio(voice_id, person, line, i);
		audios.push({
			person: person,
			audio: `public/voice/${person}-${i}.mp3`,
			index: i,
			image: imageResponse.items[0].link,
		});
	}

	const initialAgentName = audios[0].person;

	const contextContent = `
  import { staticFile } from 'remotion';

  export const initialAgentName = '${initialAgentName}';
  export const subtitlesFileName = [
    ${audios
			.map(
				(entry, i) => `{
      name: '${entry.person}',
      file: staticFile('srt/${entry.person}-${i}.srt'),
      asset: '${entry.image}',
    }`
			)
			.join(',\n    ')}
  ];
`;

	await writeFile('src/tmp/context.tsx', contextContent, 'utf-8');

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