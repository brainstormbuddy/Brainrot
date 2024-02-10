import { OpenAI } from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export default async function transcriptFunction(topic) {
	const completion = await openai.chat.completions.create({
		messages: [
			{
				role: 'system',
				content: `Craft a dialogue for a short-form dialogue featuring a conversation between Joe Rogan and Jordan Peterson on the topic of ${topic}. The dialogue should be infused with humor to engage viewers while also providing insightful commentary on the subject matter. The dialogue should follow the characters respective unique mannerisms. At the same time, the dialogue should offer a glimpse into ${topic}, showcasing Peterson's intellectual perspective and Rogan's curiosity. The transcript should be concise, with a maximum of 8 back-and-forth exchanges, and structured to be delivered within 45-55 seconds. The person attribute should either be JOE_ROGAN or JORDAN_PETERSON. The line attribute should be a that character's line of dialogue.`,
			},
		],
		functions: [
			{
				name: 'transcript',
				description: `Transcript between two people about a topic.`,
				parameters: {
					type: 'object',
					properties: {
						transcript: {
							type: 'array',
							items: {
								type: 'object',
								properties: {
									person: { type: 'string' },
									line: { type: 'string' },
								},
								required: ['person', 'line'],
							},
						},
					},
					required: ['line'],
				},
			},
		],
		function_call: { name: 'transcript' },
		model: 'gpt-4-1106-preview',
	});

	const responseBody = await JSON.parse(
		completion.choices[0]?.message.function_call.arguments
	);

	return responseBody;
}