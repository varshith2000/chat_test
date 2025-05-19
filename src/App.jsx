import './App.css'
import ChatInterface from './components/Chat_Compnents.jsx';

function App() {

  return (
    <>
      <div>
        
      </div>
      <h1>Welcome</h1>
      <div className="chat-container">
        <ChatInterface />
      </div>
      {/* <Router>
      <div className="min-h-screen bg-white">
        <main>
          <Routes>
            <Route path="/" element={<ChatBot />} />
            <Route path="/sku" element={<SkuPage />} />
          </Routes>
        </main>
      </div>
    </Router> */}
    </>
  )
}

export default App
