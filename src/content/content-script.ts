import { replaceSelectedText } from './text-correction-utils';

type Severity = 'error' | 'warning';
type ErrorRange = { start: number; end: number; severity: Severity };

const INPUT_SELECTOR = "textarea, input[type='text'], [contenteditable]";

const injectProductIcon = () => {
    // Add Product Icon (Green Square Control Panel)
    const productIcon = document.createElement('div');
    productIcon.className = 'product-icon';
    document.body.appendChild(productIcon);

    // Show control panel on click or hover
    productIcon.addEventListener('click', () => {
        showControlPanel(productIcon);
    });

    productIcon.addEventListener('mouseover', () => {
        showControlPanel(productIcon);
    });

    function showControlPanel(icon: HTMLElement) {
        const controlPanel = document.createElement('div');
        controlPanel.className = 'control-panel';
        controlPanel.innerHTML = `
            <div class="control-panel-header">
                <span>Control Panel</span>
                <button class="close-control-panel">&times;</button>
            </div>
            <div class="control-panel-body">
                <p>This is the control panel. You can add more controls here.</p>
            </div>
        `;

        document.body.appendChild(controlPanel);

        // Position control panel
        const rect = icon.getBoundingClientRect();
        controlPanel.style.top = `${rect.bottom + 10}px`;
        controlPanel.style.left = `${rect.left}px`;

        // Close control panel on button click
        const closeButton = controlPanel.querySelector('.close-control-panel');
        closeButton?.addEventListener('click', () => {
            controlPanel.remove();
        });

        // Remove control panel when mouse leaves
        icon.addEventListener('mouseleave', () => {
            controlPanel.style.opacity = '0';
            setTimeout(() => controlPanel.remove(), 300); // Fade-out animation
        });
    }
};

// Function to send text to the background script for correction
async function sendTextForCorrection(text: string): Promise<ErrorRange[]> {
    return Promise.resolve([]);
}

setTimeout(async () => {
    const overlay = getOverlayContainer();
    const inputs = document.querySelectorAll(INPUT_SELECTOR);

    inputs.forEach((input) => {
        ['input', 'blur'].forEach(async (_event) => {
            const text = input.textContent || (input as HTMLInputElement).value || '';
            const errors = await sendTextForCorrection(text);
            highlightErrors(errors);
        });
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
                                range // Pass the range to the tooltip
                            );
                        });
                    });
                }

                currentPosition += nodeLength;
            });
        });
    }

    function getTextNodesInEditor(element: Element): Node[] {
        let textNodes: Node[] = [];
        const walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);

        let node;
        while ((node = walk.nextNode())) {
            textNodes.push(node);
        }

        return textNodes;
    }

    // Show tooltip when clicked
    function showTooltip(
        highlightBox: HTMLElement,
        errorType: string,
        explanation: string,
        suggestion: string,
        range: Range
    ) {
        const tooltip = document.createElement('div');
        tooltip.className = 'popup';
        tooltip.innerHTML = `
            <div class="popup-header">
                <span class="error-type">${errorType}</span>
                <button class="close-btn">&times;</button>
            </div>
            <p class="explanation">${explanation}</p>
            <div class="suggestion">
                <span class="suggestion-label">Suggestion:</span>
                <button class="suggestion-btn">${suggestion}</button>
            </div>
        `;

        document.body.appendChild(tooltip);

        // Position tooltip
        const rect = highlightBox.getBoundingClientRect();
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
        tooltip.style.left = `${rect.left}px`;

        // Close tooltip on button click
        const closeButton = tooltip.querySelector('.close-btn');
        closeButton?.addEventListener('click', () => {
            tooltip.remove();
        });

        // Replace selected text with suggestion when the suggestion button is clicked
        const suggestionButton = tooltip.querySelector('.suggestion-btn');
        suggestionButton?.addEventListener('click', () => {
            replaceSelectedText(range, suggestion);
            tooltip.remove(); // Close the tooltip after replacing the text
        });

        // Show tooltip
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
    }

    injectStyles();
    injectProductIcon();
}, 2000);
