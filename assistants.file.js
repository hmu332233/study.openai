import 'dotenv/config'
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY']
});

async function main() {
  // const assistant = await openai.beta.assistants.create({
  //   name: '파이썬 강좌 임베딩용',
  //   instructions: prompts,
  //   model: 'gpt-3.5-turbo-1106',
  //   tools: [{"type": "retrieval"}],
  //   file_ids: [process.env['PYTHON_FILE_ID']],
  // });

  // const thread = await openai.beta.threads.create();
  // console.log(thread)
  
  const assistantId = '';
  const threadId = '';

  // const message = await openai.beta.threads.messages.create(
  //   threadId,
  //   {
  //     role: "user",
  //     content: "이 강좌에서는 무엇을 배우나요?"
  //   }
  // );

  // console.log(message)

  // const run = await openai.beta.threads.runs.create(
  //   threadId,
  //   { assistant_id: assistantId }
  // );

  // console.log(run)

  // const runId = '';
  // const runRes = await openai.beta.threads.runs.retrieve(
  //   threadId,
  //   runId,
  // );

  // console.log(runRes)

  const messages = await openai.beta.threads.messages.list(
    threadId,
  );

  console.log(messages.data.map(d => JSON.stringify(d.content)))
}

main();