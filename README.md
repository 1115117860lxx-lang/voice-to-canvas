# Voice to Canvas (V2C)

> 🚀 零键鼠干预的纯语音/文本驱动 AI 矢量绘画工作站。本项目致力于通过大模型端到端生成与增量编辑高精度 SVG 矢量图形。

## 📌 当前里程碑：v0.2.0 - Text-to-SVG 核心架构验证

目前项目已成功打通 **“前端文本输入 -> 后端大模型意图解析 -> 实时 Canvas SVG 矢量渲染”** 的全栈核心闭环。当前阶段采用敏捷开发中的“模块解耦测试”策略，暂时使用文本输入框平替语音输入，重点验证绘图引擎与大模型的对话契合度。

### 🌟 核心特性
* 🖥️ **极客工作站沉浸式 UI**：基于 Next.js + TailwindCSS 打造的深色科技感控制台，配备左侧 Agent 实时日志流系统，完美复刻工业级监控台质感。
* 🧠 **大模型代码驱动绘图**：深度接入 **硅基流动 (SiliconFlow)** 平台，利用 `DeepSeek-V4-Flash` 模型强大的代码生成基因，将用户的自然语言需求端到端转化为数千字符的高精度纯 SVG 矢量代码。
* 🎨 **高性能矢量对象渲染**：前端集成 Fabric.js 画布引擎，拒绝渲染传统的“死图墙纸”，而是通过 `fabric.loadSVGFromString` 将大模型生成的矢量路径动态加载为画布独立的**对象模型（Object-Model）**，为下一阶段的多轮增量编辑（如“把眼睛变绿”）奠定了核心底座。
* ⚡ **全局异步流控状态机**：利用 Zustand 构建了全局 Loading 状态机。在大模型生成矢量代码的真空期，画布自动触发毛玻璃脉冲加载特效（*🧠 Agent 正在生成矢量代码...*）并锁定输入，完美消除用户的等待焦虑。
* 🛡️ **硬核的 Git 安全基建**：建立了严密的 Git 物理隔离与全局 `.gitignore` 防线，彻底过滤 `node_modules`、`.next` 及 Python 缓存等体积怪物，确保代码库绝对轻量且隐私安全。

### 🏗️ 技术栈
* **Frontend**: Next.js 15, React 19, Fabric.js, Zustand, TailwindCSS, Lucide React
* **Backend**: FastAPI, Uvicorn, Pydantic, Python-dotenv, Requests
* **AI Engine**: SiliconFlow API (`deepseek-ai/DeepSeek-V4-Flash`)

### 📂 项目目录结构
```text
voice-to-canvas/
├── frontend/             # Next.js 前端工程
│   ├── src/
│   │   ├── components/  # FabricCanvas 渲染引擎与 UI 组件
│   │   └── store/       # Zustand 全局状态中心
│   └── package.json
├── backend/              # FastAPI 后端工程
│   ├── main.py          # 核心路由、System Prompt 驯化与大模型对接
│   ├── .env             # 硅基流动 API 密钥 (Git 安全忽略)
│   └── requirements.txt
└── .gitignore            # 全局黑名单过滤规则


🚀 快速启动指南
1. 后端大脑启动
Bash
cd backend
pip install -r requirements.txt
# 请确保在 backend/.env 中配置了你的 SILICONFLOW_API_KEY
uvicorn main:app --reload --port 8000
2. 前端肌肉启动
Bash
cd frontend
npm install
npm run dev
打开浏览器访问 http://localhost:3000，即可在输入框内发号施令（例如输入：画一个篮球）。
