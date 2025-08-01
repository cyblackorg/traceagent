# 🤖 LLM Provider Configuration

TraceAgent supports multiple LLM providers that can be configured using environment variables.

## 🔧 Supported Providers

### 1. **Deepseek AI** (Default)
- **Provider**: `deepseek`
- **API Key**: `DEEPSEEK_API_KEY`
- **Model**: `DEEPSEEK_MODEL` (default: `deepseek-chat`)
- **Base URL**: `DEEPSEEK_BASE_URL` (default: `https://api.deepseek.com/v1`)

### 2. **OpenAI**
- **Provider**: `openai`
- **API Key**: `OPENAI_API_KEY`
- **Model**: `OPENAI_MODEL` (default: `gpt-3.5-turbo`)
- **Base URL**: `OPENAI_BASE_URL` (default: `https://api.openai.com/v1`)

### 3. **Anthropic Claude**
- **Provider**: `anthropic`
- **API Key**: `ANTHROPIC_API_KEY`
- **Model**: `ANTHROPIC_MODEL` (default: `claude-3-sonnet-20240229`)
- **Base URL**: `ANTHROPIC_BASE_URL` (default: `https://api.anthropic.com`)

### 4. **Google AI (Gemini)**
- **Provider**: `google`
- **API Key**: `GOOGLE_API_KEY`
- **Model**: `GOOGLE_MODEL` (default: `gemini-pro`)
- **Base URL**: `GOOGLE_BASE_URL` (default: `https://generativelanguage.googleapis.com/v1`)

## 🚀 Quick Setup

### Using Deepseek AI (Default)
```bash
export LLM_PROVIDER=deepseek
export DEEPSEEK_API_KEY=your-deepseek-api-key-here
```

### Using OpenAI
```bash
export LLM_PROVIDER=openai
export OPENAI_API_KEY=your-openai-api-key-here
export OPENAI_MODEL=gpt-4  # Optional: change model
```

### Using Anthropic Claude
```bash
export LLM_PROVIDER=anthropic
export ANTHROPIC_API_KEY=your-anthropic-api-key-here
export ANTHROPIC_MODEL=claude-3-opus-20240229  # Optional: change model
```

### Using Google AI
```bash
export LLM_PROVIDER=google
export GOOGLE_API_KEY=your-google-api-key-here
export GOOGLE_MODEL=gemini-pro  # Optional: change model
```

## 📝 Environment Variables

### Required Variables
- `LLM_PROVIDER`: The provider to use (`deepseek`, `openai`, `anthropic`, `google`)
- `{PROVIDER}_API_KEY`: API key for the selected provider

### Optional Variables
- `{PROVIDER}_MODEL`: Model name for the provider
- `{PROVIDER}_BASE_URL`: Custom base URL (for OpenAI)

## 🔄 Switching Providers

You can switch providers at runtime by changing the `LLM_PROVIDER` environment variable:

```bash
# Switch to OpenAI
export LLM_PROVIDER=openai
export OPENAI_API_KEY=your-key

# Switch to Claude
export LLM_PROVIDER=anthropic
export ANTHROPIC_API_KEY=your-key

# Switch back to Deepseek
export LLM_PROVIDER=deepseek
export DEEPSEEK_API_KEY=your-key
```

## 🐳 Docker Configuration

### Using docker-compose.yml
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    environment:
      - LLM_PROVIDER=openai
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - OPENAI_MODEL=gpt-4
    ports:
      - "5001:5000"
```

### Using .env file
```bash
# .env
LLM_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4
```

## 🔍 Provider Status

Check which provider is currently configured:

```bash
curl http://localhost:5001/api/config
```

This will return the current provider configuration.

## ⚠️ Important Notes

1. **API Keys**: Never commit API keys to version control
2. **Rate Limits**: Different providers have different rate limits
3. **Costs**: Each provider has different pricing models
4. **Fallback**: If a provider fails, the system will show an error message
5. **Model Compatibility**: Ensure the model name is correct for your provider

## 🛠️ Troubleshooting

### Common Issues

1. **Invalid API Key**
   ```
   Error: API key is invalid or expired
   Solution: Check your API key and regenerate if needed
   ```

2. **Provider Not Found**
   ```
   Warning: Unknown provider 'invalid', defaulting to Deepseek
   Solution: Use one of: deepseek, openai, anthropic, google
   ```

3. **Model Not Found**
   ```
   Error: Model not found
   Solution: Check the model name for your provider
   ```

### Testing Configuration

```bash
# Test with curl
curl -X POST http://localhost:5001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, test the AI", "client_id": "maze_bank"}'
```

## 📊 Provider Comparison

| Provider | Cost | Speed | Quality | Best For |
|----------|------|-------|---------|----------|
| Deepseek | Low | Fast | Good | Development |
| OpenAI | Medium | Fast | Excellent | Production |
| Anthropic | High | Medium | Excellent | Analysis |
| Google | Low | Fast | Good | General Use | 