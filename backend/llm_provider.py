# llm_provider.py - Flexible LLM Provider Configuration

import os
import requests
import json
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from config import Config

class LLMProvider(ABC):
    """Abstract base class for LLM providers"""
    
    @abstractmethod
    def query(self, messages: list, temperature: float = 0.7, max_tokens: int = 2000) -> Dict[str, Any]:
        """Send query to LLM provider"""
        pass
    
    @abstractmethod
    def get_model_name(self) -> str:
        """Get the model name being used"""
        pass

class DeepseekProvider(LLMProvider):
    """Deepseek AI provider"""
    
    def __init__(self):
        self.api_key = Config.DEEPSEEK_API_KEY
        self.base_url = Config.DEEPSEEK_BASE_URL
        self.model = Config.DEEPSEEK_MODEL
    
    def query(self, messages: list, temperature: float = 0.7, max_tokens: int = 2000) -> Dict[str, Any]:
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        response = requests.post(
            f"{self.base_url}/chat/completions",
            headers=headers,
            json=payload,
            timeout=60
        )
        
        if response.status_code == 200:
            ai_response = response.json()
            content = ai_response['choices'][0]['message']['content']
            return {
                "content": content,
                "model": self.model,
                "provider": "deepseek",
                "success": True
            }
        else:
            return {
                "error": f"Deepseek API error: {response.status_code}",
                "details": response.text,
                "provider": "deepseek",
                "success": False
            }
    
    def get_model_name(self) -> str:
        return self.model

class OpenAIProvider(LLMProvider):
    """OpenAI provider"""
    
    def __init__(self):
        self.api_key = Config.OPENAI_API_KEY
        self.base_url = Config.OPENAI_BASE_URL
        self.model = Config.OPENAI_MODEL
    
    def query(self, messages: list, temperature: float = 0.7, max_tokens: int = 2000) -> Dict[str, Any]:
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        response = requests.post(
            f"{self.base_url}/chat/completions",
            headers=headers,
            json=payload,
            timeout=60
        )
        
        if response.status_code == 200:
            ai_response = response.json()
            content = ai_response['choices'][0]['message']['content']
            return {
                "content": content,
                "model": self.model,
                "provider": "openai",
                "success": True
            }
        else:
            return {
                "error": f"OpenAI API error: {response.status_code}",
                "details": response.text,
                "provider": "openai",
                "success": False
            }
    
    def get_model_name(self) -> str:
        return self.model

class AnthropicProvider(LLMProvider):
    """Anthropic Claude provider"""
    
    def __init__(self):
        self.api_key = Config.ANTHROPIC_API_KEY
        self.base_url = Config.ANTHROPIC_BASE_URL
        self.model = Config.ANTHROPIC_MODEL
    
    def query(self, messages: list, temperature: float = 0.7, max_tokens: int = 2000) -> Dict[str, Any]:
        headers = {
            'x-api-key': self.api_key,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
        }
        
        # Convert messages to Anthropic format
        system_message = ""
        user_messages = []
        
        for msg in messages:
            if msg['role'] == 'system':
                system_message = msg['content']
            else:
                user_messages.append(msg['content'])
        
        user_content = "\n".join(user_messages)
        
        payload = {
            "model": self.model,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": [
                {
                    "role": "user",
                    "content": user_content
                }
            ]
        }
        
        if system_message:
            payload["system"] = system_message
        
        response = requests.post(
            f"{self.base_url}/v1/messages",
            headers=headers,
            json=payload,
            timeout=60
        )
        
        if response.status_code == 200:
            ai_response = response.json()
            content = ai_response['content'][0]['text']
            return {
                "content": content,
                "model": self.model,
                "provider": "anthropic",
                "success": True
            }
        else:
            return {
                "error": f"Anthropic API error: {response.status_code}",
                "details": response.text,
                "provider": "anthropic",
                "success": False
            }
    
    def get_model_name(self) -> str:
        return self.model

class GoogleAIProvider(LLMProvider):
    """Google AI (Gemini) provider"""
    
    def __init__(self):
        self.api_key = Config.GOOGLE_API_KEY
        self.base_url = Config.GOOGLE_BASE_URL
        self.model = Config.GOOGLE_MODEL
    
    def query(self, messages: list, temperature: float = 0.7, max_tokens: int = 2000) -> Dict[str, Any]:
        headers = {
            'Content-Type': 'application/json'
        }
        
        # Convert messages to Google AI format
        contents = []
        for msg in messages:
            contents.append({
                "role": msg['role'],
                "parts": [{"text": msg['content']}]
            })
        
        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens
            }
        }
        
        response = requests.post(
            f"{self.base_url}/models/{self.model}:generateContent?key={self.api_key}",
            headers=headers,
            json=payload,
            timeout=60
        )
        
        if response.status_code == 200:
            ai_response = response.json()
            content = ai_response['candidates'][0]['content']['parts'][0]['text']
            return {
                "content": content,
                "model": self.model,
                "provider": "google",
                "success": True
            }
        else:
            return {
                "error": f"Google AI API error: {response.status_code}",
                "details": response.text,
                "provider": "google",
                "success": False
            }
    
    def get_model_name(self) -> str:
        return self.model

class LLMProviderFactory:
    """Factory for creating LLM providers"""
    
    @staticmethod
    def create_provider(provider_name: str = None) -> LLMProvider:
        """Create LLM provider based on configuration"""
        
        if provider_name is None:
            provider_name = Config.LLM_PROVIDER
        
        provider_name = provider_name.lower()
        
        if provider_name == 'deepseek':
            return DeepseekProvider()
        elif provider_name == 'openai':
            return OpenAIProvider()
        elif provider_name == 'anthropic':
            return AnthropicProvider()
        elif provider_name == 'google':
            return GoogleAIProvider()
        else:
            # Default to Deepseek if provider not found
            print(f"Warning: Unknown provider '{provider_name}', defaulting to Deepseek")
            return DeepseekProvider()

# Global provider instance
llm_provider = LLMProviderFactory.create_provider() 