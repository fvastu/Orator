const injectStyles = () => {
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
};

const getOverlayContainer = () => {
    let overlay = document.getElementById('overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.zIndex = '9999';
        document.body.appendChild(overlay);
    }
    return overlay;
};
