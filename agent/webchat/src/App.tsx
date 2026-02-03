import { Chat } from "./components/Chat";

function App() {
  return (
    <div className="min-h-screen w-full bg-blue-400 flex items-center justify-center p-4">
      {/* Outer frame (gray border effect) */}
      <div className="w-full max-w-2xl h-[550px] bg-gray-300 rounded-3xl p-3 shadow-xl">
        
        {/* Inner white container */}
        <div className="h-full bg-white rounded-2xl overflow-hidden flex flex-col">
          <Chat />
        </div>
      </div>
    </div>
  );
}

export default App;
