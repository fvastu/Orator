import engine from '../ai/engine';
import { replaceSelectedText } from './text-correction-utils';
import { getOverlayContainer, injectStyles } from './inject-styles';
import { getTextNodesInEditor, getUnderlineColor } from './ui-utils';
import { showTooltip } from './tooltip';
import { injectProductIcon } from './product-icon';
import { debounce } from './ts-utilts';
// Load wink-nlp package.
import winkNLP from 'wink-nlp';
// Load english language model.
import model from 'wink-eng-lite-web-model';

type Severity = 'error' | 'warning';
type ErrorRange = { start: number; end: number; severity: Severity };

const INPUT_SELECTOR = "textarea, input[type='text'], [contenteditable]";

const INPUT_DEBOUNCE_TIME = 1000;

// Data structure to keep track of words and sentences that have been processed
const processedItems = new Set<string>();

// Function to send text to the background script for correction
async function analyzeText(text: string) {
    const isInitialized = await engine.init();
    if (!isInitialized || !text) return Promise.resolve([]);

    const wordResults = await analyzeWords(text);
    const sentenceResults = await analyzeSentences(text);

    return [...wordResults, ...sentenceResults];
}

// Function to analyze individual words
async function analyzeWords(text: string) {
    const nlp = winkNLP(model);
    const doc = nlp.readDoc(text);
    const words = doc.tokens().out();

    const results = [];
    for (const word of words) {
        console.log('analyzing word', word);
        if (!processedItems.has(word)) {
            console.log('Not found in the cache, analyzing word');
            const grammarResult = await engine.analyzeGrammar(word);
            const styleResult = await engine.analyzeStyle(word);
            const syntaxResult = await engine.analyzeSyntax(word);
            console.log({ grammarResult, styleResult, syntaxResult });
            processedItems.add(word); // Mark this word as processed
            console.log({ word, grammarResult });
            // Collect and return the analysis result for the word
            results.push({
                word,
                analysis: grammarResult,
            });
        }
    }
    return results;
}

// Function to analyze individual sentences
async function analyzeSentences(text: string) {
    const nlp = winkNLP(model);
    const doc = nlp.readDoc(text);
    const sentences = doc.sentences().out();

    const results = [];
    for (const sentence of sentences) {
        console.log('analyzing sentence', sentence);
        if (!processedItems.has(sentence)) {
            console.log('Not found in the cache, analyzing sentence');
            const analysisResult = await engine.analyzeStyle(sentence);
            processedItems.add(sentence); // Mark this sentence as processed
            console.log({ sentence, analysisResult });
            results.push({
                sentence,
                analysis: analysisResult,
            });
        }
    }
    return results;
}

const start = () => {
    injectStyles();
    injectProductIcon();
    const overlay = getOverlayContainer();
    const inputs = document.querySelectorAll(INPUT_SELECTOR);

    inputs.forEach((input) => {
        const handleInput = debounce(async (input: HTMLElement) => {
            const text = input instanceof HTMLInputElement ? input.value : input.textContent;
            const errors = await analyzeText(text || '');
            highlightErrors(errors as any);
        }, INPUT_DEBOUNCE_TIME);

        input.addEventListener('input', () => handleInput(input));
    });

    // Highlight errors with severity
    function highlightErrors(errors: ErrorRange[]) {
        if (!overlay) return;

        overlay.innerHTML = ''; // Clear previous highlights
        const editor = document.querySelector('[contenteditable]');
        if (!editor) return;

        const range = document.createRange();
        const selection = window.getSelection();

        errors.forEach((error) => {
            const { start, end, severity } = error;

            // Get all text nodes within the contenteditable element
            const textNodes = getTextNodesInEditor(editor);
            let currentPosition = 0;

            textNodes.forEach((node) => {
                const nodeLength = node.textContent?.length || 0;
                if (currentPosition + nodeLength > start && currentPosition < end) {
                    const nodeStart = Math.max(0, start - currentPosition);
                    const nodeEnd = Math.min(nodeLength, end - currentPosition);

                    range.setStart(node, nodeStart);
                    range.setEnd(node, nodeEnd);

                    const rects = range.getClientRects();
                    Array.from(rects).forEach((rect) => {
                        const highlightBox = document.createElement('div');
                        highlightBox.className = 'highlight-box';
                        highlightBox.style.position = 'absolute';
                        highlightBox.style.top = `${rect.top}px`;
                        highlightBox.style.left = `${rect.left}px`;
                        highlightBox.style.width = `${rect.width}px`;
                        highlightBox.style.height = `${rect.height}px`;
                        highlightBox.style.backgroundColor = 'transparent'; // Transparent by default
                        highlightBox.style.borderBottom = `2px solid ${getUnderlineColor(severity)}`; // Add a colored underline
                        // @ts-ignore
                        overlay.appendChild(highlightBox);

                        // Adding click event to show tooltip
                        highlightBox.addEventListener('click', () => {
                            showTooltip(
                                highlightBox,
                                severity === 'error' ? 'Spelling' : 'Warning',
                                severity === 'error'
                                    ? `"${node.textContent?.slice(
                                          nodeStart,
                                          nodeEnd
                                      )}" is an incorrect spelling of "corrected-word".`
                                    : `"${node.textContent?.slice(nodeStart, nodeEnd)}" might need review.`,
                                severity === 'error' ? 'corrected-word' : 'alternative-word',
                                range, // Pass the range to the tooltip,
                                replaceSelectedText
                            );
                        });
                    });
                }

                currentPosition += nodeLength;
            });
        });
    }
};

setTimeout(start, 2000);
