// Centralized frontend configuration loaded from environment variables
// Note: Only variables prefixed with REACT_APP_ are exposed to the frontend

export interface LLMConfig {
  provider: string;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

export interface AppConfig {
  env: string;
  apiBaseUrl: string;
  llm: LLMConfig;
}

const env = (process.env.REACT_APP_ENV || process.env.NODE_ENV || 'development').toLowerCase();
const isProduction = env === 'production';

const apiBaseUrl =
  process.env.REACT_APP_API_BASE_URL?.trim() ||
  (isProduction ? '/api' : 'http://localhost:5001');

const llmConfig: LLMConfig = {
  provider: process.env.REACT_APP_LLM_PROVIDER?.trim() || 'openai',
  apiKey: process.env.REACT_APP_LLM_API_KEY?.trim(),
  model: process.env.REACT_APP_LLM_MODEL?.trim() || 'gpt-4o-mini',
  baseUrl: process.env.REACT_APP_LLM_BASE_URL?.trim(),
};

// Avoid exposing the API key in logs; only log presence
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line no-console
  console.debug('[config] env=%s apiBaseUrl=%s llm.provider=%s llm.model=%s llmKey=%s',
    env, apiBaseUrl, llmConfig.provider, llmConfig.model, llmConfig.apiKey ? 'set' : 'unset');
}

const config: AppConfig = {
  env,
  apiBaseUrl,
  llm: llmConfig,
};

export default config;


