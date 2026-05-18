(function() {
  const deploymentName = window.cesDeploymentName;
  const agentTitle = window.cesAgentTitle || "Agent";
  const oauthClientId = "531441956178-vh7bgce9hkb9svgajkb34458u4f5ip9t.apps.googleusercontent.com";
  
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

  // JWT Token
    function decodeJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Failed to decode JWT payload:", e);
      return null;
    }
  }
  
  // 1. Dynamically load CSS and JS assets immediately (including Google Identity Services)
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
  // 2. Register context mapping globally when loaded fires (enabling default anonymous token broker)
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
  // 3. Build and initialize the chat agent matching your baseline structure
  function startChatAgent() {
    customElements.whenDefined('chat-messenger').then(function() {
      if (document.querySelector('chat-messenger')) return;
      const formParams = scrapeForm();
      const chatMessenger = document.createElement('chat-messenger');
      chatMessenger.setAttribute('url-allowlist', '*');
      chatMessenger.setAttribute('render-mode', 'slide-over');
      chatMessenger.setAttribute('send-welcome-event', 'false');
      chatMessenger.classList.add('slide-over');
      chatMessenger.style.position = 'fixed';
      chatMessenger.style.zIndex = '9999';
      const container = document.createElement('chat-messenger-container');
      container.setAttribute('chat-title', agentTitle);
      container.setAttribute('chat-title-icon', 'https://gstatic.com/dialogflow-console/common/assets/ccai-favicons/conversational_agents.png');
      container.setAttribute('enable-file-upload', '');
      // Create a compact container in the titlebar specifically for the Google G icon button
      const authChipContainer = document.createElement('div');
      authChipContainer.setAttribute('slot', 'titlebar-actions');
      authChipContainer.style.display = 'inline-flex';
      authChipContainer.style.alignItems = 'center';
      authChipContainer.style.marginRight = '4px';
      authChipContainer.title = "Sign in with Google"; // Tooltip explanation on hover
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
      // Append titlebar items in visual order from left to right
      container.appendChild(authChipContainer);
      container.appendChild(resetButton);
      container.appendChild(toggleButton);
      container.appendChild(closeButton);
      chatMessenger.appendChild(container);
      document.body.appendChild(chatMessenger);
      // Initialize Google Sign-In icon once GSI library is fully loaded
      const initAuthChip = () => {
        if (window.google && google.accounts && google.accounts.id) {
          google.accounts.id.initialize({
            client_id: oauthClientId,
              callback: (response) => {
                  console.log("Optional Google Sign-In successful.");
                  console.log("Logging oauth details :" + payload.name + " " + payload.given_name + " " + payload.email);
    
                  const payload = decodeJwt(response.credential);
                  if (payload && typeof chatMessenger.setQueryParameters === 'function') {
                    chatMessenger.setQueryParameters({
                      parameters: {
                        id_token: response.credential, // Keep signed token if backend verification is required later
                        user_name: payload.name,
                        user_given_name: payload.given_name,
                        user_email: payload.email
                      }
                    });
                  }
                  // Replace G icon with a compact verified checkmark badge
                  authChipContainer.innerHTML = '<span style="color: #1a73e8; font-size: 14px; font-weight: bold; padding: 4px 8px; background: #e8f0fe; border-radius: 50%;" title="Verified">✓</span>';
              }
          });
          
          // Render the ultra-compact circular Google 'G' icon button
          google.accounts.id.renderButton(authChipContainer, {
            type: "icon",       // Icon-only mode (no text)
            shape: "circle",    // Perfect circular footprint matching titlebar buttons
            theme: "outline",   // Subtle border
            size: "small"       // Matches dimensions of existing titlebar icons
          });
          // Trigger Google One Tap floating prompt for effortless login
          google.accounts.id.prompt();
        } else {
          setTimeout(initAuthChip, 500);
        }
      };
      initAuthChip();
      // 4. Define the programmatic query logic exactly as instructed by your prompt
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
      // Allow component and Token Broker handshakes to settle
      setTimeout(initializeSession, 2000);
    });
  }
  // Trigger custom initialization flow after your ingress delay
  setTimeout(startChatAgent, 30000);
})();
