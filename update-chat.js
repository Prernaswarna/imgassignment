(function() {
  const deploymentName = window.cesDeploymentName;
  const agentTitle = window.cesAgentTitle || "Agent";
  
  if (!deploymentName) {
    console.error("CX Agent Studio Widget Error: data-deployment-name attribute is missing.");
    return;
  }
  // Helper: Scrapes current form values
  function scrapeForm() {
    const params = {};
    const form = document.querySelector('form');
    if (form) {
      const formData = new FormData(form);
      for (const [key, val] of formData.entries()) {
        if (val) params[key] = val;
      }
    }
    return params;
  }
  // 1. Dynamically load CSS and JS assets immediately (matching baseline script)
  const cssDefaultUrl = 'https://www.gstatic.com/ces-console/fast/chat-messenger/prod/v1.15/themes/chat-messenger-default.css';
  if (!document.querySelector(`link[href="${cssDefaultUrl}"]`)) {
    const cssDefault = document.createElement('link');
    cssDefault.rel = 'stylesheet';
    cssDefault.href = cssDefaultUrl;
    document.head.appendChild(cssDefault);
  }
  const cssLayoutUrl = 'https://www.gstatic.com/ces-console/fast/chat-messenger/prod/v1.15/themes/chat-messenger-layout.css';
  if (!document.querySelector(`link[href="${cssLayoutUrl}"]`)) {
    const cssLayout = document.createElement('link');
    cssLayout.rel = 'stylesheet';
    cssLayout.href = cssLayoutUrl;
    document.head.appendChild(cssLayout);
  }
  const librarySrc = 'https://www.gstatic.com/ces-console/fast/chat-messenger/prod/v1.15/chat-messenger.js';
  if (!document.querySelector(`script[src="${librarySrc}"]`)) {
    const script = document.createElement('script');
    script.src = librarySrc;
    script.defer = true;
    document.head.appendChild(script);
  }
  // 2. Register context globally with silent parameter mapping and automated welcome dispatch
  window.addEventListener("chat-messenger-loaded", function() {
    const formParams = scrapeForm();
    if (typeof chatSdk !== 'undefined') {
      chatSdk.registerContext(
        chatSdk.prebuilts.ces.createContext({
          deploymentName: deploymentName,
          enableWelcomeEvent: true, // Automatically dispatches a single native start-of-session event
          sessionParams: formParams, // Injects scraped form fields silently into backend memory
          tokenBroker: { enableTokenBroker: true, enableRecaptcha: false }
        })
      );
    }
  });
  // 3. Build and initialize the chat agent matching your pristine baseline structure
  function startChatAgent() {
    customElements.whenDefined('chat-messenger').then(function() {
      if (document.querySelector('chat-messenger')) return;
      const chatMessenger = document.createElement('chat-messenger');
      chatMessenger.setAttribute('url-allowlist', '*');
      chatMessenger.setAttribute('render-mode', 'slide-over');
      chatMessenger.classList.add('slide-over');
      chatMessenger.style.position = 'fixed';
      chatMessenger.style.zIndex = '9999';
      const container = document.createElement('chat-messenger-container');
      container.setAttribute('chat-title', agentTitle);
      container.setAttribute('chat-title-icon', 'https://gstatic.com/dialogflow-console/common/assets/ccai-favicons/conversational_agents.png');
      container.setAttribute('enable-file-upload', '');
      const resetButton = document.createElement('chat-reset-session-button');
      resetButton.setAttribute('slot', 'titlebar-actions');
      resetButton.setAttribute('title-text', 'Start new chat');
      const toggleButton = document.createElement('chat-toggle-dialog-button');
      toggleButton.setAttribute('slot', 'titlebar-actions');
      toggleButton.setAttribute('title-text-expanded', 'Collapse');
      toggleButton.setAttribute('title-text-collapsed', 'Expand');
      const closeButton = document.createElement('chat-messenger-close-button');
      closeButton.setAttribute('slot', 'titlebar-actions');
      closeButton.setAttribute('title-text', 'Close');
      container.appendChild(resetButton);
      container.appendChild(toggleButton);
      container.appendChild(closeButton);
      chatMessenger.appendChild(container);
      document.body.appendChild(chatMessenger);
      
      console.log("Chat agent initialized cleanly with automated welcome configuration.");
    });
  }
  // Trigger custom initialization flow after your 30-second timer
  setTimeout(startChatAgent, 30000);
})();
