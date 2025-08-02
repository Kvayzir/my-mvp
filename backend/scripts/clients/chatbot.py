"""
Chatbot module handling AI response generation using Llama via Hugging Face API.
"""
import os
import requests
import time
from huggingface_hub import InferenceClient
from typing import List, Dict, Any

class ChatBot:
    """Handles AI response generation and fallback responses."""
    
    def __init__(self, dummy=False):
        """Initialize the chatbot with API configuration."""
        self.dummy = dummy
        self.default_max_tokens = 200
        self.hf_token = os.getenv("HUGGINGFACE_TOKEN")
        self.client = InferenceClient(
            provider="novita",
            api_key=self.hf_token,
        )
        self.model = "meta-llama/Llama-3.1-8B-Instruct"
        
    def generate_welcome_message(self, context: str) -> str:
        return f"Hola ##! Hoy hablaremos de {context}. \n¿Estás listo para empezar?"
    
    def generate_update_message(self, context: str) -> str:
        return f"Siguiente tema: {context}. \n¿Listo para continuar?"

    def generate_response(self, context: List[Dict[str, str]]) -> str:
        """
        Generate a response to the user's message.
        
        Args:
            context: The user's message and chat history for context.
            
        Returns:
            Generated response string
        """
        return self._generate_response(context)
        
    def _generate_response(self, context: List[Dict[str, str]]) -> str:
        if self.dummy:
            # Dummy response for testing
            print(f"Generating response from context of length: {len(context)}")
            print(f"Recent messages: {context}")
            time.sleep(2)  # Simulate processing delay
            return f"This is a dummy response {len(context)}. The AI prompt is from: \n{context[1]['role']}\n"
        if self.hf_token:
            try:
                return self._generate_llama_response(context)
            except Exception as e:
                print(f"Error with Llama API: {e}")
                return self._generate_fallback_response(context[-1]["message"])
        else:
            return self._generate_fallback_response(context[-1]["message"])
    
    def _generate_llama_response(self, context: List[Dict[str, Any]]) -> str:
        """
        Generate response using Llama via Hugging Face API.
        
        Args:
            message: The user's message
            chat_history: Full chat history for context
            
        Returns:
            Generated response from Llama
            
        Raises:
            Exception: If API call fails or response is invalid
        """
        print(f"Querying Llama API with {len(context)} messages")
        print(f"Recent messages: {context}")
        
        # Query Llama API
        response = self._query_llama_api(context)
        return response
    
    def _query_llama_api(self, messages: List[Dict[str, str]], max_tokens: int = None) -> str:
        """
        Query Llama model via Hugging Face Inference API.
        
        Args:
            messages: List of conversation messages
            max_tokens: Maximum tokens to generate
            
        Returns:
            Generated response text
            
        Raises:
            Exception: If API request fails or returns invalid response
        """
        if not self.hf_token:
            raise Exception("Hugging Face token not configured")
        
        max_tokens = max_tokens or self.default_max_tokens
        
        headers = {
            "Authorization": f"Bearer {self.hf_token}",
            "Content-Type": "application/json"
        }
        
        # Format messages for Llama chat template
        conversation = self._format_conversation(messages)
        
        payload = {
            "inputs": conversation,
            "parameters": {
                "max_new_tokens": max_tokens,
                "temperature": 0.7,
                "top_p": 0.9,
                "do_sample": True,
                "stop": ["<|eot_id|>", "<|end_of_text|>"]
            }
        }
        
        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
            )
            response_text = completion.choices[0].message.content
            print(f"Response from Llama API: {response_text}")
            return response_text if response_text else "I'm not sure how to respond to that."
        
        except requests.exceptions.Timeout:
            raise Exception("Request timed out - the model might be loading")
        except requests.exceptions.RequestException as e:
            raise Exception(f"API request failed: {str(e)}")
        except Exception as e:
            raise Exception(f"Error processing response: {str(e)}")
    
    def _format_conversation(self, messages: List[Dict[str, str]]) -> str:
        """
        Format messages for Llama chat template.
        
        Args:
            messages: List of conversation messages
            
        Returns:
            Formatted conversation string
        """
        conversation = ""
        for msg in messages:
            if msg["role"] == "user":
                conversation += f"<|start_header_id|>user<|end_header_id|>\n{msg['content']}<|eot_id|>"
            elif msg["role"] == "assistant":
                conversation += f"<|start_header_id|>assistant<|end_header_id|>\n{msg['content']}<|eot_id|>"
        
        # Add the assistant start token for the response
        conversation += "<|start_header_id|>assistant<|end_header_id|>\n"
        return conversation
    
    def _extract_response_text(self, result: Any) -> str:
        """
        Extract generated text from API response.
        
        Args:
            result: API response JSON
            
        Returns:
            Generated text string
            
        Raises:
            Exception: If response format is unexpected
        """
        if isinstance(result, list) and len(result) > 0:
            return result[0].get("generated_text", "")
        elif isinstance(result, dict):
            return result.get("generated_text", "")
        else:
            raise Exception(f"Unexpected response format: {result}")
    
    def _clean_response(self, generated_text: str, conversation: str) -> str:
        """
        Clean and extract the new response from generated text.
        
        Args:
            generated_text: Full generated text from API
            conversation: Original conversation context
            
        Returns:
            Cleaned response text
        """
        # Extract only the new response (remove the input conversation)
        if conversation in generated_text:
            new_response = generated_text.replace(conversation, "").strip()
        else:
            new_response = generated_text.strip()
        
        # Clean up the response
        new_response = new_response.replace("<|eot_id|>", "").replace("<|end_of_text|>", "").strip()
        return new_response
    
    def _generate_fallback_response(self, message: str) -> str:
        """
        Generate fallback responses when Llama API isn't available.
        
        Args:
            message: The user's message
            
        Returns:
            Appropriate fallback response
        """
        message_lower = message.lower().strip()
        
        fallback_responses = {
            ("hello", "hi", "hey"): "Hello! I'm having trouble connecting to my AI brain right now, but I'm here to chat!",
            ("how are you", "how's it going"): "I'm doing well, thanks! Though I should mention I'm running on backup responses right now.",
            ("bye", "goodbye", "see you"): "Goodbye! Hope to chat with you again soon!",
            ("help",): "I'm here to help! I'm currently running on simple responses, but I can still try to assist you."
        }
        
        for keywords, response in fallback_responses.items():
            if any(word in message_lower for word in keywords):
                return response
        
        return "That's interesting! I'm currently having trouble with my main AI system, but I'm still here to chat with you."
    
    def set_max_tokens(self, max_tokens: int) -> None:
        """
        Set the default maximum tokens for responses.
        
        Args:
            max_tokens: Maximum number of tokens to generate
        """
        self.default_max_tokens = max_tokens