import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
dotenv.config();


/**
 * This function uses the Anthropic API to interact with the Claude-3 model and generate a response based on the input messages.
 *
 * @param {Array<Object>} msgArr - An array containing the system and user messages.
 * @param {string} [model="haiku"] - The model to use for generating the response. Defaults to "haiku".
 * @returns {Object} - An object containing the generated response content, usage information, and pricing details.
 * @throws {Error} - If an error occurs during the API request.
 */
export default async function anthropicChat(msgArr, model = "haiku") {
    const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const latestModels = [
        "claude-3-opus-20240229",
        "claude-3-5-sonnet-20240620",
        "claude-3-haiku-20240307",
    ];

    const modelPricing = [
        {
            model: "claude-3-opus-20240229",
            mTokInput: 15,
            mTokOutput: 75,
        },
        {
            model: "claude-3-5-sonnet-20240620",
            mTokInput: 3,
            mTokOutput: 15,
        },
        {
            model: "claude-3-haiku-20240307",
            mTokInput: 0.25,
            mTokOutput: 1.25,
        },
    ];

    const selectedModel =
        latestModels.find((m) => m.includes(model)) || "claude-3-haiku-20240307";

    const systemMessage =
        msgArr.find((msg) => msg.role === "system")?.content || "";
    const userMessages = msgArr.filter((msg) => msg.role !== "system");

    let selectedPricing = modelPricing.find((m) => m.model === selectedModel);

    try {
        const response = await anthropic.messages.create({
            system: systemMessage,
            max_tokens: 4096,
            messages: [...userMessages],
            model: selectedModel,
            stop_sequences: ["end_turn"],
        });

        return {
            content: response.content[0].text,
            usage: response.usage,
            usageInCents: {
                input: response.usage.input_tokens * selectedPricing.mTokInput / 1000000,
                output: response.usage.output_tokens * selectedPricing.mTokOutput / 1000000,
                total: parseFloat(
                    ((response.usage.input_tokens * selectedPricing.mTokInput / 1000000) +
                        (response.usage.output_tokens * selectedPricing.mTokOutput / 1000000)).toFixed(6)
                ),
            },
        };
    } catch (error) {
        console.error(error.message);
        return {
            content: "",
            usage: null,
        };
    }
}



/**
 * This function uses the Anthropic API to interact with the Claude-3 model and generate a streamed response based on the input messages.
 *
 * @param {Array<Object>} messages - An array of message objects.
 * @param {string} [model="claude-3-haiku-20240307"] - The model to use for generating the response.
 * @param {function} streamCallback - A callback function to handle each chunk of the streamed response.
 * @returns {Promise<Object>} - A promise that resolves to an object containing usage information and pricing details.
 * @throws {Error} - If an error occurs during the API request.
 */
export async function anthropicStreamChat(msgArr, model = "haiku", streamCallback) {
    const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const latestModels = [
        "claude-3-opus-20240229",
        "claude-3-5-sonnet-20240620",
        "claude-3-haiku-20240307",
    ];

    const modelPricing = [
        {
            model: "claude-3-opus-20240229",
            mTokInput: 15,
            mTokOutput: 75,
        },
        {
            model: "claude-3-5-sonnet-20240620",
            mTokInput: 3,
            mTokOutput: 15,
        },
        {
            model: "claude-3-haiku-20240307",
            mTokInput: 0.25,
            mTokOutput: 1.25,
        },
    ];

    const selectedModel =
        latestModels.find((m) => m.includes(model)) || "claude-3-haiku-20240307";

    const systemMessage =
        msgArr.find((msg) => msg.role === "system")?.content || "";
    const userMessages = msgArr.filter((msg) => msg.role !== "system");

    let selectedPricing = modelPricing.find((m) => m.model === selectedModel);

    try {
        const stream = await anthropic.messages.create({
            system: systemMessage,
            max_tokens: 1500,
            messages: [...userMessages],
            model: selectedModel,
            stream: true,
        });

        let fullContent = "";
        for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta') {
                fullContent += chunk.delta.text;
                streamCallback(chunk.delta.text);
            }
        }

        // Estimate token usage based on the full content

        return {
            finalMessage: fullContent
        };
    } catch (error) {
        console.error(error.message);
        throw error;
    }
}