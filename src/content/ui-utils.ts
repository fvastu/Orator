type Severity = 'error' | 'warning';

// Constant for underline colors
const UNDERLINE_COLORS: Record<Severity, string> = {
    error: '#e74c3c', // Red for errors
    warning: '#f39c12', // Orange for warnings
};

/**
 * Function to get underline color based on severity
 * @param severity - The severity level ('error', 'warning', 'correction')
 * @returns The corresponding color code as a string
 */
const getUnderlineColor = (severity: Severity): string => UNDERLINE_COLORS[severity];
