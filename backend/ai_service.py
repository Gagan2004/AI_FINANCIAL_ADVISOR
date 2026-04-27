import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.chat_models import ChatOllama
from langchain.prompts import ChatPromptTemplate
from dotenv import load_dotenv

load_dotenv()

class AIService:
    def __init__(self):
        # Gemini Init
        api_key = os.getenv("GOOGLE_API_KEY")
        self.gemini_llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=api_key,
            temperature=0.7,
            convert_system_message_to_human=True
        )
        
        # Ollama Init (Llama 3.1)
        # We use host.docker.internal to reach the host's Ollama instance from Docker
        self.ollama_llm = ChatOllama(
            model="llama3.1:8b",
            base_url="http://host.docker.internal:11434",
            temperature=0.7
        )

    async def get_financial_advice(self, user_data: list, user_query: str, provider: str = "gemini"):
        """
        user_data: List of transaction summaries
        user_query: The natural language question from the user
        provider: 'gemini' or 'ollama'
        """
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are FinSmart AI, an empathetic and intelligent personal financial advisor. "
                       "Analyze the following transaction data to answer the user's question accurately. "
                       "Be precise with numbers but friendly in tone.\n\n"
                       "Transaction Data:\n{data}"),
            ("user", "{query}")
        ])
        
        llm = self.gemini_llm if provider == "gemini" else self.ollama_llm
        chain = prompt | llm
        
        # Format transaction data for the prompt
        data_str = "\n".join([str(t) for t in user_data])
        
        try:
            response = await chain.ainvoke({"data": data_str, "query": user_query})
            return response.content
        except Exception as e:
            error_msg = str(e)
            print(f"Error calling {provider}: {error_msg}")
            if "500" in error_msg:
                return f"Error: The {provider} server returned an internal error. Please ensure the model is pulled and the server has enough resources."
            elif "connection" in error_msg.lower():
                return f"Error: Could not connect to {provider}. Please ensure it is running and accessible."
            return f"Error calling {provider}: {error_msg[:100]}..."

ai_service = AIService()
