(function() {
  const deploymentName = window.cesDeploymentName;
  const agentTitle = window.cesAgentTitle || "Agent";
  const oauthClientId = "531441956178-vh7bgce9hkb9svgajkb34458u4f5ip9t.apps.googleusercontent.com";
  
  if (!deploymentName) {
    console.error("CX Agent Studio Widget Error: data-deployment-name attribute is missing.");
    return;
  }
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
  // 1. Dynamically load CSS, widget JS, and Google Identity Services (GSI) for the login chip
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
  const gsiSrc = 'https://accounts.google.com/gsi/client';
  if (!document.querySelector(`script[src="${gsiSrc}"]`)) {
    const gsiScript = document.createElement('script');
    gsiScript.src = gsiSrc;
    gsiScript.defer = true;
    document.head.appendChild(gsiScript);
  }
  // 2. Register context mapping globally when loaded fires (enabling default token broker)
  window.addEventListener("chat-messenger-loaded", function() {
    if (typeof chatSdk !== 'undefined') {
      chatSdk.registerContext(
        chatSdk.prebuilts.ces.createContext({
          deploymentName: deploymentName,
          enableWelcomeEvent: false,
          // Defaults to unauthenticated anonymous token broker session
          tokenBroker: { enableTokenBroker: true, enableRecaptcha: false }
        })
      );
    }
  });
  // 3. Build and initialize the chat agent
  function startChatAgent() {
    customElements.whenDefined('chat-messenger').then(function() {
      if (document.querySelector('chat-messenger')) return;
      const formParams = scrapeForm();
      const chatMessenger = document.createElement('chat-messenger');
      chatMessenger.setAttribute('url-allowlist', '*');
      chatMessenger.setAttribute('render-mode', 'slide-over');
      chatMessenger.setAttribute('send-welcome-event', 'false');
      // Note: NO oauth-client-id attribute here so the chat remains unblocked/anonymous by default
      chatMessenger.classList.add('slide-over');
      chatMessenger.style.position = 'fixed';
      chatMessenger.style.zIndex = '9999';
      const container = document.createElement('chat-messenger-container');
      container.setAttribute('chat-title', agentTitle);
      container.setAttribute('chat-title-icon', 'https://gstatic.com/dialogflow-console/common/assets/ccai-favicons/conversational_agents.png');
      container.setAttribute('enable-file-upload', '');
      // Create a container in the titlebar specifically for the optional Google Sign-In chip
      const authChipContainer = document.createElement('div');
      authChipContainer.setAttribute('slot', 'titlebar-actions');
      authChipContainer.style.display = 'inline-block';
      authChipContainer.style.marginRight = '8px';
      authChipContainer.style.verticalAlign = 'middle';
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
      // Append titlebar items in visual order
      container.appendChild(authChipContainer);
      container.appendChild(resetButton);
      container.appendChild(toggleButton);
      container.appendChild(closeButton);
      chatMessenger.appendChild(container);
      document.body.appendChild(chatMessenger);
      // Initialize Google Sign-In chip once GSI library is fully loaded
      const initAuthChip = () => {
        if (window.google && google.accounts && google.accounts.id) {
          google.accounts.id.initialize({
            client_id: oauthClientId,
            callback: (response) => {
              console.log("Optional Google Sign-In successful.");
              // Pass the authenticated user token into Dialogflow CX session parameters
              if (typeof chatMessenger.setQueryParameters === 'function') {
                chatMessenger.setQueryParameters({
                  parameters: {
                    id_token: response.credential
                  }
                });
              }
              // Replace chip with a visual confirmation
              authChipContainer.innerHTML = '<span style="color: #1a73e8; font-size: 12px; font-weight: 500; padding: 4px 8px; background: #e8f0fe; border-radius: 12px;">✓ Verified</span>';
            }
          });
          google.accounts.id.renderButton(authChipContainer, {
            type: "standard",
            theme: "outline",
            size: "small",
            text: "signin"
          });
        } else {
          setTimeout(initAuthChip, 500);
        }
      };
      initAuthChip();
      // 4. Define programmatic query logic
      const initializeSession = () => {
        if (chatMessenger.dataset.querySent) return;
        chatMessenger.dataset.querySent = "true";
        if (Object.keys(formParams).length > 0) {
          const requestString = "Here are my pre-filled form details: " + JSON.stringify(formParams);
          chatMessenger.sendQuery(requestString);
          console.log("Form data sent programmatically.");
        } else {
          const emptyRequestString = "No form fields filled out.";
          chatMessenger.sendQuery(emptyRequestString);
          console.log("Empty form request sent programmatically.");
        }
      };
      setTimeout(initializeSession, 2000);
    });
  }
  setTimeout(startChatAgent, 30000);
})();
