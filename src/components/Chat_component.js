import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User } from 'lucide-react';
import './Confirmation_Modal.js';
import './Goods_Input_Row.js';
import './Wastage_Fields.js';
import './Production_Stage.js';
import './Stage_Flow.js';
import './Stage_Selector.js';
import './Production_Summary.js';

export default function ChatInterface() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', content: 'Please select the number of production stages:', component: 'stage-selector' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [stagesCount, setStagesCount] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [stagesData, setStagesData] = useState([]);
  const [isEnlarged, setIsEnlarged] = useState(false); // State to track enlarged mode
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && !isLoggedIn) {
      setShowLoginForm(true);
    }
  };

  const handleLogin = (email, password) => {
    setIsLoggedIn(true);
    setShowLoginForm(false);
    setUserDetails({ email });
    setMessages([{ type: 'bot', content: `Welcome back, ${email}! Please select the number of production stages:`, component: 'stage-selector' }]);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;
    setMessages([...messages, { type: 'user', content: inputValue }]);
    setInputValue('');
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { type: 'bot', content: 'How can I assist you further?' }
      ]);
    }, 1000);
  };

  useEffect(() => {
    const handleSelectStages = (e) => {
      const { stages } = e.detail;
      setStagesCount(stages);
      setStagesData(Array(stages).fill(null));
      setMessages((prev) => [
        ...prev,
        { type: 'user', content: `Number of stages: ${stages}` },
        { type: 'bot', content: `Enter details for Stage 1:`, component: 'production-stage', props: { 'stage-index': 0, 'is-last': stages === 1 } }
      ]);
    };
    document.addEventListener('select', handleSelectStages);
    return () => document.removeEventListener('select', handleSelectStages);
  }, []);

  useEffect(() => {
    const handleStageComplete = (e) => {
      const stageData = e.detail;
      const newStagesData = [...stagesData];
      newStagesData[currentStage] = stageData;
      setStagesData(newStagesData);
      const nextStage = currentStage + 1;
      if (nextStage < stagesCount) {
        setCurrentStage(nextStage);
        setMessages((prev) => [
          ...prev,
          { type: 'user', content: `Stage ${currentStage + 1} submitted.` },
          { type: 'bot', content: `Enter details for Stage ${nextStage + 1}:`, component: 'production-stage', props: { 'stage-index': nextStage, 'is-last': nextStage === stagesCount - 1 } }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { type: 'user', content: `Stage ${currentStage + 1} submitted.` },
          { type: 'bot', content: 'Review your production stages:', component: 'production-summary', props: { stages: JSON.stringify(newStagesData) } }
        ]);
      }
    };
    document.addEventListener('complete', handleStageComplete);
    return () => document.removeEventListener('complete', handleStageComplete);
  }, [currentStage, stagesCount, stagesData]);

  useEffect(() => {
    const handleEditStage = (e) => {
      const { index } = e.detail;
      setCurrentStage(index);
      setMessages((prev) => [
        ...prev,
        { type: 'user', content: `Editing Stage ${index + 1}.` },
        { type: 'bot', content: `Edit details for Stage ${index + 1}:`, component: 'production-stage', props: { 'stage-index': index, 'initial-data': JSON.stringify(stagesData[index]), 'is-last': index === stagesCount - 1 } }
      ]);
    };
    document.addEventListener('edit', handleEditStage);
    return () => document.removeEventListener('edit', handleEditStage);
  }, [stagesData, stagesCount]);

  useEffect(() => {
    const handleReset = () => {
      setStagesCount(0);
      setCurrentStage(0);
      setStagesData([]);
      setMessages([
        { type: 'bot', content: 'Please select the number of production stages:', component: 'stage-selector' }
      ]);
    };
    document.addEventListener('reset', handleReset);
    return () => document.removeEventListener('reset', handleReset);
  }, []);

  const toggleEnlarge = () => {
    setIsEnlarged(!isEnlarged);
  };

  const renderComponent = (component, props) => {
    switch (component) {
      case 'stage-selector':
        return <stage-selector {...props} />;
      case 'production-stage':
        return <production-stage {...props} />;
      case 'production-summary':
        return <production-summary {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="chat-container">
      <button
        onClick={toggleChat}
        className="chat-bubble"
        aria-label="Toggle chat"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {isOpen && (
        <div className={`chat-interface ${isEnlarged ? 'enlarged' : ''}`}>
          <div className="chat-header">
            <h3>Customer Support</h3>
            {isLoggedIn && userDetails && (
              <div className="user-info">
                <User size={16} className="mr-1" />
                {userDetails.email}
              </div>
            )}
            {/* Enlarge/Minimize Button */}
            <button
              onClick={toggleEnlarge}
              className="enlarge-button"
              aria-label="Toggle enlarge"
            >
              {isEnlarged ? 'Minimize' : 'Enlarge'}
            </button>
          </div>

          <div className="chat-body">
            {showLoginForm ? (
              <LoginForm onLogin={handleLogin} />
            ) : (
              <>
                {messages.map((message, index) => (
                  <div key={index} className={`chat-message ${message.type === 'user' ? 'user' : 'bot'}`}>
                    <div className="bubble">
                      {message.content}
                    </div>
                    {message.component && (
                      <div className="mt-2">
                        {renderComponent(message.component, message.props)}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {isLoggedIn && (
            <div className="chat-footer">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..."
              />
              <button onClick={handleSendMessage}>
                <Send size={18} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="login-form">
      <h3>Login to Chat</h3>
      <div>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button onClick={handleSubmit}>Login</button>
      </div>
    </div>
  );
}