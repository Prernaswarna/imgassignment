(function() {
  const deploymentName = window.cesDeploymentName;
  const agentTitle = window.cesAgentTitle || "Agent";
  
  if (!deploymentName) {
    console.error("CX Agent Studio Widget Error: data-deployment-name attribute is missing.");
    return;
  }
  // Register context mapping globally when the widget fires its loaded lifecycle event
  window.addEventListener("chat-messenger-loaded", function() {
    if (typeof chatSdk !== 'undefined') {
      chatSdk.registerContext(
        chatSdk.prebuilts.ces.createContext({
          deploymentName: deploymentName,
          enableWelcomeEvent: false, // Suppress duplicate native backend welcome events
          tokenBroker: { enableTokenBroker: true, enableRecaptcha: false }
        })
      );
    }
  });
  // Wait 30 seconds after page ingress before pulling assets and constructing the widget
  setTimeout(startChatAgent, 30000);
  function startChatAgent() {
    // 1. Load external stylesheets and JavaScript engine dynamically
    loadAssets();
    // 2. Scrape input elements prior to rendering the component DOM
    const formParams = scrapeForm();
    // 3. Construct custom element structure and inject into the document
    const chatMessenger = createWidgetElement();
    document.body.appendChild(chatMessenger);
    // 4. Define the programmatic session message logic
    const initializeSession = () => {
      if (chatMessenger.dataset.querySent) return;
      chatMessenger.dataset.querySent = "true";
      if (Object.keys(formParams).length > 0) {
        const requestString = "Here are my pre-filled form details: " + JSON.stringify(formParams);
        chatMessenger.sendQuery(requestString);
        console.log("Form data loaded and sent as request.");
      } else {
        const emptyRequestString = "No form fields filled out. Please help me get a quote.";
        chatMessenger.sendQuery(emptyRequestString);
        console.log("No form fields detected. Sent fallback request.");
      }
    };
    
    // TIMING GUARD: Once the component upgrades and fires loaded, context registration initiates.
    // We allow a brief 2-second delay for the background Token Broker authentication handshake to finish.
    const onWidgetReady = () => {
      setTimeout(initializeSession, 2000);
    };
    if (typeof chatMessenger.sendQuery === 'function') {
      onWidgetReady();
    } else {
      chatMessenger.addEventListener('chat-messenger-loaded', onWidgetReady, { once: true });
    }
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
