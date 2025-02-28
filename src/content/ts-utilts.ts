export const debounce = (func: (...args: any[]) => void, delay: number) => {
    let debounceTimeout: NodeJS.Timeout;
    return (...args: any[]) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => func(...args), delay);
    };
};
