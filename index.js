import 'dotenv/config'
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY']
});

const content = `Both list A and B are node module packages.
Please compare the packages in lists A and B, and find the replaceable packages.
The replaceable package means similar and alternative package.
If replaceable packages are found, please present the information in the following JSON format:
[ { "pkgName1": "[package from A list]", "pkgName2": "[package from B list]", "description": "[brief explanation of the similarity]" }]
If no replaceable packages are found, output []. Please ensure only the JSON format is provided in the response.`;

async function main() {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: content }],
    model: 'gpt-3.5-turbo-1106',
    response_format: { type: 'json_object' },
  });

  console.log(chatCompletion.choices[0].message)
}

main();