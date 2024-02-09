import { useAudioData, visualizeAudio } from '@remotion/media-utils';
import React, { useEffect, useRef, useState } from 'react';
import {
	AbsoluteFill,
	Audio,
	continueRender,
	delayRender,
	Img,
	random,
	Sequence,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
	Video,
} from 'remotion';

export const fps = 30;

import { PaginatedSubtitles } from './Subtitles';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';

export const AudioGramSchema = z.object({
	durationInSeconds: z.number().positive(),
	audioOffsetInSeconds: z.number().min(0),
	subtitlesFileName: z.string().refine((s) => s.endsWith('.srt'), {
		message: 'Subtitles file must be a .srt file',
	}),
	audioFileName: z.string().refine((s) => s.endsWith('.mp3'), {
		message: 'Audio file must be a .mp3 file',
	}),
	coverImgFileName: z
		.string()
		.refine(
			(s) =>
				s.endsWith('.jpg') ||
				s.endsWith('.jpeg') ||
				s.endsWith('.png') ||
				s.endsWith('.bmp'),
			{
				message: 'Image file must be a .jpg / .jpeg / .png / .bmp file',
			}
		),
	titleText: z.string(),
	titleColor: zColor(),
	waveColor: zColor(),
	subtitlesTextColor: zColor(),
	subtitlesLinePerPage: z.number().int().min(0),
	subtitlesLineHeight: z.number().int().min(0),
	subtitlesZoomMeasurerSize: z.number().int().min(0),
	onlyDisplayCurrentSentence: z.boolean(),
	mirrorWave: z.boolean(),
	waveLinesToDisplay: z.number().int().min(0),
	waveFreqRangeStartIndex: z.number().int().min(0),
	waveNumberOfSamples: z.enum(['32', '64', '128', '256', '512']),
});

type AudiogramCompositionSchemaType = z.infer<typeof AudioGramSchema>;

const AudioViz: React.FC<{
	waveColor: string;
	numberOfSamples: number;
	freqRangeStartIndex: number;
	waveLinesToDisplay: number;
	mirrorWave: boolean;
	audioSrc: string;
}> = ({
	waveColor,
	numberOfSamples,
	freqRangeStartIndex,
	waveLinesToDisplay,
	mirrorWave,
	audioSrc,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const audioData = useAudioData(audioSrc);

	if (!audioData) {
		return null;
	}

	const frequencyData = visualizeAudio({
		fps,
		frame,
		audioData,
		numberOfSamples, // Use more samples to get a nicer visualisation
	});

	// Pick the low values because they look nicer than high values
	// feel free to play around :)
	const frequencyDataSubset = frequencyData.slice(
		freqRangeStartIndex,
		freqRangeStartIndex +
			(mirrorWave ? Math.round(waveLinesToDisplay / 2) : waveLinesToDisplay)
	);

	const frequencesToDisplay = mirrorWave
		? [...frequencyDataSubset.slice(1).reverse(), ...frequencyDataSubset]
		: frequencyDataSubset;

	return (
		<div className="audio-viz">
			{frequencesToDisplay.map((v, i) => {
				return (
					<div
						key={i}
						className="bar bg-[#bc462b]"
						style={{
							minWidth: '1px',
							height: `${500 * Math.sqrt(v)}%`,
						}}
					/>
				);
			})}
		</div>
	);
};

export const AudiogramComposition: React.FC<AudiogramCompositionSchemaType> = ({
	subtitlesFileName,
	audioFileName,
	coverImgFileName,
	titleText,
	titleColor,
	subtitlesTextColor,
	subtitlesLinePerPage,
	waveColor,
	waveNumberOfSamples,
	waveFreqRangeStartIndex,
	waveLinesToDisplay,
	subtitlesZoomMeasurerSize,
	subtitlesLineHeight,
	onlyDisplayCurrentSentence,
	mirrorWave,
	audioOffsetInSeconds,
}) => {
	const { durationInFrames } = useVideoConfig();

	const [handle] = useState(() => delayRender());
	const [subtitles, setSubtitles] = useState<string | null>(null);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		fetch(subtitlesFileName)
			.then((res) => res.text())
			.then((text) => {
				setSubtitles(text);
				continueRender(handle);
			})
			.catch((err) => {
				console.log('Error fetching subtitles', err);
			});
	}, [handle, subtitlesFileName]);

	if (!subtitles) {
		return null;
	}

	const audioOffsetInFrames = Math.round(audioOffsetInSeconds * fps);

	const brainrotVideo = staticFile(
		`brainrot-${Math.round(random(null) * 7)}.mp4`
	);

	console.log(brainrotVideo);

	return (
		<div ref={ref}>
			<AbsoluteFill>
				<Sequence from={-audioOffsetInFrames}>
					<Audio src={audioFileName} />
					<div
						className="relative -z-20 flex flex-col bg-black w-full h-full font-remotionFont"
						style={{
							fontFamily: 'IBM Plex Sans',
						}}
					>
						<div className="w-full h-[50%]">
							<div className="flex flex-row gap-24 items-end h-full p-8">
								<Img src={coverImgFileName} />

								<div>
									<AudioViz
										audioSrc={audioFileName}
										mirrorWave={mirrorWave}
										waveColor={waveColor}
										numberOfSamples={Number(waveNumberOfSamples)}
										freqRangeStartIndex={waveFreqRangeStartIndex}
										waveLinesToDisplay={waveLinesToDisplay}
									/>
								</div>
							</div>
						</div>
						<div className="relative w-full h-[50%]">
							<Video
								className=" h-full w-full object-cover"
								muted
								src={brainrotVideo}
							/>
							<div
								style={{
									lineHeight: `${subtitlesLineHeight}px`,
									WebkitTextStroke: '4px black',
								}}
								className="font-remotionFont z-2 absolute text-6xl text-yellow-300 mx-24 top-24 left-0"
							>
								<PaginatedSubtitles
									subtitles={subtitles.toUpperCase()}
									startFrame={audioOffsetInFrames}
									endFrame={audioOffsetInFrames + durationInFrames}
									linesPerPage={subtitlesLinePerPage}
									subtitlesZoomMeasurerSize={subtitlesZoomMeasurerSize}
									subtitlesLineHeight={subtitlesLineHeight}
									onlyDisplayCurrentSentence={onlyDisplayCurrentSentence}
								/>
							</div>
						</div>
					</div>
				</Sequence>
			</AbsoluteFill>
		</div>
	);
};
