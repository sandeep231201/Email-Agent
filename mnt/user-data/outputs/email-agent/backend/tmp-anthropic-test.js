const {Anthropic} = require('@anthropic-ai/sdk');
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
(async () => {
  try {
    console.log('Testing non-stream create...');
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 50,
      messages: [{ role: 'user', content: 'Hello world' }],
    });
    console.log('CREATE SUCCESS', response);
  } catch (err) {
    console.error('CREATE ERROR', err);
  }

  try {
    console.log('Testing stream create...');
    const stream = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 50,
      stream: true,
      messages: [{ role: 'user', content: 'Hello world' }],
    });
    for await (const event of stream) {
      console.log('EVENT', event.type, event);
      if (event.type === 'finalMessage') {
        break;
      }
    }
    console.log('STREAM CREATE FINISHED');
  } catch (err) {
    console.error('STREAM CREATE ERROR', err);
  }
})();
