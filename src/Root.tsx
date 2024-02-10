import { Composition, staticFile } from 'remotion';
import { AudioGramSchema, AudiogramComposition, fps } from './Composition';
import './style.css';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="Audiogram"
				component={AudiogramComposition}
				fps={fps}
				width={1080}
				height={1920}
				schema={AudioGramSchema}
				defaultProps={{
					// Audio settings
					audioOffsetInSeconds: 0,
					// Title settings
					audioFileName: staticFile('audio.mp3'),
					titleText: 'Back propagation',
					titleColor: 'rgba(186, 186, 186, 0.93)',

					// Subtitles settings
					subtitlesFileName: [
						{
							name: 'JOE_ROGAN',
							file: staticFile('srt/JOE_ROGAN-0.srt'),
						},
						{
							name: 'JORDAN_PETERSON',
							file: staticFile('srt/JORDAN_PETERSON-1.srt'),
						},
						{
							name: 'JOE_ROGAN',
							file: staticFile('srt/JOE_ROGAN-2.srt'),
						},
						{
							name: 'JORDAN_PETERSON',
							file: staticFile('srt/JOE_ROGAN-3.srt'),
						},
						{
							name: 'JOE_ROGAN',
							file: staticFile('srt/JORDAN_PETERSON-4.srt'),
						},
						{
							name: 'JORDAN_PETERSON',
							file: staticFile('srt/JOE_ROGAN-5.srt'),
						},
						{
							name: 'JOE_ROGAN',
							file: staticFile('srt/JOE_ROGAN-6.srt'),
						},
						{
							name: 'JORDAN_PETERSON',
							file: staticFile('srt/JORDAN_PETERSON-7.srt'),
						},
					],
					agent_details: {
						JOE_ROGAN: {
							color: '#bc462b',
							image: 'JOE_ROGAN.png',
						},
						JORDAN_PETERSON: {
							color: '#ffffff',
							image: 'JORDAN_PETERSON.png',
						},
					},
					onlyDisplayCurrentSentence: true,
					subtitlesTextColor: 'rgba(255, 255, 255, 0.93)',
					subtitlesLinePerPage: 4,
					subtitlesZoomMeasurerSize: 10,
					subtitlesLineHeight: 128,

					// Wave settings
					waveFreqRangeStartIndex: 7,
					waveLinesToDisplay: 15,
					waveNumberOfSamples: '256', // This is string for Remotion controls and will be converted to a number
					mirrorWave: true,
					durationInSeconds: 60,
				}}
				// Determine the length of the video based on the duration of the audio file
				calculateMetadata={({ props }) => {
					return {
						durationInFrames: props.durationInSeconds * fps,
						props,
					};
				}}
			/>
		</>
	);
};