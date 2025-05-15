import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User } from 'lucide-react';
import './Confirmation_Modal.jsx';
import './Goods_Input_Row.jsx';
import './Wastage_Fields.jsx';
import './Production_Stage.jsx';
import './Stage_Flow.jsx';
import './Stage_Selector.jsx';
import './Production_Summary.jsx';

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
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [isSelectingStages, setIsSelectingStages] = useState(true); // Track stage selection phase
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

  const handleClose = () => {
    setIsOpen(false);
    setIsEnlarged(false);
  };

  const handleLogin = (email, password) => {
    setIsLoggedIn(true);
    setShowLoginForm(false);
    setUserDetails({ email });
    setMessages([{ type: 'bot', content: `Welcome back, ${email}! Please select the number of production stages:`, component: 'stage-selector' }]);
    setIsSelectingStages(true);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (isSelectingStages) {
      const numValue = parseInt(inputValue.trim(), 10);
      if (!isNaN(numValue) && numValue > 0) {
        setStagesCount(numValue);
        const initialStageData = {
          rawGoods: [{ name: '', qty: '', dimension: '' }],
          outputGoods: [{ name: '', qty: '', dimension: '' }],
          middleFields: {
            wastageEntries: [{ good: '', wastage: '', type: 'percent' }],
            time: '',
            outsource: 'no'
          }
        };
        setStagesData(Array(numValue).fill(null).map(() => ({ ...initialStageData })));
        setMessages((prev) => [
          ...prev,
          { type: 'user', content: `${numValue}` },
          { 
            type: 'bot', 
            content: `Please fill in the details for all ${numValue} production stages. You can save each stage independently, and submit the workflow once all stages are complete.`, 
            component: 'multi-production-stages', 
            props: { stagesCount: numValue } 
          }
        ]);
        setIsSelectingStages(false);
      } else {
        setMessages((prev) => [
          ...prev,
          { type: 'bot', content: 'Please enter a valid number of stages (greater than 0).' }
        ]);
      }
      setInputValue('');
    } else if (inputValue.trim() !== '') {
      setMessages([...messages, { type: 'user', content: inputValue }]);
      setInputValue('');
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { type: 'bot', content: 'How can I assist you further?' }
        ]);
      }, 1000);
    }
  };

  useEffect(() => {
    const handleSelectStages = (e) => {
      const { stages } = e.detail;
      setStagesCount(stages);
      const initialStageData = {
        rawGoods: [{ name: '', qty: '', dimension: '' }],
        outputGoods: [{ name: '', qty: '', dimension: '' }],
        middleFields: {
          wastageEntries: [{ good: '', wastage: '', type: 'percent' }],
          time: '',
          outsource: 'no'
        }
      };
      setStagesData(Array(stages).fill(null).map(() => ({ ...initialStageData })));
      setMessages((prev) => [
        ...prev,
        { type: 'user', content: `Number of stages: ${stages}` },
        { 
          type: 'bot', 
          content: `Please fill in the details for all ${stages} production stages:`, 
          component: 'multi-production-stages', 
          props: { stagesCount: stages } 
        }
      ]);
      setIsSelectingStages(false); // Move to next phase after button click
    };
    document.addEventListener('select', handleSelectStages);
    return () => document.removeEventListener('select', handleSelectStages);
  }, []);

  useEffect(() => {
    const handleStageComplete = (e) => {
      const stageData = e.detail;
      const updatedStagesData = [...stagesData];
      const completedStage = parseInt(e.target.getAttribute('stage-index'));
      updatedStagesData[completedStage] = stageData;
      setStagesData(updatedStagesData);

      // Update stage data without showing individual success messages
      const allFieldsFilled = updatedStagesData.length === stagesCount && 
        updatedStagesData.every(stage => stage && 
          stage.rawGoods.length > 0 && 
          stage.outputGoods.length > 0 && 
          stage.middleFields.time && 
          stage.middleFields.outsource &&
          stage.rawGoods.every(g => g.name && g.qty && g.dimension) &&
          stage.outputGoods.every(g => g.name && g.qty && g.dimension));

      if (allFieldsFilled) {
        // All fields are filled, show the submit button
        const submitMessage = messages.find(m => m.content === 'You can now submit the complete workflow.');
        if (!submitMessage) {
          setMessages((prev) => [
            ...prev,
            { type: 'bot', content: 'You can now submit the complete workflow.' }
          ]);
        }
      }
    };
    document.addEventListener('complete', handleStageComplete);
    return () => document.removeEventListener('complete', handleStageComplete);
  }, [stagesCount, stagesData]);

  useEffect(() => {
    const handleWorkflowSubmit = () => {
      setMessages((prev) => [
        ...prev,
        { type: 'user', content: 'Workflow submitted.' },
        { type: 'bot', content: 'Here is your final production workflow summary:', component: 'production-summary', props: { stages: JSON.stringify(stagesData) } }
      ]);
    };

    document.addEventListener('workflow-final-submitted', handleWorkflowSubmit);
    return () => document.removeEventListener('workflow-final-submitted', handleWorkflowSubmit);
  }, [stagesData]);

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
      setIsSelectingStages(true);
    };
    document.addEventListener('reset', handleReset);
    return () => document.removeEventListener('reset', handleReset);
  }, []);

  const toggleEnlarge = () => {
    setIsEnlarged(!isEnlarged);
  };

  // Render all stages at once for multi-stage entry
  const renderComponent = (component, props) => {
    switch (component) {
      case 'stage-selector':
        return <stage-selector {...props} />;
      case 'production-stage':
        return <production-stage {...props} />;
      case 'multi-production-stages':
        return (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '32px',
            maxHeight: isEnlarged ? 'calc(100vh - 200px)' : '400px',
            overflowY: 'auto',
            padding: '16px'
          }}>
            {Array.from({ length: props.stagesCount }).map((_, idx) => (
              <div 
                key={idx} 
                style={{ 
                  border: '1px solid #88bfe8', 
                  borderRadius: 8, 
                  background: '#fff', 
                  boxShadow: '0 2px 8px rgba(136,191,232,0.08)',
                  padding: '24px',
                  position: 'relative'
                }}
              >
                <div style={{ 
                  padding: '16px', 
                  fontWeight: 700, 
                  color: '#340368', 
                  fontFamily: 'Caveat, cursive', 
                  fontSize: '1.2rem',
                  textAlign: 'center',
                  borderBottom: '1px solid #88bfe8',
                  marginBottom: '16px'
                }}>
                  Production Stage {idx + 1}
                </div>
                <production-stage
                  stage-index={idx}
                  stage-count={props.stagesCount}
                  initial-data={JSON.stringify(stagesData[idx] || {})}
                ></production-stage>
              </div>
            ))}
          </div>
        );
      case 'production-summary':
        return <production-summary {...props} />;
      default:
        return null;
    }
  };

  const chatHeaderStyle = {
    backgroundColor: '#ffffff', // White background
    color: '#340368', // Dark purple text
    borderBottom: '1px solid #88bfe8', // Light blue border
    padding: '10px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: isEnlarged ? '0' : '8px',
    borderTopRightRadius: isEnlarged ? '0' : '8px',
  };

  const chatBubbleStyle = {
    backgroundColor: '#ffffff', // White background
    color: '#340368', // Dark purple text
    border: '1px solid #88bfe8', // Light blue border
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
  };

  const chatInterfaceStyle = {
    width: isEnlarged ? '100vw' : '400px',
    height: isEnlarged ? '100vh' : '600px',
    position: isEnlarged ? 'fixed' : 'absolute',
    top: isEnlarged ? '0' : 'auto',
    left: isEnlarged ? '0' : 'auto',
    bottom: isEnlarged ? '0' : '20px',
    right: isEnlarged ? '0' : '20px',
    backgroundColor: '#fff',
    borderRadius: isEnlarged ? '0' : '8px',
    boxShadow: '0 2px 10px rgba(136,191,232,0.10)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
    zIndex: 1000,
  };

  const chatBodyStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    backgroundColor: '#FFFFFF',
  };

  const chatFooterStyle = {
    padding: '10px',
    backgroundColor: '#FFFFFF',
    borderTop: '1px solid #88bfe8',
    display: 'flex',
    alignItems: 'center',
  };

  const inputStyle = {
    flex: 1,
    padding: '8px',
    border: '1px solid #88bfe8',
    borderRadius: '4px',
    marginRight: '10px',
    background: '#fff',
    color: '#340368',
    // Restrict to numbers during stage selection
    ...(isSelectingStages && { pattern: '[0-9]*', inputMode: 'numeric' }),
  };

  const sendButtonStyle = {
    backgroundColor: '#88bfe8',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  };

  const closeButtonStyle = {
    backgroundColor: '#340368',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '5px 10px',
    cursor: 'pointer',
    marginLeft: '10px',
    transition: 'background 0.2s',
  };

  const enlargeButtonStyle = {
    backgroundColor: '#88bfe8',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '5px 10px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  };

  const submitWorkflowButtonStyle = {
    backgroundColor: '#88bfe8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 20px',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '20px',
    width: '100%',
    transition: 'background-color 0.3s',
  };

  const handleWorkflowSubmit = () => {
    // Validate all stages before submission
    if (stagesData.length === stagesCount && 
        stagesData.every(stage => stage && 
          stage.rawGoods.length > 0 && 
          stage.outputGoods.length > 0 && 
          stage.middleFields.time && 
          stage.middleFields.outsource &&
          stage.rawGoods.every(g => g.name && g.qty && g.dimension) &&
          stage.outputGoods.every(g => g.name && g.qty && g.dimension))) {
      
      // First remove any existing summary
      setMessages(prev => prev.filter(m => m.component !== 'production-summary'));
      
      // Then add the new summary
      setMessages((prev) => [
        ...prev,
        { type: 'user', content: 'Workflow submitted successfully.' },
        { 
          type: 'bot', 
          content: 'Here is your Production Workflow Summary:', 
          component: 'production-summary', 
          props: { stages: JSON.stringify(stagesData) } 
        }
      ]);

      // Scroll to the summary after a short delay
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);

    } else {
      setMessages((prev) => [
        ...prev,
        { type: 'bot', content: 'Please fill in all required fields in all stages before submitting.' }
      ]);
    }
  };

  return (
    <div className="chat-container">
      <button
        onClick={toggleChat}
        className="chat-bubble"
        aria-label="Toggle chat"
        style={chatBubbleStyle}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {isOpen && (
        <div className={`chat-interface ${isEnlarged ? 'enlarged' : ''}`} style={chatInterfaceStyle}>
          <div className="chat-header" style={chatHeaderStyle}>
            <h3>Customer Support</h3>
            {isLoggedIn && userDetails && (
              <div className="user-info">
                <User size={16} className="mr-1" />
                {userDetails.email}
              </div>
            )}
            <div>
              <button
                onClick={toggleEnlarge}
                className="enlarge-button"
                aria-label="Toggle enlarge"
                style={enlargeButtonStyle}
              >
                {isEnlarged ? 'Minimize' : 'Enlarge'}
              </button>
              <button
                onClick={handleClose}
                className="close-button"
                aria-label="Close chat"
                style={closeButtonStyle}
              >
                Close
              </button>
            </div>
          </div>

          <div className="chat-body" style={chatBodyStyle}>
            {showLoginForm ? (
              <LoginForm onLogin={handleLogin} />
            ) : (
              <>
                {messages.map((message, index) => (
                  <div key={index} className={`chat-message ${message.type === 'user' ? 'user' : 'bot'}`}>
                    <div className="bubble" style={{ backgroundColor: '#fff', color: '#340368', border: '1px solid #88bfe8' }}>
                      {message.content}
                    </div>
                    {message.component && (
                      <div className="mt-2">
                        {renderComponent(message.component, message.props)}
                      </div>
                    )}
                  </div>
                ))}
                {/* Show submit button after all stages are filled (all fields non-empty) */}
                {stagesCount > 0 &&
                  messages.some(m => m.component === 'multi-production-stages') &&
                  stagesData.length === stagesCount &&
                  stagesData.every(stage =>
                    stage &&
                    Array.isArray(stage.rawGoods) && stage.rawGoods.length > 0 && stage.rawGoods.every(g => g.name && g.qty && g.dimension) &&
                    Array.isArray(stage.outputGoods) && stage.outputGoods.length > 0 && stage.outputGoods.every(g => g.name && g.qty && g.dimension) &&
                    stage.middleFields && stage.middleFields.time && stage.middleFields.outsource
                  ) &&
                  !messages.some(m => m.content === 'Workflow submitted.') && (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                      <button
                        onClick={handleWorkflowSubmit}
                        style={submitWorkflowButtonStyle}
                        className="submit-workflow-button"
                      >
                        Submit Workflow
                      </button>
                    </div>
                  )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {isLoggedIn && (
            <div className="chat-footer" style={chatFooterStyle}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..."
                style={inputStyle}
                disabled={!isLoggedIn || isSelectingStages}
              />
              <button onClick={handleSendMessage} style={sendButtonStyle} disabled={!isLoggedIn || isSelectingStages}>
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

  const loginFormStyle = {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(136,191,232,0.10)',
    border: '1px solid #88bfe8',
  };

  const inputFieldStyle = {
    width: '100%',
    padding: '8px',
    marginBottom: '10px',
    border: '1px solid #88bfe8',
    borderRadius: '4px',
    background: '#fff',
    color: '#340368',
  };

  const loginButtonStyle = {
    backgroundColor: '#88bfe8',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  };

  return (
    <div className="login-form" style={loginFormStyle}>
      <h3 style={{ color: '#340368' }}>Login to Chat</h3>
      <div>
        <div>
          <label style={{ color: '#340368' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputFieldStyle}
          />
        </div>
        <div>
          <label style={{ color: '#340368' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputFieldStyle}
          />
        </div>
        <button onClick={handleSubmit} style={loginButtonStyle}>Login</button>
      </div>
    </div>
  );
}