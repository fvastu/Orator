import { CreateMLCEngine } from '@mlc-ai/web-llm';

const inputs = [
    {
        role: 'user',
        content: `
    Analyze the text for grammatical, syntactical, and stylistic errors. 
    Classify each as 'Severe', 'Moderate', or 'Minor', with a **concise explanation** (max 20 words). 
    Provide a corrected version.

    Respond **exactly** in this JSON format:

    {
      "error_type": "Error type (e.g., Grammar, Syntax, Spelling, Punctuation)",
      "severity": "Severity level ('Severe', 'Moderate', 'Minor')",
      "explanation": "Brief explanation (max 20 words)",
      "correction": "Corrected text"
    }

    Text: "Hey joaso, are u doing?"
    `,
    },
];

const models = {
    // Llama-3.2 Models
    'Llama-3.2-1B-Instruct-q4f16_1': 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
    'Llama-3.2-1B-Instruct-q4f32_1': 'Llama-3.2-1B-Instruct-q4f32_1-MLC',
    'Llama-3.2-3B-Instruct-q4f32_1': 'Llama-3.2-3B-Instruct-q4f32_1-MLC',

    // Phi-3.5 Models
    'Phi-3.5-mini-instruct-q4f16_1': 'Phi-3.5-mini-instruct-q4f16_1-MLC',
    'Phi-3.5-mini-instruct-q4f32_1': 'Phi-3.5-mini-instruct-q4f32_1-MLC',
    'Phi-3.5-mini-instruct-q4f16_1-1k': 'Phi-3.5-mini-instruct-q4f16_1-MLC-1k',
    'Phi-3.5-mini-instruct-q4f32_1-1k': 'Phi-3.5-mini-instruct-q4f32_1-MLC-1k',

    // SmolLM2 Models
    'SmolLM2-1.7B-Instruct-q4f16_1': 'SmolLM2-1.7B-Instruct-q4f16_1-MLC',
    'SmolLM2-1.7B-Instruct-q4f32_1': 'SmolLM2-1.7B-Instruct-q4f32_1-MLC',
    'SmolLM2-360M-Instruct-q4f16_1': 'SmolLM2-360M-Instruct-q4f16_1-MLC',
    'SmolLM2-360M-Instruct-q4f32_1': 'SmolLM2-360M-Instruct-q4f32_1-MLC',

    // Qwen2.5 Models
    'Qwen2.5-0.5B-Instruct-q4f16_1': 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
    'Qwen2.5-0.5B-Instruct-q4f32_1': 'Qwen2.5-0.5B-Instruct-q4f32_1-MLC',
    'Qwen2.5-1.5B-Instruct-q4f16_1': 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
    'Qwen2.5-1.5B-Instruct-q4f32_1': 'Qwen2.5-1.5B-Instruct-q4f32_1-MLC',
    'Qwen2.5-3B-Instruct-q4f16_1': 'Qwen2.5-3B-Instruct-q4f16_1-MLC',
    'Qwen2.5-3B-Instruct-q4f32_1': 'Qwen2.5-3B-Instruct-q4f32_1-MLC',
    'Qwen2.5-7B-Instruct-q4f16_1': 'Qwen2.5-7B-Instruct-q4f16_1-MLC',
    'Qwen2.5-7B-Instruct-q4f32_1': 'Qwen2.5-7B-Instruct-q4f32_1-MLC',

    // Qwen2.5-Coder Models
    'Qwen2.5-Coder-0.5B-Instruct-q4f16_1': 'Qwen2.5-Coder-0.5B-Instruct-q4f16_1-MLC',
    'Qwen2.5-Coder-0.5B-Instruct-q4f32_1': 'Qwen2.5-Coder-0.5B-Instruct-q4f32_1-MLC',
    'Qwen2.5-Coder-1.5B-Instruct-q4f16_1': 'Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC',
    'Qwen2.5-Coder-1.5B-Instruct-q4f32_1': 'Qwen2.5-Coder-1.5B-Instruct-q4f32_1-MLC',
    'Qwen2.5-Coder-3B-Instruct-q4f16_1': 'Qwen2.5-Coder-3B-Instruct-q4f16_1-MLC',
    'Qwen2.5-Coder-3B-Instruct-q4f32_1': 'Qwen2.5-Coder-3B-Instruct-q4f32_1-MLC',
    'Qwen2.5-Coder-7B-Instruct-q4f16_1': 'Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC',
    'Qwen2.5-Coder-7B-Instruct-q4f32_1': 'Qwen2.5-Coder-7B-Instruct-q4f32_1-MLC',

    // Mistral Models
    'Mistral-7B-Instruct-v0.3-q4f16_1': 'Mistral-7B-Instruct-v0.3-q4f16_1-MLC',
    'Mistral-7B-Instruct-v0.3-q4f32_1': 'Mistral-7B-Instruct-v0.3-q4f32_1-MLC',

    // Llama-3.1 Models
    'Llama-3.1-8B-Instruct-q4f16_1': 'Llama-3.1-8B-Instruct-q4f16_1-MLC',
    'Llama-3.1-8B-Instruct-q4f32_1': 'Llama-3.1-8B-Instruct-q4f32_1-MLC',
};

class Popup {
    startup = () => {
        console.log('Popup Page of this wonderful extension');

        const startTime = Date.now();

        const processModel = async (modelName: string) => {
            // @ts-ignore
            const modelId = models[modelName];
            // console.log(`Starting process for model: ${modelName}`);

            try {
                const modelStartTime = Date.now();
                const engine = await CreateMLCEngine(modelId, {});
                const modelLoadTime = Date.now() - modelStartTime;
                console.log(`Model ${modelName} loaded in ${modelLoadTime} ms`);

                const requestStartTime = Date.now();
                const response = await engine.chat.completions.create({
                    // @ts-ignore
                    messages: inputs,
                    temperature: 0.2,
                });
                const responseTime = Date.now() - requestStartTime;
                // console.log(`Response for model ${modelName} received in ${responseTime} ms`);
                // console.log('Response:', response);

                // Parse and validate the response
                // @ts-ignore
                // const parsedResponse = JSON.parse(response.choices[0].message.content);
                // console.log('Parsed Response:', parsedResponse);
            } catch (error) {
                console.error(`Error processing model ${modelName}:`, error);
            } finally {
                // console.log(`Unloading model: ${modelName}`);
                // await engine.unload();
                // console.log(`Model ${modelName} unloaded`);
            }
        };

        const processAllModels = async () => {
            for (const modelName in models) {
                await processModel(modelName);
            }
            const endTime = Date.now();
            console.log('All models processed in', endTime - startTime, 'ms');
        };

        processAllModels();
    };

    constructor() {
        this.startup();
    }
}

export const popup = new Popup();
