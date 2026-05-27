(function() {
  // 1. Get the current script element and extract configuration parameters
  const currentScript = document.currentScript;
  
  // Extract configurations from either dataset parameters (data-*) or fallback global window variables
  const agentName = (currentScript && currentScript.dataset.agentName) || window.gecxAgentName;
  const endpointConfig = (currentScript && currentScript.dataset.endpointConfig) || window.gecxEndpointConfig;
  const tokenBroker = (currentScript && currentScript.dataset.tokenBroker) || window.gecxTokenBroker;
  const environment = (currentScript && currentScript.dataset.environment) || window.gecxEnvironment || "prod";
  const clientId = (currentScript && currentScript.dataset.clientId) || window.gecxClientId || "gecx-user";
  const userId = (currentScript && currentScript.dataset.userId) || window.gecxUserId || "";
  const enableLogging = (currentScript && currentScript.dataset.enableLogging !== "false") && window.gecxEnableLogging !== false;
  const hideLauncher = (currentScript && currentScript.dataset.hideLauncher === "true") || window.gecxHideLauncher === true;
  // Validation: Guard against missing essential GECX parameters
  if (!agentName) {
    console.error("GECX Loader Error: 'agentName' parameter is missing. Please define data-agent-name on the script tag, or set window.gecxAgentName.");
    return;
  }
  console.log("Initializing GECX Loader for agent: ", agentName);
  // 2. Dynamically load GECX Library Bundle (Guarded against duplicate downloads)
  const libraryUrl = 'https://www.gstatic.com/gecx/chat-widget/chat-widget.js';
  if (!document.querySelector(`script[src="${libraryUrl}"]`)) {
    const script = document.createElement('script');
    script.src = libraryUrl;
    script.defer = true;
    document.head.appendChild(script);
  }
  // 3. Initialize and inject <gecx-chat-widget> once class definitions are confirmed
  function initGecxChatWidget() {
    customElements.whenDefined('gecx-chat-widget').then(function() {
      // Guard: Avoid duplicate widget injections
      if (document.querySelector('gecx-chat-widget')) return;
      console.log("Custom element 'gecx-chat-widget' defined. Creating element instance...");
      
      const widget = document.createElement('gecx-chat-widget');
      
      // Map configuration variables to component attributes
      widget.setAttribute('agent-name', agentName);
      
      if (endpointConfig) {
        widget.setAttribute('endpoint-config', endpointConfig);
      }
      if (tokenBroker) {
        widget.setAttribute('token-broker', tokenBroker);
      }
      if (environment) {
        widget.setAttribute('environment', environment);
      }
      if (clientId) {
        widget.setAttribute('client-id', clientId);
      }
      if (userId) {
        widget.setAttribute('user-id', userId);
      }
      if (enableLogging) {
        widget.setAttribute('enable-logging', 'true');
      }
      if (hideLauncher) {
        widget.setAttribute('hide-launcher', 'true');
      }
      // 4. Append GECX custom elements safely into DOM context
      if (document.body) {
        document.body.appendChild(widget);
      } else {
        window.addEventListener('DOMContentLoaded', function() {
          document.body.appendChild(widget);
        });
      }
    });
  }
  // Handle various document loading stages robustly
  if (window.customElements && customElements.get('gecx-chat-widget')) {
    initGecxChatWidget();
  } else {
    // Try on page loading milestones
    window.addEventListener('load', initGecxChatWidget);
    // Dynamic loading safety fallback 
    setTimeout(initGecxChatWidget, 3000);
  }
})();
