const { Anthropic } = require('@anthropic-ai/sdk');
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function testModel(model) {
  console.log(`\nTesting model: ${model}`);
  try {
    const response = await client.messages.create({
      model,
      max_tokens: 20,
      messages: [{ role: 'user', content: 'Hello world' }],
    });
    console.log('SUCCESS:', response);
  } catch (err) {
    console.error('ERROR NAME:', err.name);
    console.error('ERROR STATUS:', err.status);
    console.error('ERROR MESSAGE:', err.message);
    console.error('ERROR ERROR FIELD:', err.error);
    console.error('ERROR HEADERS:', err.headers && JSON.stringify(Object.fromEntries(err.headers), null, 2));
    console.error('ERROR FULL:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
  }
}

(async () => {
  await testModel('claude-3-5-sonnet-20241022');
  await testModel('claude-3-opus-20240229');
  await testModel('claude-3.1');
})();
