import express from 'express';
import { startComfyUi, initClient, randomSeed } from "comfyui-nodejs";
import Workflowloader from "comfyui-nodejs";
import path from 'path';
import { fileURLToPath } from 'url';
import anthropicChat from './utils/anthropic.js';
import { magicPrompt } from './utils/prompts.js';
import open from 'open';
import Replicate from "replicate";
import imageToBase64 from 'image-to-base64';
import dotenv from "dotenv";
import ollamaChat from './utils/ollama.js';
import { findNearestAspectRatio } from './utils/helpers.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const replicate = new Replicate();
const app = express();
const port = 3333;

app.use(express.json());
app.use(express.static('public'));

let client;
let flux;

(async () => {
    client = await initClient(process.env.COMFY_CLIENT);
    await client.connect();
    flux = new Workflowloader("flux.json", client, true);
})();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/generate', async (req, res) => {
    try {
        const { prompt, width, height, style, skipLLM } = req.body;
        let finalPrompt;

        if (skipLLM) {
            finalPrompt = prompt;
        } else {
            let aiPrompt = magicPrompt(prompt, style);
            if (process.env.LLM == "ANTHROPIC") {
                const response = await anthropicChat(aiPrompt, "sonnet");
                console.log(response);
                finalPrompt = JSON.parse(response.content).enhancedPrompt;
            } else {
                const response = await ollamaChat(aiPrompt);
                finalPrompt = JSON.parse(response.content).enhancedPrompt;
            }
        }

        if (process.env.IMAGE == "LOCAL") {
            flux.prepare({
                positive: finalPrompt,
                steps: 25,
                batchSize: 1,
                seed: randomSeed(),
                width: parseInt(width),
                height: parseInt(height),
            });

            const result = await flux.generate();
            res.json({ success: true, enhancedPrompt: finalPrompt, images: result.map(img => ({ base64: img.base64.split(',')[1] })) });
        } else {
            let ar = findNearestAspectRatio(parseInt(width), parseInt(height));
            const input = {
                prompt: finalPrompt,
                output_quality: 100,
                aspect_ratio: ar,
            };

            const output = await replicate.run("black-forest-labs/" + process.env.REPLICATE_MODEL, { input });
            let base64 = await imageToBase64(output);
            res.json({ success: true, enhancedPrompt: finalPrompt, images: base64 });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(port, async () => {
    console.log(`Server running at http://localhost:${port}`);
    await open("http://localhost:" + port);
});