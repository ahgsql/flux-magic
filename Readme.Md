# Flux-Magic

Flux-Magic is an LLM-based image generation software that uses either Anthropic's API or local Ollama for prompt enhancement, and then generates images using either ComfyUI (locally) or Replicate API (online).

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Usage](#usage)

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or later)
- npm (usually comes with Node.js)
- Git

If you plan to use local image generation:

- ComfyUI setup locally (and run it, no need any workflow, its already included)
- Ollama (if using local LLM)

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/ahgsql/flux-magic.git
   cd flux-magic
   ```

2. Install the dependencies:

   ```
   npm install
   ```

## Configuration

1. Create a `.env` file in the root directory of the project. You can also rename .env.sample to .env and fill.

2. Add the following configuration to your `.env` file:

   ```
   LLM=OLLAMA   # ANTHROPIC or OLLAMA
   IMAGE=REPLICATE   # LOCAL or REPLICATE
   ANTHROPIC_API_KEY=your_anthropic_api_key
   REPLICATE_API_TOKEN=your_replicate_api_token
   REPLICATE_MODEL=flux-schnell  # flux-schnell | flux-dev | flux-pro
   COMFY_CLIENT=127.0.0.1:8188
   OLLAMA_HOST=http://127.0.0.1:11434
   OLLAMA_MODEL=aya:8b
   ```

3. Adjust the values according to your setup:
   - Set `LLM` to either `ANTHROPIC` or `OLLAMA`
   - Set `IMAGE` to either `LOCAL` or `REPLICATE`
   - If using Anthropic, provide your `ANTHROPIC_API_KEY`
   - If using Replicate, provide your `REPLICATE_API_TOKEN` and choose a `REPLICATE_MODEL`
   - If using local ComfyUI, set the correct `COMFY_CLIENT` address
   - If using Ollama, set the correct `OLLAMA_HOST` and `OLLAMA_MODEL`

## Running the Application

1. Start the Express server:

   ```
   node app.js
   ```

2. The application should now be running on `http://localhost:3333` .

## Usage

1. Access the web interface by opening a browser and navigating to `http://localhost:3333`.

2. Enter your prompt in the provided text area.

3. Select your desired art style and image dimensions.

4. Click the "Magic!" button to create your image.

5. The generated image will appear in the result area on the right side of the page.

## Note

- If you're using local image generation with ComfyUI, make sure ComfyUI is running before starting Flux-Magic.
- If you're using Ollama for local LLM, ensure Ollama is running and the correct model is loaded.

For more detailed information about the ComfyUI NodeJS Module, please refer to [the GitHub repository](https://github.com/ahgsql/comfyui-nodejs).

## Troubleshooting

If you encounter any issues:

1. Check that all required services (ComfyUI, Ollama) are running if you're using local generation.
2. Verify that your API keys are correct in the `.env` file.
3. Check the console output for any error messages.

If problems persist, please open an issue on the GitHub repository.
