const fetch = globalThis.fetch || require('node-fetch');
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('Missing ANTHROPIC_API_KEY');
  process.exit(1);
}

const models = ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3.1'];

(async () => {
  for (const model of models) {
    console.log(`\n=== MODEL: ${model} ===`);
    const body = {
      model,
      max_tokens: 20,
      messages: [{ role: 'user', content: 'Hello world' }],
    };
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify(body),
      });
      console.log('status', response.status);
      console.log('headers', Object.fromEntries(response.headers.entries()));
      const text = await response.text();
      console.log('body', text.slice(0, 2000));
      if (text.length > 2000) {
        console.log('[truncated]');
      }
    } catch (err) {
      console.error('fetch error', err);
    }
  }
})();
