import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';

function concatenateAudioFiles() {
	const directoryPath = 'public/audio/';
	const silenceAudioFile = 'public/silence.mp3'; // Ensure this file exists in 'public/audio/'

	// Make sure the tmp directory exists
	if (!fs.existsSync('tmp/')) {
		fs.mkdirSync('tmp/');
	}

	// Read the directory and get all the audio files
	const files = fs
		.readdirSync(directoryPath)
		.filter((file) => file.endsWith('.mp3') && !file.startsWith('silence'));

	console.log('Files to concatenate:', files); // Additional logging

	// Sort the audio files based on the number in their name
	files.sort((a, b) => {
		const numberA = parseInt(a.split('-')[1], 10);
		const numberB = parseInt(b.split('-')[1], 10);
		return numberA - numberB;
	});

	console.log('Sorted files:', files); // Additional logging

	// Initialize ffmpeg command
	const command = ffmpeg();

	// Loop through the sorted audio files
	files.forEach((file, index) => {
		console.log('Adding file to ffmpeg:', file); // Additional logging
		command.input(path.join(directoryPath, file));
		// Add the silence audio file if it's not the last file
		if (index < files.length - 1) {
			console.log('Adding silence to ffmpeg'); // Additional logging
			command.input(silenceAudioFile);
		}
	});

	// Use fluent-ffmpeg to concatenate all the audio files added to the command
	command
		.on('start', (commandLine) => {
			console.log('Spawned Ffmpeg with command:', commandLine);
		})
		.on('error', (err) => {
			console.log('Error:', err.message);
		})
		.on('end', () => {
			console.log('Finished concatenating audio files!');
		})
		.mergeToFile('public/concatenated.mp3', 'tmp/');
}

concatenateAudioFiles();