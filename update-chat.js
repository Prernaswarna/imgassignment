(function() {
  const deploymentName = window.cesDeploymentName;
  const agentTitle = window.cesAgentTitle || "Agent";
  console.log(window.cesAgentTitle);
  console.log(agentTitle);
  
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
  
  // 4. Function to build, configure, and append the chat messenger element
  function initChatMessenger() {
    // Ensure the library is fully loaded before configuring the element
    customElements.whenDefined('chat-messenger').then(function() {
      if (document.querySelector('chat-messenger')) return;
      
      console.log("30 seconds up! Initializing GECX Messenger element...");
      var chatMessenger = document.createElement('chat-messenger');
      chatMessenger.setAttribute('url-allowlist', '*');
      
      chatMessenger.setAttribute('render-mode', 'slide-over');
      chatMessenger.classList.add('slide-over');
      chatMessenger.style.position = 'fixed';
      chatMessenger.style.zIndex = '9999';
      
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
      
      // STEP A: Scrape form data now (at the 30-second mark)
      var formParams = {};
      var form = document.querySelector('form');
      if (form) {
        var formData = new FormData(form);
        for (var pair of formData.entries()) {
          if (pair[1]) { // Only grab filled-out inputs
            formParams[pair[0]] = pair[1];
          }
        }
      }
      console.log("Form data scraped successfully:", formParams);
      // STEP B: Inject form parameters directly into the element
      if (Object.keys(formParams).length > 0) {
        chatMessenger.setQueryParameters({
          parameters: formParams
        });
        console.log("Form parameters loaded into messenger.");
      }
      // STEP C: Append element to DOM
      if (document.body) {
        document.body.appendChild(chatMessenger);
      } else {
        window.addEventListener('DOMContentLoaded', function() {
          document.body.appendChild(chatMessenger);
        });
      }
      // STEP D: Register GECX Context and trigger welcome event immediately!
      if (typeof chatSdk !== 'undefined') {
        chatSdk.registerContext(
          chatSdk.prebuilts.ces.createContext({
            deploymentName: deploymentName,
            enableWelcomeEvent: true, // Initiates greeting automatically
            tokenBroker: {
              enableTokenBroker: true,
              enableRecaptcha: true
            }
          })
        );
        console.log("GECX Context registered successfully!");
      }
    });
  }
  
  // Wait 30 seconds before starting the initialization
  setTimeout(initChatMessenger, 30000);
})();
