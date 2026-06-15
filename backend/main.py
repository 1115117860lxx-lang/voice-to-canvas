import os
import re

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from typing import Literal
from pydantic import BaseModel, Field

load_dotenv()

SILICONFLOW_BASE_URL = "https://api.siliconflow.cn/v1"
SILICONFLOW_MODEL = "deepseek-ai/DeepSeek-V4-Flash"

SYSTEM_PROMPT = (
    "你是一个精通 SVG 语法的顶级设计师。"
    "你的任务是将用户的绘图需求转化为一段极其精美、纯净、现代极客风格的 SVG 矢量代码。"
    "输出规范：不要任何 markdown 包裹，不要任何文字解释，直接从 <svg> 开始，到 </svg> 结束。"
    "确保包含合理的 viewBox（如 0 0 800 600）。"
    "图形要多用一些组合和丰富的路径，比如用户要画机器人，你要用多个几何体拼出一个生动的机器人。"
    "使用 xmlns=\"http://www.w3.org/2000/svg\"，配色克制、对比清晰，适合深色 UI 背景展示。"
)

api_key = os.getenv("SILICONFLOW_API_KEY")
client = OpenAI(
    base_url=SILICONFLOW_BASE_URL,
    api_key=api_key,
)

app = FastAPI(title="voice-to-canvas API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CommandRequest(BaseModel):
    text: str = Field(..., description="语音转文本内容")


class CommandResponse(BaseModel):
    action: Literal["add_svg"]
    code: str


def extract_svg_content(content: str) -> str:
    text = content.strip()

    if not text:
        raise HTTPException(status_code=502, detail="大模型返回内容为空")

    fenced_match = re.search(
        r"```(?:svg|xml)?\s*(.*?)\s*```",
        text,
        flags=re.DOTALL | re.IGNORECASE,
    )
    if fenced_match:
        text = fenced_match.group(1).strip()

    svg_match = re.search(r"(<svg[\s\S]*?</svg>)", text, flags=re.IGNORECASE)
    if svg_match:
        text = svg_match.group(1).strip()

    if not text.lower().startswith("<svg"):
        raise HTTPException(
            status_code=502,
            detail="LLM 返回内容未包含有效的 <svg> 起始标签",
        )

    if not text.lower().rstrip().endswith("</svg>"):
        raise HTTPException(
            status_code=502,
            detail="LLM 返回内容未包含有效的 </svg> 结束标签",
        )

    return text


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "message": "v2c brain is online"}


@app.post("/api/command", response_model=CommandResponse)
def handle_command(payload: CommandRequest) -> CommandResponse:
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="未配置 SILICONFLOW_API_KEY 环境变量",
        )

    user_text = payload.text.strip()
    if not user_text:
        raise HTTPException(status_code=400, detail="text 不能为空")

    try:
        completion = client.chat.completions.create(
            model=SILICONFLOW_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_text},
            ],
            temperature=0.4,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"调用大模型失败: {exc}",
        ) from exc

    content = completion.choices[0].message.content
    if not content:
        raise HTTPException(status_code=502, detail="大模型返回内容为空")

    svg_code = extract_svg_content(content)

    return CommandResponse(action="add_svg", code=svg_code)
