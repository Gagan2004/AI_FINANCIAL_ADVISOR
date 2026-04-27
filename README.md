# FinSmart AI 💰🤖

FinSmart AI is a state-of-the-art, full-stack personal financial advisor. It combines traditional budgeting metrics and clean transaction visualizations with a state-of-the-art native AI advisor to help you make sense of your financial data in natural language.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:

1.  **Python 3.11+** (for the Backend)
2.  **Node.js 20+** (for the Frontend)
3.  **PostgreSQL** (if running without Docker)
4.  **Docker & Docker Compose** (Recommended for easy setup)
5.  **Ollama (Local AI Engine)**:
    *   Download and install from: [https://ollama.com/download](https://ollama.com/download)
    *   Once installed, open your terminal (CMD or PowerShell) and run the following command to download the model:
        ```bash
        ollama run llama3.1:8b
        ```
    *   **Crucial Step for Docker Users**: If you are running the project in Docker, you must set an environment variable on your Windows machine so Docker can talk to Ollama:
        1. Open "Environment Variables" in Windows.
        2. Add a new User Variable: `OLLAMA_HOST` with value `0.0.0.0`.
        3. Restart the Ollama application.

---

## 🚀 Quick Start (Docker - Recommended)

The easiest way to get FinSmart AI running is via Docker Compose.

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/finsmart-ai.git
    cd finsmart-ai
    ```

2.  **Configure Environment Variables**
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL=postgresql://user:password@db/finsmart
    GOOGLE_API_KEY=your_gemini_api_key_here
    SECRET_KEY=your_secure_random_string
    NEXT_PUBLIC_API_URL=http://localhost:8000
    ```

3.  **Launch the App**
    ```bash
    docker-compose up --build -d
    ```
    *   **Frontend**: [http://localhost:3000](http://localhost:3000)
    *   **Backend Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🏗️ Manual Setup (Non-Docker)

If you prefer to run the components natively on your machine:

### 1. Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

### 3. Database
Ensure a local PostgreSQL instance is running and update your `.env` to point to `localhost:5432`.

---

## ✨ Features

*   **Dual-AI Advisor**: Seamlessly switch between **Google Gemini 1.5 Flash** (Cloud) and **Llama 3.1** (Local via Ollama).
*   **Dynamic Dashboard**: Real-time charts (Recharts) showing income vs. expenses and category breakdowns.
*   **Budgeting System**: Set monthly limits and track spending progress with animated visual indicators.
*   **Smart History**: Categorized transaction management with multi-tab switching.
*   **Premium UI**: Sleek dark-mode interface with a **Collapsible Sidebar** and smooth transitions.

---

## 🗂️ Project Structure

```text
finsmart-ai/
├── backend/           # FastAPI application & AI Service
├── frontend/          # Next.js 15 dashboard & UI
├── docker-compose.yml # Orchestration for DB, App, and UI
└── README.md          # You are here!
```

## 📄 License
This project is licensed under the MIT License.
