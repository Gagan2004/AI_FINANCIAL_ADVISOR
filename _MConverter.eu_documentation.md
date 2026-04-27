

# **CHAPTER 3: PROJECT ANALYSIS AND DESIGN**

**3.1 FinSmart AI**

**FinSmart AI** is an intelligent personal financial advisor designed to help users track expenses, analyze spending habits, and receive personalized financial guidance. Built using a modern full-stack architecture (Next.js, FastAPI, PostgreSQL), the system integrates Large Language Models (LLMs) to function as a conversational advisor. Unlike traditional finance apps that only display charts, FinSmart AI allows users to interact naturally---asking questions like \"Can I afford a vacation?\"---while the AI analyzes their real-time transaction data to provide actionable, context-aware answers. The project aims to democratize financial literacy by combining intuitive data visualization with the reasoning capabilities of Generative AI.

## **3.2 Software Used** {#software-used}

Here is the comprehensive list of all technologies used in the **FinSmart AI** project:

**1. Frontend (User Interface)**

- **Next.js (React):** The main web framework used for building a fast, interactive, and responsive dashboard.

- **HTML5:** Provides the structural backbone of all web pages.

- **CSS3 & Tailwind CSS:** Used for styling, layout, and ensuring the app looks good on mobile devices.

- **TypeScript / JavaScript:** Handles the client-side logic and interactivity.

- **Recharts:** A library for rendering data visualizations like pie charts and line graphs.

**2. Backend (Server Logic)**

- **Python:** The primary programming language for server-side operations and AI integration.

- **FastAPI:** A high-speed web framework to create the API endpoints that connect the frontend to the database and AI.

- **LangChain:** A framework used to orchestrate the flow between the user\'s data and the AI model.

**3. Database (Storage)**

- **PostgreSQL:** A powerful relational database used to store user profiles, transaction logs, and budgets securely.

- **SQL:** The query language used to interact with the database.

**4. AI & Intelligence**

- **Gemini API (or OpenAI API):** The Large Language Model (LLM) that powers the \"Advisor,\" enabling it to understand and generate natural language responses.

**5. Tools & DevOps**

- **Git & GitHub:** For version control and code collaboration.

- **VS Code:** The primary code editor (IDE).

- **Postman:** Used for testing API endpoints during development.

- **Docker:** Used to containerize the application for consistent performance across different environments.

- **Vercel / Render:** Cloud platforms used for deploying the frontend and backend respectively.

## **3.3 Project Analysis** {#project-analysis}

### **3.3.1 Purpose and Motivation** {#purpose-and-motivation}

**Purpose** The primary purpose of this project is to bridge the gap between static financial data and actionable advice. While traditional apps merely record transactions, **FinSmart AI** aims to function as an intelligent companion that helps users understand *what* their data means. Technically, the project serves to demonstrate the practical application of **Generative AI** and **Full Stack Development** in solving real-world fintech problems, providing a seamless interface where users can converse with their financial records.

**Motivation** The motivation behind this project stems from the observation that financial literacy is often low among students and young professionals. Many individuals struggle to interpret complex bank statements or visualize their spending habits, leading to poor financial health. Driven by the recent advancements in Large Language Models (LLMs), the goal was to build a system that makes financial planning less intimidating and more interactive. The project is designed to replace tedious manual spreadsheets with an empathetic, automated advisor that is available 24/7.

**3.3.2 Objective**

The main objectives of the FinSmart AI project are:

- To Develop a Robust Web Application: To build a secure and scalable full-stack platform using Next.js, FastAPI, and PostgreSQL for managing user financial data.

- To Integrate Artificial Intelligence: To implement a conversational AI agent using LLMs (Gemini/OpenAI) that can analyze transaction history and provide personalized financial advice in natural language.

- To Visualize Financial Data: To create an intuitive dashboard with dynamic charts and graphs, enabling users to identify spending trends and anomalies at a glance.

- To Enhance Financial Literacy: To provide a user-friendly tool that simplifies complex financial concepts, helping users make informed decisions through interactive dialogue.

**3.3.3 Functional Requirements**

**1. User Authentication & Management**

- Registration/Login: The system shall allow users to create an account using an email and password.

- Authentication: The system shall use secure authentication (e.g., JWT Tokens) to ensure users can only access their own financial data.

- Profile Management: The system shall allow users to update their profile details or reset their password.

**2. Transaction Management (Core Features)**

- Add Transaction: The system shall allow users to manually input income and expenses with details such as Amount, Category (Food, Rent, Salary), Date, and Description.

- View History: The system shall provide a list view of all past transactions, filterable by month or category.

- Edit/Delete: The system shall allow users to modify or remove incorrect transaction entries.

**3. AI Advisory System**

- Chat Interface: The system shall provide a conversational interface where users can type natural language queries (e.g., \"How much did I save this month?\").

- Contextual Analysis: The system shall dynamically fetch the user\'s transaction data and feed it to the AI model to generate accurate, data-backed responses.

- Advice Generation: The system shall be capable of identifying spending patterns and suggesting budget improvements (e.g., \"You spent 20% more on dining out than last month\").

**4. Data Visualization & Dashboard**

- Graphical Representation: The system shall generate visual charts (Pie Charts for category breakdown, Bar Graphs for monthly trends) based on the user\'s data.

- Summary Cards: The dashboard shall display immediate \"at-a-glance\" totals for Total Income, Total Expense, and Current Balance.

**5. Data Export (Optional/Advanced)**

- Export Reports: The system shall allow users to download their monthly financial summary as a CSV or PDF file.

**3.3.4 Challenges**

Building an AI-driven financial application presents several technical and ethical hurdles:

- **AI Hallucinations (Accuracy):** Large Language Models (LLMs) are excellent at language but can struggle with precise arithmetic. Ensuring the AI does not \"invent\" numbers or miscalculate totals is a major technical challenge that requires robust prompt engineering and backend verification.

- **Data Privacy & Security:** Handling financial data requires high security. Ensuring that user data is encrypted and that the AI API does not retain sensitive user information for training is a critical privacy concern.

- **Context Window Limits:** LLMs have a limit on how much text they can process at once. Feeding an entire year's worth of transaction history into the AI for analysis without exceeding token limits requires efficient data summarization techniques.

- **Latency:** Real-time AI responses can be slow depending on the API load. Minimizing the delay between a user asking a question and receiving an answer is essential for a good user experience.

**3.3.5 Applications**

This system has practical utility across various domains:

- **Personal Finance Management for Students:** Ideally suited for students and young professionals who need to manage limited budgets and track monthly allowances or stipends.

- **Freelancer Expense Tracking:** Useful for freelancers who have irregular income streams and need an automated way to categorize business vs. personal expenses.

- **Financial Literacy Tool:** Acts as an educational tool for individuals with low financial literacy, explaining complex concepts (like \"debt-to-income ratio\") in simple terms based on their own data.

- **Small Business Cash Flow:** Can be adapted for small shop owners to track daily cash flow and ask questions like \"Which day had the lowest sales this month?\"

**3.3.6 Limitations**

To ensure the project scope remains realistic, the system has the following boundaries:

- **No Real Money Transfer:** The system is an *informational* advisor only. It cannot execute real bank transfers or payments; it only tracks data recorded by the user.

- **Not Professional Financial Advice:** The AI provides guidance based on patterns, but it is not a certified financial planner. It cannot be held legally liable for investment losses or tax filing errors.

- **Dependency on Internet:** As the AI relies on external APIs (Gemini/OpenAI), the \"Advisor\" feature will not function without an active internet connection.

- **Manual Entry (MVP):** In the initial version, the system relies on the user to input data or upload files; it does not automatically sync with bank accounts in real-time due to banking API restrictions (PSD2/Open Banking access).

**3.3.7 PROGRAM DESIGN**

![](media/image6.png){width="6.268055555555556in" height="3.421527777777778in"}

**REFERENCES**

[*https://developer.mozilla.org/*](https://developer.mozilla.org/) (Used for HTML/CSS/JavaScript standards)

[*https://www.w3schools.com/*](https://www.w3schools.com/) (Used for SQL query reference)

[*https://www.geeksforgeeks.org/*](https://www.geeksforgeeks.org/) (Used for Python algorithm reference)

[*https://www.promptingguide.ai/*](https://www.promptingguide.ai/) \"How Retrieval Augmented Generation (RAG) Works\" (Concept for AI):

[*https://nextjs.org/docs*](https://nextjs.org/docs) (Next.js Documentation)

[*https://fastapi.tiangolo.com/*](https://fastapi.tiangolo.com/) (FastAPI Documentation)

[*https://www.postgresql.org/docs/*](https://www.postgresql.org/docs/) (PostgreSQL Documentation)

[*https://react.dev/*](https://react.dev/) (React (Frontend) Documentation)

[*https://ai.google.dev/docs*](https://ai.google.dev/docs) (Google Gemini API (AI) Docs)

[*https://python.langchain.com/docs/get_started/introduction*](https://python.langchain.com/docs/get_started/introduction) (LangChain (AI Integration) Docs)
