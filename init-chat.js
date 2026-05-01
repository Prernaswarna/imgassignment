(function() {
  const deploymentName = window.cesDeploymentName;
  const agentTitle = window.cesAgentTitle || "Agent";
  console.log(window.cesAgentTitle);
  console.log(agentTitle);

  // CSS customizations
  // const colorOnPrimaryContainer = window.cesColorOnPrimaryContainer;
  // const primaryColor = window.cesColorPrimary;
  // const primaryContainerColor = window.cesColorPrimaryContainer;
  // const fontFamily = window.cesFontFamily;

  // console.log("colorOnPrimaryContainer: ", colorOnPrimaryContainer);
  // console.log("primaryColor: ", primaryColor);
  // console.log("primaryContainerColor: ", primaryContainerColor);
  
  if (!deploymentName) {
    console.error("CX Agent Studio Widget Error: data-deployment-name attribute is missing from the script tag.");
    return;
  }
  else {
    console.log(deploymentName);
  }
  // 2. Dynamically load Chat Messenger Stylesheets (Guarded against duplicates)
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
  // 3. Dynamically load Chat Messenger Library (Guarded against duplicates)
  const librarySrc = 'https://www.gstatic.com/ces-console/fast/chat-messenger/prod/v1.15/chat-messenger.js';
  if (!document.querySelector(`script[src="${librarySrc}"]`)) {
    const script = document.createElement('script');
    script.src = librarySrc;
    script.defer = true;
    document.head.appendChild(script);
  }
  // 4. JavaScript to create and initialize
  window.addEventListener("chat-messenger-loaded", function() {
    if (typeof chatSdk !== 'undefined') {
      chatSdk.registerContext(
        chatSdk.prebuilts.ces.createContext({
          deploymentName: deploymentName, // Using the parameter
          tokenBroker: {
            enableTokenBroker: true,
            enableRecaptcha: true
          }
        })
      );
    }
  });
  function initChatMessenger() {
    customElements.whenDefined('chat-messenger').then(function() {
      if (document.querySelector('chat-messenger')) return;
      
      var chatMessenger = document.createElement('chat-messenger');
      chatMessenger.setAttribute('url-allowlist', '*');
      
      chatMessenger.setAttribute('render-mode', 'slide-over');
      chatMessenger.classList.add('slide-over');

      chatMessenger.style.position = 'fixed';
      chatMessenger.style.zIndex = '9999';

       // Dynamically set custom properties if parsed correctly
      // if (colorOnPrimaryContainer && String(colorOnPrimaryContainer).trim() !== "") {
      //   chatMessenger.style.setProperty('--chat-messenger-color--on-primary-container', String(colorOnPrimaryContainer).trim());
      // }
      // if (primaryColor && String(primaryColor).trim() !== "") {
      //   chatMessenger.style.setProperty('--chat-messenger-color--primary', String(primaryColor).trim());
      // }
      // if (primaryContainerColor && String(primaryContainerColor).trim() !== "") {
      //   chatMessenger.style.setProperty('--chat-messenger-color--primary-container', String(primaryContainerColor).trim());
      // }
      // if (fontFamily && String(fontFamily).trim() !== "") {
      //   chatMessenger.style.setProperty('--chat-messenger-font-family', String(fontFamily).trim());
      // }
      
      var container = document.createElement('chat-messenger-container');
      container.setAttribute('chat-title', agentTitle);
      container.setAttribute('chat-title-icon', 'https://gstatic.com/dialogflow-console/common/assets/ccai-favicons/conversational_agents.png');
      container.setAttribute('enable-file-upload', '');
      
      var resetButton = document.createElement('chat-reset-session-button');
      resetButton.setAttribute('slot', 'titlebar-actions');
      resetButton.setAttribute('title-text', 'Start new chat');
      
      var toggleButton = document.createElement('chat-toggle-dialog-button');
      toggleButton.setAttribute('slot', 'titlebar-actions');
      toggleButton.setAttribute('title-text-expanded', 'Collapse');
      toggleButton.setAttribute('title-text-collapsed', 'Expand');
      
      var closeButton = document.createElement('chat-messenger-close-button');
      closeButton.setAttribute('slot', 'titlebar-actions');
      closeButton.setAttribute('title-text', 'Close');
      
      container.appendChild(resetButton);
      container.appendChild(toggleButton);
      container.appendChild(closeButton);
      chatMessenger.appendChild(container);
      
      if (document.body) {
        document.body.appendChild(chatMessenger);
      } else {
        window.addEventListener('DOMContentLoaded', function() {
          document.body.appendChild(chatMessenger);
        });
      }
    });
  }
  if (window.customElements && customElements.get('chat-messenger')) {
    initChatMessenger();
  } else {
    window.addEventListener('load', initChatMessenger);
    setTimeout(initChatMessenger, 3000);
  }
})();
