# Image Conversational Chatbot

An advanced AI-powered chatbot designed for rich, interactive, image-based conversations. By leveraging state-of-the-art technologies, the chatbot provides seamless visual understanding and dynamic text interactions, making it a versatile and engaging tool for various use cases.

### Key Features:
- **LLaVA:7B for Image Recognition**: High-quality image understanding that enables the chatbot to analyze and interpret uploaded images, providing context-aware insights and interactive discussions about the visuals.
- **LLaMA 3.1 for Text Generation**: Cutting-edge text generation capabilities that deliver fluid, coherent, and natural dialogue in both Telugu and English, catering to a wide range of users.
- **Special RAG System**: A custom-built Retrieval-Augmented Generation (RAG) system that enhances the chatbot’s ability to provide accurate and contextually relevant information by combining pre-trained language models with external data sources.
- **Modern Frontend with React**: A responsive and intuitive user interface built with React, offering a smooth and engaging experience for users to interact with the AI-powered chatbot.

The system's bilingual support in **Telugu and English** ensures accessibility and inclusivity, making it ideal for diverse audiences who want to interact with AI in their preferred language.


### LICENSE

**GNU GENERAL PUBLIC LICENSE Version 3**


---
# Installation And Run

## Install Ollama

```
https://ollama.com/download
```
### Install Models

```
ollama run llava:7b
ollama run llama3.1
```
### Clone the repository

```bash
git clone https://code.swecha.org/manisrikar/image-conversational-chatbot.git
cd image-conversational-chatbot
```

## Run Backend

### Go to BACKEND Directory

```
cd BACKEND
```

### Change environment variables (.env)

``` 
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM=
MONGO_URI=
```

### Install Python Virtual Environment

To set up a Python virtual environment, follow these steps:

### 1. Install `virtualenv` (if not already installed)

```bash
pip install virtualenv
```

### 2. Create a Virtual Environment

Navigate to your project directory, then create a virtual environment named `venv` (or any other name you prefer).

```bash
python -m venv venv
```

This will create a directory named `venv` containing the virtual environment.

### 3. Activate the Virtual Environment

- **On Windows**:
  ```bash
  venv\Scripts\activate
  ```

- **On macOS and Linux**:
  ```bash
  source venv/bin/activate
  ```

Once activated, your terminal prompt should change to show the virtual environment name (e.g., `(venv)`).

### Install Required Packages

Now you can install any required packages, and they will be contained within this virtual environment.

```bash
pip install -r requirements.txt
```

### Run main.py

```
python main.py
```


## Run Frontend

### Go to FRONTEND Directory

```
cd FRONTEND
```

### Install Node Modules

```
npm i
```

### Run the Frontend

```
npm run dev
```
