export const injectProductIcon = () => {
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
