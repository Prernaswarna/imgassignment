(function() {
  const deploymentName = window.cesDeploymentName;
  const agentTitle = window.cesAgentTitle || "Agent";
  
  if (!deploymentName) {
    console.error("CX Agent Studio Widget Error: data-deployment-name attribute is missing.");
    return;
  }
  // 1. Load stylesheets and JS library immediately in the background
  loadAssets();
  // 2. Wait 30 seconds, then build and start the chat agent
  setTimeout(startChatAgent, 30000);
  function startChatAgent() {
    // Create widget, scrape form inputs, and append it to the page
    const chatMessenger = createWidgetElement();
    document.body.appendChild(chatMessenger);
    const formParams = scrapeForm();
    // Wait for browser component to initialize, then connect GECX
    customElements.whenDefined('chat-messenger').then(function() {
      
      // Connect widget to your GECX Deployment
      if (typeof chatSdk !== 'undefined') {
        chatSdk.registerContext(
          chatSdk.prebuilts.ces.createContext({
            deploymentName: deploymentName,
            tokenBroker: { enableTokenBroker: true, enableRecaptcha: true }
          })
        );
      }
      // Define the action to execute once GECX is fully upgraded and authenticated
      const initializeSession = () => {
        if (Object.keys(formParams).length > 0) {
          // Convert form object to a string and send directly as the chat request
          const requestString = JSON.stringify(formParams);
          chatMessenger.sendQuery(requestString);
          console.log("Form data loaded and sent as request.");
        }
      };
      
      // TIMING GUARD: Wait for the widget to load, then give the Token Broker 
      // a brief moment to successfully generate the chatToken before sending the request.
      const onWidgetReady = () => {
        setTimeout(initializeSession, 2000); // 2-second delay for authentication handshake
      };
      if (typeof chatMessenger.sendQuery === 'function') {
        onWidgetReady();
      } else {
        chatMessenger.addEventListener('chat-messenger-loaded', onWidgetReady, { once: true });
      }
    });
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
  // Helper: Creates clean HTML elements for the widget
  function createWidgetElement() {
    const widget = document.createElement('chat-messenger');
    widget.setAttribute('url-allowlist', '*');
    widget.setAttribute('render-mode', 'slide-over');
    widget.classList.add('slide-over');
    widget.style.position = 'fixed';
    widget.style.zIndex = '9999';
    const container = document.createElement('chat-messenger-container');
    container.setAttribute('chat-title', agentTitle);
    container.setAttribute('chat-title-icon', 'https://gstatic.com/dialogflow-console/common/assets/ccai-favicons/conversational_agents.png');
    container.setAttribute('enable-file-upload', '');
    const toggle = document.createElement('chat-toggle-dialog-button');
    toggle.setAttribute('slot', 'titlebar-actions');
    container.appendChild(toggle);
    widget.appendChild(container);
    return widget;
  }
  // Helper: Dynamically downloads CSS/JS tags
  function loadAssets() {
    const assets = [
      { tag: 'link', rel: 'stylesheet', href: 'https://www.gstatic.com/ces-console/fast/chat-messenger/prod/v1.15/themes/chat-messenger-default.css' },
      { tag: 'link', rel: 'stylesheet', href: 'https://www.gstatic.com/ces-console/fast/chat-messenger/prod/v1.15/themes/chat-messenger-layout.css' },
      { tag: 'script', src: 'https://www.gstatic.com/ces-console/fast/chat-messenger/prod/v1.15/chat-messenger.js', defer: true }
    ];
    assets.forEach(a => {
      const selector = a.tag === 'link' ? `link[href="${a.href}"]` : `script[src="${a.src}"]`;
      if (!document.querySelector(selector)) {
        const el = document.createElement(a.tag);
        Object.assign(el, a);
        document.head.appendChild(el);
      }
    });
  }
})();
