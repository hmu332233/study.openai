import Config from '../../config/app/config.json' assert { type: 'json' };

import OpenAI from 'openai';

import { functionMap } from './openai.func.js';

const openai = new OpenAI({
	apiKey: Config.openai.key,
});

export async function getAssistantResponse({ assistantId, content }, threadId) {
	const thread = threadId
		? await openai.beta.threads.retrieve(threadId)
		: await openai.beta.threads.create();
	const newMessage = await openai.beta.threads.messages.create(thread.id, {
		role: 'user',
		content,
	});

	const run = await openai.beta.threads.runs.create(thread.id, {
		assistant_id: assistantId,
	});

	let actualRun = await openai.beta.threads.runs.retrieve(thread.id, run.id);

	// NOTE: openaiv4 assistant 현재 스펙이 polling 방식으로 되어있음
	// push와 같은 방식이 추가된다면 개선 필요
	while (
		actualRun.status === 'queued' ||
		actualRun.status === 'in_progress' ||
		actualRun.status === 'requires_action'
	) {
		if (actualRun.status === 'requires_action') {
			const { id: callId, function: functionObj } =
				actualRun.required_action.submit_tool_outputs.tool_calls[0];
			console.log(functionObj);
			const { name, arguments: args } = functionObj;
			const results = await functionMap[name](JSON.parse(args));
			console.log('results', results);

			await openai.beta.threads.runs.submitToolOutputs(thread.id, run.id, {
				tool_outputs: [
					{
						tool_call_id: callId,
						output: JSON.stringify(results),
					},
				],
			});
		}

		actualRun = await openai.beta.threads.runs.retrieve(thread.id, run.id);
		await new Promise((resolve) => setTimeout(resolve, 1000));
		console.log('현재 상태:', actualRun.status);
	}

	const messages = await openai.beta.threads.messages.list(thread.id, {
		order: 'asc',
		after: newMessage.id,
	});
	return {
		threadId: thread.id,
		message: messages.data
			.map((message) => message.content[0].text.value)
			.join('\n'),
	};
}
