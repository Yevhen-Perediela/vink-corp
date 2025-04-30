import openai
import os
openai.api_key = os.getenv("OPENAI_API_KEY")


def ask_gpt(prompt, model="gpt-4.1-nano"):
    response = openai.ChatCompletion.create(
        model = model,
        message = [{"role": "user", "content": prompt}]
    )
    return response['choices'][0]['message']['content'].strip()

def refactor_code(code_snippet):
    prompt = f"Refactor the following code: \n\n{code_snippet}"
    return ask_gpt(prompt)

def comment_code(code_snippet):
    prompt = f"Add clear and helpful comments to this code: \n\n{code_snippet}"
    return ask_gpt(prompt)

def handle_code(code, mode="refactor", with_comments=True):
    """
    Wysyła prompt do LLM w zależności od trybu i zwraca odpowiedź.
    """
    if mode == "refactor":
        prompt = f"Refactor the following code. Return a full diff:\n\n{code}"
        if with_comments:
            prompt += "\n\nAdd helpful comments too."
    elif mode == "comment":
        prompt = f"Add comments to this code:\n\n{code}"12
    elif mode == "explain":
        prompt = f"Explain what the following code does:\n\n{code}"
    elif mode == "diff":
        prompt = f"Review and suggest changes using unified diff format:\n\n{code}"
    else:
        raise ValueError("Unsupported mode")

    return ask_gpt(prompt)
