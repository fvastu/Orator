setTimeout(async () => {
    type Severity = 'error' | 'warning';
    type ErrorRange = { start: number; end: number; severity: Severity };

    // Function to send text to the background script for correction
    async function sendTextForCorrection(text: string): Promise<ErrorRange[]> {
        return Promise.resolve([]);
    }

    let overlay = document.getElementById('overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.zIndex = '9999';
        document.body.appendChild(overlay);
    }

    const elements = document.querySelectorAll("textarea, input[type='text'], [contenteditable]");

    elements.forEach((element) => {
        // Immediate processing on text input (including deletion)
        element.addEventListener('input', async () => {
            const text = element.textContent || (element as HTMLInputElement).value || '';
            const errors = await sendTextForCorrection(text);
            highlightErrors(errors);
        });

        // Trigger re-validation when text is deleted or edited
        element.addEventListener('blur', async () => {
            const text = element.textContent || (element as HTMLInputElement).value || '';
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

    // Function to get underline color based on severity
    function getUnderlineColor(severity: Severity): string {
        if (severity === 'error') {
            return '#e74c3c'; // Red for errors
        } else if (severity === 'warning') {
            return '#f39c12'; // Orange for warnings
        }
        return '#00FF00'; // Green for corrections (optional)
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

    // Function to replace the selected text with the suggestion
    function replaceSelectedText(range: Range, suggestion: string) {
        const selection = window.getSelection();
        if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand('insertText', false, suggestion); // Replace the selected text
        }
    }

    // Add styles for animation and tooltips
    const style = document.createElement('style');
    style.innerHTML = `
        .highlight-box {
            position: absolute;
            background: transparent;
            cursor: pointer;
            transition: background 0.2s ease-in-out;
        }

        .highlight-box:hover {
            background: rgba(231, 76, 60, 0.1); /* Light red for errors */
        }

        .popup {
            height: fit-content;
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            width: 300px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
            padding: 1rem;
            margin-bottom: 10px;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s, visibility 0.3s;
            z-index: 1000;
        }

        .popup::before {
            content: "";
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-top: 10px solid white;
        }

        .popup-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }

        .error-type {
            font-weight: bold;
            color: #e74c3c;
        }

        .close-btn {
            background: none;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            color: #7f8c8d;
        }

        .explanation {
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
            color: #333; /* Darker text for better contrast */
        }

        .suggestion {
            display: flex;
            align-items: center;
        }

        .suggestion-label {
            font-size: 0.9rem;
            font-weight: bold;
            margin-right: 0.5rem;
            color: #333; /* Darker text for better contrast */
        }

        .suggestion-btn {
            background-color: #3498db;
            color: white;
            border: none;
            padding: 0.3rem 0.8rem;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        .suggestion-btn:hover {
            background-color: #2980b9;
        }
    `;
    document.head.appendChild(style);

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
}, 2000);
