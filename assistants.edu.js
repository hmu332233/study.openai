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

  const thread = await openai.beta.threads.create();
  // console.log(thread)
  
  const assistantId = '';

  const message = await openai.beta.threads.messages.create(
    thread.id,
    {
      role: "user",
      content: ``
    }
  );


  const run = await openai.beta.threads.runs.create(
    thread.id,
    { assistant_id: assistantId }
  );

  console.log(run)

  let actualRun = await openai.beta.threads.runs.retrieve(
    thread.id,
    run.id,
  );

  while (
    actualRun.status === "queued" ||
    actualRun.status === "in_progress"
  ) {
    console.log('queued', actualRun.status)
    await new Promise((resolve) => setTimeout(resolve, 2000));
    actualRun = await openai.beta.threads.runs.retrieve(thread.id, run.id);
  }

  const messages = await openai.beta.threads.messages.list(
    thread.id,
  );

  const lastMessageForRun = messages.data
  .filter(
    (message) =>
      message.run_id === run.id && message.role === "assistant",
  )
  .pop();

  // If an assistant message is found, console.log() it
  if (lastMessageForRun) {
    // aparently the `content` array is not correctly typed
    // content returns an of objects do contain a text object
    const messageValue = lastMessageForRun.content[0];

    console.log(`${messageValue?.text?.value} \n`);
  }
}

main();