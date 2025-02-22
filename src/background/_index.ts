// background.ts
// import { runtime } from 'webextension-polyfill';
// import { pipeline, env } from '@xenova/transformers';
//
// // Skip initial check for local models, since we are not loading any local models.
// env.allowLocalModels = false;
//
// // Due to a bug in onnxruntime-web, we must disable multithreading for now.
// // See https://github.com/microsoft/onnxruntime/issues/14445 for more information.
// env.backends.onnx.wasm.numThreads = 1;
//
// class Background {
//     private generator: any;
//
//     constructor() {
//         this.initializeModel();
//
//         // Listen for messages from content scripts
//         runtime.onMessage.addListener((message: any, _sender, sendResponse) => {
//             if (message.action === 'correctText') {
//                 this.correctText(message.text).then(sendResponse);
//                 return true; // Indicates that sendResponse will be called asynchronously
//             }
//         });
//     }
//
//     // Initialize the Xenova model
//     private async initializeModel() {
//         this.generator = await pipeline('text-classification', 'Xenova/bert-base-multilingual-cased');
//         console.log('Model loaded');
//     }
//
//     // Correct text using the Xenova model
//     private async correctText(text: string): Promise<any[]> {
//         if (!this.generator) {
//             throw new Error('Model not loaded');
//         }
//
//         // Generate corrected text
//         const output = await this.generator('questa è una prova', {
//             max_new_tokens: 200,
//             temperature: 0.9,
//             repetition_penalty: 2.0,
//             no_repeat_ngram_size: 3,
//         });
//
//         console.log({ output });
//
//         // Simulate error ranges based on the generated text
//         const errors: any[] = [];
//         const errorWords: string[] = ['mistake', 'error', 'wrong', 'fault'];
//         const warningWords: string[] = ['almost', 'could', 'seem', 'possibly'];
//         const allWords: string[] = errorWords.concat(warningWords);
//
//         let index = 0;
//         text.split(/\s+/).forEach((word) => {
//             let severity: any = 'warning';
//             if (errorWords.includes(word)) {
//                 severity = 'error';
//             } else if (warningWords.includes(word)) {
//                 severity = 'warning';
//             }
//
//             if (allWords.includes(word)) {
//                 errors.push({ start: index, end: index + word.length, severity });
//             }
//             index += word.length + 1;
//         });
//
//         return errors;
//     }
// }
//
// export const background = new Background();
