import os
import fitz  # PyMuPDF
import json
import requests
from fastapi import HTTPException

def extract_texts_from_pdfs(temp_dir):
    texts = []
    for filename in os.listdir(temp_dir):
        if filename.lower().endswith('.pdf'):
            file_path = os.path.join(temp_dir, filename)
            try:
                with fitz.open(file_path) as doc:
                    text = "\n".join(page.get_text() for page in doc)
                    texts.append(f"--- {filename} ---\n{text}")
            except Exception as e:
                texts.append(f"[Erreur extraction {filename}: {e}]")
    return "\n\n".join(texts)

def load_criteria_json(json_path):
    with open(json_path, 'r') as f:
        data = json.load(f)
    return data

def query_mistral_api(prompt, mistral_api_key):
    url = "https://api.mistral.ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {mistral_api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "mistral-large-latest",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 1500,
        "temperature": 0.7
    }
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail=f"Mistral API error: {response.text} mistral_api_key: {mistral_api_key}")
    return response.json()["choices"][0]["message"]["content"]
