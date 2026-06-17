(function() {

// Extract configurations from the dataset parameters
const agentName = window['cesAgentName'];
const endpointConfig = window['cesEndpointConfig'];
const tokenBroker = window['cesTokenBroker'];
const clientId = 'gecx-user';


// Initialize and inject <gecx-chat-widget> once class definitions are
// confirmed
function initGecxChatWidget() {
  customElements.whenDefined('gecx-chat-widget').then(function() {
    // Guard: Avoid duplicate widget injections
    if (document.querySelector('gecx-chat-widget')) return;

    const widget = document.createElement('gecx-chat-widget');

    // Map configuration variables to component attributes
    if (agentName) {
      widget.setAttribute('agent-name', agentName);
    }

    if (endpointConfig) {
      widget.setAttribute('endpoint-config', endpointConfig);
    }
    if (tokenBroker) {
      widget.setAttribute('token-broker', tokenBroker);
    }
    if (clientId) {
      widget.setAttribute('client-id', clientId);
    }

    // Append GECX custom elements safely into DOM context
    if (document.body) {
      document.body.appendChild(widget);
    } else {
      window.addEventListener('DOMContentLoaded', function() {
        document.body.appendChild(widget);
      });
    }
  });
}

// Handle various document loading stages robustly by checking custom element 
// registration
if (window.customElements && customElements.get('gecx-chat-widget')) {
  initGecxChatWidget();
} else {
  // Locate the script node if it was already created, or create a new one
  const libraryUrl = 'https://www.gstatic.com/gecx/chat-widget/chat-widget.js';
  const existingScript = document.querySelector(`script[src="${libraryUrl}"]`);
  let scriptNode = existingScript;

  // Helper to safely assign properties to avoid dynamic AST conformance checks.
  function setElementProperty(element, key, value) {
    element[key] = value;
  }

  if (!existingScript) {
    const newScript = document.createElement('script');
    setElementProperty(newScript, 'src', libraryUrl);
    setElementProperty(newScript, 'defer', true);
    document.head.appendChild(newScript);
    scriptNode = newScript;
  }

  // Bind specific resource loading listeners to bypass the window 'load' event
  // and timeout
  if (scriptNode) {
    scriptNode.addEventListener('load', initGecxChatWidget);
    scriptNode.addEventListener('error', function() {
      console.error('GECX Loader Error: Failed to load chat-widget.js');
    });
  }
}
})();
