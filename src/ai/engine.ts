import { CreateMLCEngine, MLCEngine } from '@mlc-ai/web-llm';

const inputs = [];

enum AvailableModels {
    // Llama-3.2 Models
    Llama_3_2_1B_Instruct_q4f16_1 = 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
    Llama_3_2_1B_Instruct_q4f32_1 = 'Llama-3.2-1B-Instruct-q4f32_1-MLC',
    Llama_3_2_3B_Instruct_q4f32_1 = 'Llama-3.2-3B-Instruct-q4f32_1-MLC',

    // Phi-3.5 Models
    Phi_3_5_mini_instruct_q4f16_1 = 'Phi-3.5-mini-instruct-q4f16_1-MLC',
    Phi_3_5_mini_instruct_q4f32_1 = 'Phi-3.5-mini-instruct-q4f32_1-MLC',
    Phi_3_5_mini_instruct_q4f16_1_1k = 'Phi-3.5-mini-instruct-q4f16_1-MLC-1k',
    Phi_3_5_mini_instruct_q4f32_1_1k = 'Phi-3.5-mini-instruct-q4f32_1-MLC-1k',

    // SmolLM2 Models
    SmolLM2_1_7B_Instruct_q4f16_1 = 'SmolLM2-1.7B-Instruct-q4f16_1-MLC',
    SmolLM2_1_7B_Instruct_q4f32_1 = 'SmolLM2-1.7B-Instruct-q4f32_1-MLC',
    SmolLM2_360M_Instruct_q4f16_1 = 'SmolLM2-360M-Instruct-q4f16_1-MLC',
    SmolLM2_360M_Instruct_q4f32_1 = 'SmolLM2-360M-Instruct-q4f32_1-MLC',

    // Qwen2.5 Models
    Qwen2_5_0_5B_Instruct_q4f16_1 = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
    Qwen2_5_0_5B_Instruct_q4f32_1 = 'Qwen2.5-0.5B-Instruct-q4f32_1-MLC',
    Qwen2_5_1_5B_Instruct_q4f16_1 = 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
    Qwen2_5_1_5B_Instruct_q4f32_1 = 'Qwen2.5-1.5B-Instruct-q4f32_1-MLC',
    Qwen2_5_3B_Instruct_q4f16_1 = 'Qwen2.5-3B-Instruct-q4f16_1-MLC',
    Qwen2_5_3B_Instruct_q4f32_1 = 'Qwen2.5-3B-Instruct-q4f32_1-MLC',
    Qwen2_5_7B_Instruct_q4f16_1 = 'Qwen2.5-7B-Instruct-q4f16_1-MLC',
    Qwen2_5_7B_Instruct_q4f32_1 = 'Qwen2.5-7B-Instruct-q4f32_1-MLC',

    // Qwen2.5-Coder Models
    Qwen2_5_Coder_0_5B_Instruct_q4f16_1 = 'Qwen2.5-Coder-0.5B-Instruct-q4f16_1-MLC',
    Qwen2_5_Coder_0_5B_Instruct_q4f32_1 = 'Qwen2.5-Coder-0.5B-Instruct-q4f32_1-MLC',
    Qwen2_5_Coder_1_5B_Instruct_q4f16_1 = 'Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC',
    Qwen2_5_Coder_1_5B_Instruct_q4f32_1 = 'Qwen2.5-Coder-1.5B-Instruct-q4f32_1-MLC',
    Qwen2_5_Coder_3B_Instruct_q4f16_1 = 'Qwen2.5-Coder-3B-Instruct-q4f16_1-MLC',
    Qwen2_5_Coder_3B_Instruct_q4f32_1 = 'Qwen2.5-Coder-3B-Instruct-q4f32_1-MLC',
    Qwen2_5_Coder_7B_Instruct_q4f16_1 = 'Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC',
    Qwen2_5_Coder_7B_Instruct_q4f32_1 = 'Qwen2.5-Coder-7B-Instruct-q4f32_1-MLC',

    // Mistral Models
    Mistral_7B_Instruct_v0_3_q4f16_1 = 'Mistral-7B-Instruct-v0.3-q4f16_1-MLC',
    Mistral_7B_Instruct_v0_3_q4f32_1 = 'Mistral-7B-Instruct-v0.3-q4f32_1-MLC',

    // Llama-3.1 Models
    Llama_3_1_8B_Instruct_q4f16_1 = 'Llama-3.1-8B-Instruct-q4f16_1-MLC',
    Llama_3_1_8B_Instruct_q4f32_1 = 'Llama-3.1-8B-Instruct-q4f32_1-MLC',
}

class AIEngine {
    model;
    engine: MLCEngine;

    constructor(model: AvailableModels) {
        this.model = model;
    }

    async init() {
        try {
            this.engine = await CreateMLCEngine(this.model, {});
            return true;
        } catch (error) {
            console.error(`Error loading model ${this.model}:`, error);
            return false;
        }
    }

    async analyzeGrammar(input: string) {
        return this.analyze(input, 'Grammar');
    }

    async analyzeSyntax(input: string) {
        return this.analyze(input, 'Syntax');
    }

    async analyzeStyle(input: string) {
        return this.analyze(input, 'Style');
    }

    private async analyze(input: string, errorType: string) {
        const startTime = performance.now();
        try {
            // Determine if the input is a word or sentence
            const isSentence = input.split(' ').length > 1;

            // Construct the general part of the prompt
            const errorMessage = `
            Analyze the ${isSentence ? 'text' : 'word'} for ${errorType} errors.
            Classify each error as 'Severe', 'Moderate', or 'Minor' and provide:
            - A brief explanation (max 20 words)
            - A corrected version of the ${isSentence ? 'text' : 'word'}

            Format your response as a JSON object:
            {
                "error_type": "Error type",
                "severity": "Severity level ('Severe', 'Moderate', 'Minor')",
                "explanation": "Brief explanation (max 20 words)",
                "correction": "Corrected text"
            }

            Example:
            "Severe: 'They was here.' Explanation: 'Incorrect subject-verb agreement' Correction: 'They were here.'"

            This is the ${isSentence ? 'text' : 'word'}: ${input}
        `;

            // Call the engine with the optimized prompt
            const response = await this.engine.chat.completions.create({
                messages: [
                    {
                        role: 'user',
                        content: errorMessage,
                    },
                ],
                temperature: 0.2,
            });

            const endTime = performance.now();
            console.log(`Analysis time for ${errorType}: ${endTime - startTime} milliseconds`);
            console.log({ responseFromEngine: response });
            return response;
        } catch (error) {
            const endTime = performance.now();
            console.error('Error analyzing input:', error);
            console.log(`Analysis time for ${errorType}: ${endTime - startTime} milliseconds`);
            return null;
        }
    }
}

export default new AIEngine(AvailableModels.SmolLM2_360M_Instruct_q4f32_1);
