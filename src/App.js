import './App.css';
import ChatInterface from './components/Chat_component';

function App() {
  return (
    <div className="App">
      <h1>Welcome</h1>
      <div className="chat-container">
        <ChatInterface />
      </div>
    </div>
  );
}

export default App;