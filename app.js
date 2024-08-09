import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { startComfyUi, initClient, randomSeed } from "comfyui-nodejs";
import Workflowloader from "comfyui-nodejs";
import path from 'path';
import { fileURLToPath } from 'url';
import anthropicChat from './utils/anthropic.js';
import { magicPrompt, crazyPrompt } from './utils/prompts.js';
import open from 'open';
import Replicate from "replicate";
import imageToBase64 from 'image-to-base64';
import dotenv from "dotenv";
import ollamaChat from './utils/ollama.js';
import { findNearestAspectRatio } from './utils/helpers.js';
import fs from 'fs/promises';
import { escapeJsonString } from './utils/helpers.js';  // Bu satırı dosyanın başına ekleyin

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const replicate = new Replicate();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const port = 3333;

app.use(express.json());
app.use(express.static('public'));

let client;
let flux;

const statsFile = path.join(__dirname, 'stats.json');


async function loadStats() {
    try {
        const data = await fs.readFile(statsFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            const initialStats = {
                totalImagesGenerated: 0,
                models: {}
            };
            await fs.writeFile(statsFile, JSON.stringify(initialStats, null, 2));
            return initialStats;
        }
        throw error;
    }
}

async function updateStats(width, height, generationTime, llmTime, model) {
    const stats = await loadStats();
    const resolution = `${width}x${height}`;

    if (!stats.models[model]) {
        stats.models[model] = {};
    }

    if (!stats.models[model][resolution]) {
        stats.models[model][resolution] = {
            totalTime: 0,
            count: 0,
            llmTime: 0
        };
    }

    stats.models[model][resolution].totalTime += generationTime;
    stats.models[model][resolution].llmTime += llmTime;
    stats.models[model][resolution].count += 1;
    stats.totalImagesGenerated += 1;

    await fs.writeFile(statsFile, JSON.stringify(stats, null, 2));
}

(async () => {
    client = await initClient(process.env.COMFY_CLIENT);
    await client.connect();
    flux = new Workflowloader("flux.json", client, true);
    const initialStats = await loadStats();
    console.log("Initial stats loaded:", initialStats);
})();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/generate', async (req, res) => {
    try {
        const stats = await loadStats(); // Her istek için en güncel istatistikleri yükle
        const { prompt, width, height, style, skipLLM, crazyLLM, model = "dev" } = req.body;
        let finalPrompt;
        let llmStartTime, llmEndTime, imageStartTime, imageEndTime;

        llmStartTime = Date.now();
        if (skipLLM) {
            finalPrompt = escapeJsonString(style + " style " + prompt + " in the style of " + style);
            llmEndTime = llmStartTime;
        } else {
            let aiPrompt
            if (crazyLLM) {
                aiPrompt = crazyPrompt(prompt, style);
            } else {
                aiPrompt = magicPrompt(prompt, style);

            }
            if (process.env.LLM == "ANTHROPIC") {
                const response = await anthropicChat(aiPrompt, "sonnet");
                console.log(response);
                finalPrompt = JSON.parse(response.content).enhancedPrompt;
            } else {
                const response = await ollamaChat(aiPrompt);
                finalPrompt = JSON.parse(response.content).enhancedPrompt;
            }
            llmEndTime = Date.now();
        }

        const llmTime = llmEndTime - llmStartTime;

        const resolution = `${width}x${height}`;
        const modelStats = stats.models[model] || {};
        const resolutionStats = modelStats[resolution] || { totalTime: 0, count: 0, llmTime: 0 };
        const avgGenerationTime = resolutionStats.count > 0
            ? (resolutionStats.totalTime + resolutionStats.llmTime) / resolutionStats.count
            : 30000; // Default to 30 seconds if no data

        imageStartTime = Date.now();

        imageStartTime = Date.now();

        if (process.env.IMAGE == "LOCAL") {
            flux.prepare({
                positive: finalPrompt,
                steps: (model == "dev" ? 25 : 5),
                batchSize: 1,
                seed: 514,
                width: parseInt(width),
                height: parseInt(height),
                unet_name: "flux1-" + model + ".sft"
            });

            const estimatedTime = Math.round(avgGenerationTime / 1000);
            const updateInterval = setInterval(() => {
                const elapsedSeconds = Math.round((Date.now() - imageStartTime) / 1000);
                const progress = Math.min(elapsedSeconds / estimatedTime, 1);
                io.emit('progressUpdate', { progress: progress * 100 });
            }, 1000);

            const result = await flux.generate();

            clearInterval(updateInterval);

            imageEndTime = Date.now();
            const actualTime = imageEndTime - imageStartTime;
            await updateStats(width, height, actualTime, llmTime, model);


            console.log(`\nActual generation time: ${actualTime} ms`);
            io.emit('progressUpdate', { progress: 100 });
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
        io.emit('progressUpdate', { progress: 100 });
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

httpServer.listen(port, async () => {
    console.log(`Server running at http://localhost:${port}`);
    await open("http://localhost:" + port);
});