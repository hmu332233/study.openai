import pkg from '@slack/bolt';
import Config from './config/app/config.json' assert { type: 'json' };

import { getAssistantResponse } from './src/modules/openai.js';

const { App } = pkg;

const slackApp = new App({
	signingSecret: Config.slack.oauth.signing_secret,
	token: Config.slack.oauth.bot_token,
	appToken: Config.slack.oauth.app_token,
	socketMode: true,
});

// FIXME: 대화 스레드 관리를 위한 임시 저장소 (레디스 등으로 대체 필요)
const threadStore = {};

const filterEvents = async ({ event, next }) => {
	// DM 채널에서는 메세지를 보내기만해도 사용
	const isMessageEvent =
		event.type === 'message' && event.channel_type === 'im';

	// 채널에서 @봇명을 언급하면 사용
	const isAppMention = event.type === 'app_mention';

	// 스레드에 답변을 달면 사용
	const isThreadStored = threadStore[event.thread_ts];

	if (isMessageEvent || isAppMention || isThreadStored) {
		await next();
	}
};

const handler = async ({ event, message, say }) => {
	try {
		console.log('event', event);
		console.log('message', message);

		await say({
			text: '잠시만 기다려주세요! 캘린더를 확인하는 중입니다.',
			thread_ts: event.ts, // thread_ts를 지정하면 thread에 답변을 달 수 있음
		});

		const content = `현재 시간: ${new Date().toISOString()}\n유저 질문: ${
			event.text
		}`;
		console.log(content);

		const threadId = threadStore[event.thread_ts];

		console.log('threadId', threadId);

		const { message: botMessage, threadId: newThreadId } =
			await getAssistantResponse(
				{
					assistantId: Config.openai.assistant.calendarBotId, // 캘린더 봇용
					content,
				},
				threadId,
			);

		if (!threadId) {
			threadStore[event.ts] = newThreadId;
		}

		await say({
			text: botMessage,
			thread_ts: event.ts, // thread_ts를 지정하면 thread에 답변을 달 수 있음
		});
	} catch (err) {
		await say({
			text: '죄송합니다. 현재 서버에 문제가 발생하여 캘린더를 확인할 수 없습니다. 다시 시도해주세요.',
			thread_ts: event.ts, // thread_ts를 지정하면 thread에 답변을 달 수 있음
		});
	}
};

slackApp.event('app_mention', filterEvents, handler);
slackApp.message(filterEvents, handler);

(async () => {
	// Start the app
	await slackApp.start(Config.port || 3000);

	console.log('⚡️ Bolt app is running!');
})();
