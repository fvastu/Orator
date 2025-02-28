export function showTooltip(
    highlightBox: HTMLElement,
    errorType: string,
    explanation: string,
    suggestion: string,
    range: Range,
    onClick = (...input: any) => {}
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
        onClick(range, suggestion);
        tooltip.remove(); // Close the tooltip after replacing the text
    });

    // Show tooltip
    tooltip.style.opacity = '1';
    tooltip.style.visibility = 'visible';
}
