(function() {
  // 1. Get the deployment name from the script tag parameter
  const currentScript = document.currentScript;
  const deploymentName = currentScript.dataset.deploymentName;
  if (!deploymentName) {
    console.error("CX Agent Studio Widget Error: data-deployment-name attribute is missing from the script tag.");
    return;
  }
  else {
    console.log(deploymentName);
  }
  // 2. Dynamically load Chat Messenger Stylesheets
  const cssDefault = document.createElement('link');
  cssDefault.rel = 'stylesheet';
  cssDefault.href = 'https://www.gstatic.com/ces-console/fast/chat-messenger/prod/v1.15/themes/chat-messenger-default.css';
  document.head.appendChild(cssDefault);
  const cssLayout = document.createElement('link');
  cssLayout.rel = 'stylesheet';
  cssLayout.href = 'https://www.gstatic.com/ces-console/fast/chat-messenger/prod/v1.15/themes/chat-messenger-layout.css';
  document.head.appendChild(cssLayout);
  // 3. Dynamically load Chat Messenger Library
  const script = document.createElement('script');
  script.src = 'https://www.gstatic.com/ces-console/fast/chat-messenger/prod/v1.15/chat-messenger.js';
  script.defer = true;
  document.head.appendChild(script);
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
      
      var container = document.createElement('chat-messenger-container');
      container.setAttribute('chat-title', 'Agent');
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
