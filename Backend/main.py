from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from openai import OpenAI

app = FastAPI(
    title="AI Writing Studio API",
    description="Multi-purpose content generation API",
    version="2.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# System prompts for each tool
PROMPTS = {
    "essay": {
        "system": "You are an expert academic essay writer. Write well-structured essays with clear introductions, body paragraphs, and conclusions. Use formal academic language and proper citations.",
        "formats": {
            "short": "300-500 words",
            "medium": "500-800 words",
            "long": "800-1200 words"
        }
    },
    "report": {
        "system": "You are a professional business report writer. Create detailed reports with executive summaries, findings, analysis, and recommendations. Use formal business language.",
        "formats": {
            "brief": "400-600 words",
            "standard": "700-1000 words",
            "detailed": "1200-1500 words"
        }
    },
    "article": {
        "system": "You are an engaging article and blog post writer. Write compelling, SEO-friendly content with catchy headlines and clear structure. Make it readable and informative.",
        "formats": {
            "short": "400-600 words",
            "medium": "700-1000 words",
            "long": "1200-1500 words"
        }
    },
    "summary": {
        "system": "You are an expert at summarizing content. Extract key points and create concise summaries while maintaining the essential meaning.",
        "formats": {
            "bullet": "Bullet points with key takeaways",
            "paragraph": "2-3 paragraph summary",
            "detailed": "Comprehensive summary with all main points"
        }
    },
    "explanation": {
        "system": "You are a skilled explainer who makes complex topics easy to understand. Use analogies, examples, and clear language.",
        "formats": {
            "simple": "Simple explanation (ELI5 style)",
            "moderate": "Moderate detail explanation",
            "detailed": "Comprehensive detailed explanation"
        }
    },
    "social": {
        "system": "You are a social media content creator. Write engaging, concise posts optimized for social platforms. Use emojis, hashtags, and compelling hooks.",
        "formats": {
            "tweet": "Twitter/X post (280 characters)",
            "post": "Standard social media post",
            "thread": "Twitter/X thread (multiple connected posts)"
        }
    }
}

# Request/Response Models
class ContentRequest(BaseModel):
    tool: str
    topic: str
    length: str
    tone: str

class ContentResponse(BaseModel):
    content: str
    word_count: int
    tool_used: str

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "AI Writing Studio API",
        "status": "online",
        "version": "2.0.0",
        "available_tools": list(PROMPTS.keys())
    }

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "api": "operational"}

# Main content generation endpoint
@app.post("/generate", response_model=ContentResponse)
async def generate_content(request: ContentRequest):
    try:
        if request.tool not in PROMPTS:
            raise HTTPException(status_code=400, detail="Invalid tool specified")

        tool_config = PROMPTS[request.tool]
        length_desc = tool_config["formats"].get(request.length, "appropriate length")

        # Build the prompt based on tool type
        if request.tool == "summary":
            user_prompt = f"""Summarize the following text in a {request.tone} style.
Format: {length_desc}

Text to summarize:
{request.topic}"""
        else:
            user_prompt = f"""Write a {request.tone} {request.tool} about: {request.topic}

Requirements:
- Length: {length_desc}
- Tone: {request.tone}
- Format: {tool_config['formats'][request.length]}
- Make it engaging, well-structured, and professional
"""

        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": tool_config["system"]},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )

        content = response.choices[0].message.content
        word_count = len(content.split())

        return ContentResponse(
            content=content,
            word_count=word_count,
            tool_used=request.tool
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Batch generation endpoint (for multiple variations)
@app.post("/generate-batch")
async def generate_batch(requests: list[ContentRequest]):
    """Generate multiple pieces of content at once"""
    try:
        results = []
        for req in requests:
            response = await generate_content(req)
            results.append(response)
        return {"results": results, "count": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get tool information
@app.get("/tools/{tool_name}")
async def get_tool_info(tool_name: str):
    """Get information about a specific tool"""
    if tool_name not in PROMPTS:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    return {
        "tool": tool_name,
        "description": PROMPTS[tool_name]["system"],
        "formats": PROMPTS[tool_name]["formats"]
    }

# Run with: uvicorn multi_writer:app --reload --host 0.0.0.0 --port 8000
