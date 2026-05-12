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

  // A. Scrape whatever form data is present on the current page
    var formParams = {};
    var form = document.querySelector('form');
    if (form) {
      var formData = new FormData(form);
      for (var pair of formData.entries()) {
        // Capture non-empty values
        if (pair[1]) {
          formParams[pair[0]] = pair[1];
        }
      }
    }
    console.log("Scraped form data for GECX:", formParams);
    // B. Pass parameters to the GECX Agent session
    var chatMessenger = document.querySelector('chat-messenger');
    if (chatMessenger && Object.keys(formParams).length > 0) {
      chatMessenger.setQueryParameters({
        parameters: formParams
      });
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
  setTimeout(initChatMessenger, 30000);
})();
