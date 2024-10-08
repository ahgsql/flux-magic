export function magicPrompt(topic, style,) {
    const systemMessage = {
        role: "system",
        content: "You are an AI assistant specialized in creating detailed prompts for image generation based on given topics and styles. Your task is to analyze the input and create a comprehensive, creative, and coherent prompt that can guide an image generation AI to produce a vivid and accurate representation of the described scene or concept.Your responses are raw json"
    };

    const userMessage = {
        role: "user",
        content: `Please create a detailed image generation prompt based on the following information:

Topic: ${topic}
Style: ${style}

Your prompt should include the following elements :

1. Main subject or character description
2. Background and setting details
3. Lighting, color scheme, and atmosphere
4. Any specific actions or poses for characters
5. Important objects or elements to include
6. Overall mood or emotion to convey

dont use \\"Ali\\"  this syntax. instead return \"Ali\"  (one escape char) 
use This format to generating enhancedPrompt string:Main characher or Main subject:... Background:... ... Lighting:... Color scheme:... Atmosphere:... Actions:... Objects:...
Follow these format style, you always say Thing and then colon, then explanation. You can add or remove similar things.Be open minded, creative.
Please ensure your prompt is detailed yet concise, avoiding any explanations or meta-commentary. The prompt should be a single line and JSON value friendly of descriptive text that an image generation AI can interpret directly.
If there is anything related drawing or writing text on something, explain this in every detail, fonts, drawing or writing style, color, pen or brush. You can be creative and humorous about the text content if not provided directly.
Remember to be creative and specific in your descriptions, always return English no matter What language is topic or style. using vivid language to paint a clear mental picture. Avoid vague terms and instead use concrete, descriptive words that clearly communicate the desired visual elements.Be artistic, be aesthetic.  Double check if your response is suitable to use in JSON value, put escape charachters if need.Never start with double or single quotes. all your response should be oneline, no multiline and valid JSON value. return me valid JSON with following structure:
{"enhancedPrompt":<<Yourgenerated one line prompt>>}
`
    };

    return [systemMessage, userMessage];
}
export function crazyPrompt(topic, style,) {
    const systemMessage = {
        role: "system",
        content: "You are a crazy AI assistant specialized in creating detailed prompts for image generation based on given topics and styles. Your task is to analyze the input and create a creative, crazy, and unseen prompt that can guide an image generation AI to produce an exaggerated representation of the described scene or concept.Your responses are raw json"
    };

    const userMessage = {
        role: "user",
        content: `Please create a detailed image generation prompt based on the following information:

Topic: ${topic}
Style: ${style}

Your prompt should include the following elements :

1. Main subject or character description
2. Background and setting details
3. Lighting, color scheme, and atmosphere
4. Any specific actions or poses for characters
5. Important objects or elements to include
6. Overall mood or emotion to convey

dont use \\"Ali\\"  this syntax. instead return \"Ali\"  (one escape char) 
use This format to generating enhancedPrompt string:Main characher or Main subject:... Background:... ... Lighting:... Color scheme:... Atmosphere:... Actions:... Objects:...
Follow these format style, you always say Thing and then colon, then explanation. You can add or remove similar things.Be open minded, creative.
Please ensure your prompt is detailed yet concise, avoiding any explanations or meta-commentary. The prompt should be a single line and JSON value friendly of descriptive text that an image generation AI can interpret directly.
If there is anything related drawing or writing text on something, explain this in every detail, fonts, drawing or writing style, color, pen or brush. You can be creative and humorous about the text content if not provided directly.
Remember to be open-minded, try new mediums and unseen things and  be specific in your descriptions, always return English no matter What language is topic or style.Try different things, surprise me. Add relevant side objects and crazy elements. You can transform a cat into robot or giant village, Try extraordinary transforms and scenes. Expand desired subject and style, act like a cult artist. Be artistic, be aesthetic.  Double check if your response is suitable to use in JSON value.Never start with double or single quotes. all your response should be oneline, no multiline and valid JSON value. return me valid JSON with following structure:
{"enhancedPrompt":<<Yourgenerated one line prompt>>}
`
    };

    return [systemMessage, userMessage];
}
