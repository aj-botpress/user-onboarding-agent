import { Webchat } from "@botpress/webchat";
import "./App.css";

// Get this from your bot's webchat integration settings in Botpress Cloud
// Or from running `adk dev` - check the console output for the client ID
const CLIENT_ID = import.meta.env.VITE_WEBCHAT_CLIENT_ID || "";

function App() {
  if (!CLIENT_ID) {
    return (
      <div className="setup-message">
        <h2>Webchat Setup Required</h2>
        <p>Create a <code>.env</code> file in the webchat folder with:</p>
        <pre>VITE_WEBCHAT_CLIENT_ID=your-client-id</pre>
        <p>Get your client ID from the Webchat integration in Botpress Cloud.</p>
      </div>
    );
  }

  return (
    <div className="webchat-wrapper">
      <Webchat clientId={CLIENT_ID} />
    </div>
  );
}

export default App;
