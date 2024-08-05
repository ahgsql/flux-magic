import { Ollama } from 'ollama'


import dotenv from 'dotenv';
import fs from "fs/promises";

dotenv.config();

/**
 * This function uses the Ollama API to interact with the Llama2 model and generate a response based on the input messages.
 *
 * @param {Array<Object>} msgArr - An array containing the system and user messages.
 * @param {string} [model="llama2"] - The model to use for generating the response. Defaults to "llama2".
 * @returns {Object} - An object containing the generated response content, usage information, and pricing details.
 * @throws {Error} - If an error occurs during the API request.
 */


async function fileToBase64(filePath) {
    try {
        const data = await fs.readFile(filePath);
        return Buffer.from(data).toString('base64');
    } catch (error) {
        console.error('Error reading file:', error);
        throw error;
    }
}

export default async function ollamaChat(msgArr) {
    console.log("ollama chat started");
    const systemMessage = msgArr.find((msg) => msg.role === "system")?.content || "";
    const userMessages = await Promise.all(
        msgArr.filter((msg) => msg.role !== "system").map(async (msg) => {
            if (msg.images) {
                const base64Images = await Promise.all(
                    msg.images.map(async (imagePath) => {
                        try {
                            return await fileToBase64(imagePath);
                        } catch (error) {
                            console.error(`Error converting image ${imagePath} to base64:`, error);
                            return null; // Handle the error appropriately, maybe skip this image or return a placeholder
                        }
                    })
                );
                return { ...msg, images: base64Images.filter(img => img !== null) };
            } else {
                return msg;
            }
        })
    );
    try {
        const ollama = new Ollama({ host: process.env.OLLAMA_HOST })
        let model = process.env.OLLAMA_MODEL
        const response = await ollama.chat({
            model: model,
            messages: [{ role: "system", content: systemMessage }, ...userMessages,],
        });
        // The Ollama API does not provide usage information directly, so we'll just return the response content
        return {
            content: response.message.content,
        };
    } catch (error) {
        console.error(error.message);
        return {
            content: "",
            usage: null,
        };
    }
}
