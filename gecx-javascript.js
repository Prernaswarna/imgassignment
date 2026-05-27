(function() {
  // 1. Get the current script element and extract configuration parameters
  const currentScript = document.currentScript;
  
  // Extract configurations from either dataset parameters (data-*) or fallback global window variables
  const agentName = "projects/531441956178/locations/global/agents/cea824fc-f195-4222-a773-aa538e939599";
  const endpointConfig = "projects/531441956178/locations/us/omnichannelEndpointConfigs/src-wsdk-0284700b-0317-4d3b-a517-a541b35cd757";
  const tokenBroker = "projects/531441956178/locations/us/omnichannelTokenBrokers/tb-541b36c9-d913-4bb6-a3b3-2a28d6570167";
  const environment = "prod";
  const clientId = "gecx-user";
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
