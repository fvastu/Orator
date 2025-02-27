// Function to replace the selected text with the suggestion
export function replaceSelectedText(range: Range, suggestion: string) {
    const selection = window.getSelection();
    if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand('insertText', false, suggestion); // Replace the selected text
    }
}
