  // Clears validation error messages when any input changes
  const clearValidationErrors = () => {
    setMessages(prev => prev.filter(m => !m.content.includes('Please fill in all required fields')));
  };
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
  const [isSelectingStages, setIsSelectingStages] = useState(true);
  const [goodsList, setGoodsList] = useState([]);
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
            content: `Please fill in the details for all ${numValue} production stages:`, 
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
      setIsSelectingStages(false);
    };
    document.addEventListener('select', handleSelectStages);
    return () => document.removeEventListener('select', handleSelectStages);
  }, []);

  useEffect(() => {
    const handleStageComplete = (e) => {
      const stageData = e.detail;
      const completedStage = parseInt(e.target.getAttribute('stage-index'));
      const updatedStagesData = [...stagesData];
      updatedStagesData[completedStage] = stageData;
      setStagesData(updatedStagesData);

      // Enhanced validation check
      const allFieldsFilled = updatedStagesData.length === stagesCount && 
        updatedStagesData.every(stage => {
          if (!stage) return false;
          
          // Check raw goods
          const validRawGoods = stage.rawGoods && 
            stage.rawGoods.length > 0 && 
            stage.rawGoods.every(g => g.name && g.name.trim() && g.qty && g.dimension);
          
          // Check output goods
          const validOutputGoods = stage.outputGoods && 
            stage.outputGoods.length > 0 && 
            stage.outputGoods.every(g => g.name && g.name.trim() && g.qty && g.dimension);
          
          // Check middle fields
          const validMiddleFields = stage.middleFields && 
            stage.middleFields.time && 
            stage.middleFields.outsource &&
            stage.middleFields.wastageEntries &&
            stage.middleFields.wastageEntries.every(entry => 
              (!entry.good && !entry.wastage) // Allow empty entries
              || (entry.good && entry.wastage && entry.type) // Or complete entries
            );
          
          return validRawGoods && validOutputGoods && validMiddleFields;
        });

      // Update messages based on validation state
      if (allFieldsFilled) {
        setMessages(prev => {
          // Remove any error messages
          const filteredMessages = prev.filter(m => 
            !m.content.includes('Please fill in all required fields'));
          
          // Add or update completion message
          const hasSubmitMessage = filteredMessages.some(m => 
            m.content === 'You can now submit the complete workflow.');
          
          if (!hasSubmitMessage) {
            return [...filteredMessages, 
              { type: 'bot', content: 'You can now submit the complete workflow.' }
            ];
          }
          return filteredMessages;
        });
      }
    };

    document.addEventListener('complete', handleStageComplete);
    return () => document.removeEventListener('complete', handleStageComplete);
  }, [stagesCount, stagesData, messages]);

  useEffect(() => {
    const handleSummaryEdit = () => {
      console.log('Edit workflow triggered with stagesData:', stagesData, 'stagesCount:', stagesCount);
      handleEditWorkflow();
    };

    const handleSummarySubmit = (e) => {
      let data = undefined;
      if (e && e.detail && e.detail.data) {
        try {
          data = JSON.parse(e.detail.data);
          if (data.productionStages) {
            setStagesCount(data.productionStages.length);
            setStagesData(data.productionStages.map(stage => ({
              rawGoods: stage.rawGoods,
              outputGoods: stage.outputGoods,
              middleFields: stage.middleFields
            })));
          }
        } catch (error) {
          console.error('Error parsing summary data:', error);
        }
      }
      handleFinalSubmit(data);
    };

    document.addEventListener('edit-workflow', handleSummaryEdit);
    document.addEventListener('submit-workflow', handleSummarySubmit);
    
    return () => {
      document.removeEventListener('edit-workflow', handleSummaryEdit);
      document.removeEventListener('submit-workflow', handleSummarySubmit);
    };
  }, [stagesData, stagesCount]);

  useEffect(() => {
    const handleEditStage = (e) => {
      const { index } = e.detail;
      setCurrentStage(index);
      setMessages((prev) => {
        const selectorIndex = prev.findIndex(m => m.component === 'stage-selector');
        return [
          ...prev.slice(0, selectorIndex + 2),
          { type: 'user', content: `Editing Stage ${index + 1}.` },
          { 
            type: 'bot', 
            content: `Edit details for Stage ${index + 1}:`, 
            component: 'production-stage', 
            props: { 
              'stage-index': index, 
              'stage-count': stagesCount,
              'initial-data': JSON.stringify(stagesData[index] || {}), 
              'is-last': index === stagesCount - 1 
            } 
          }
        ];
      });
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

  const handleWorkflowSubmit = () => {
    console.log('handleWorkflowSubmit called with stagesData:', stagesData);
    
    if (stagesData.length === stagesCount && 
        stagesData.every(stage => stage && 
          stage.rawGoods.length > 0 && 
          stage.outputGoods.length > 0 && 
          stage.middleFields.time && 
          stage.middleFields.outsource &&
          stage.rawGoods.every(g => g.name && g.qty && g.dimension) &&
          stage.outputGoods.every(g => g.name && g.qty && g.dimension))) {
      
      const formattedData = {
        productionStages: stagesData.map((stage, idx) => ({
          stageNumber: idx + 1,
          rawGoods: stage.rawGoods,
          middleFields: stage.middleFields,
          outputGoods: stage.outputGoods
        }))
      };
      
      // Convert to string with JSON.stringify to ensure proper serialization
      const stringifiedData = JSON.stringify(formattedData);
      console.log('Stringified data:', stringifiedData);
      
      setMessages(prev => {
        // Remove any existing production-summary components
        const filteredMessages = prev.filter(m => m.component !== 'production-summary');
        return [
          ...filteredMessages,
          { type: 'user', content: 'Workflow submitted successfully.' },
          { 
            type: 'bot', 
            content: 'Production Workflow Summary:', 
            component: 'production-summary', 
            props: { 
              data: stringifiedData,
              stages: stringifiedData, // Pass the same data to both props
              showedit: true,
              showsubmit: true
            } 
          }
        ];
      });

      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      setMessages(prev => [
        ...prev,
        { type: 'bot', content: 'Please fill in all required fields in all stages before submitting.' }
      ]);
    }
  };

  const handleEditWorkflow = () => {
    console.log('handleEditWorkflow called with', { stagesCount, stagesData });
    if (stagesData.length > 0) {
      setMessages(prev => {
        // Filter out previous edit/summary messages
        const baseMessages = prev.filter(m => !['multi-production-stages', 'production-summary'].includes(m.component));
        return [
          ...baseMessages,
          {
            type: 'bot',
            content: `Edit Production Workflow (${stagesData.length} stages):`,
            component: 'multi-production-stages',
            props: { 
              stagesCount: stagesData.length,
              'initial-data': JSON.stringify(stagesData)
            }
          }
        ];
      });
    } else {
      console.warn('No stages data available for editing');
    }
  };

  const handleFinalSubmit = async (dataFromSummary) => {
    let formattedData;
    if (dataFromSummary) {
      formattedData = dataFromSummary;
    } else {
      formattedData = {
        productionStages: stagesData.map((stage, idx) => ({
          stageNumber: idx + 1,
          rawGoods: stage.rawGoods.map(good => ({
            name: good.name || 'Unknown Good',
            qty: good.qty || '0',
            dimension: good.dimension || 'N/A'
          })),
          middleFields: {
            wastageEntries: stage.middleFields.wastageEntries
              .filter(entry => entry.good && entry.wastage)
              .map(entry => ({
                good: entry.good || 'Unknown Good',
                wastage: entry.wastage || '0',
                type: entry.type || 'percent'
              })),
            time: stage.middleFields.time || 'N/A',
            outsource: stage.middleFields.outsource || 'no'
          },
          outputGoods: stage.outputGoods.map(good => ({
            name: good.name || 'Unknown Good',
            qty: good.qty || '0',
            dimension: good.dimension || 'N/A'
          }))
        }))
      };
    }
    
    try {
      const response = await fetch('http://localhost:8000/api/workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formattedData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Backend response:', result);
      
      setMessages(prev => [
        ...prev,
        { type: 'bot', content: 'Workflow has been successfully submitted to the backend.' }
      ]);
    } catch (error) {
      console.error('Error submitting to backend:', error);
      setMessages(prev => [
        ...prev,
        { type: 'bot', content: `Error submitting workflow to backend: ${error.message}. Please try again.` }
      ]);
    }
  };

  const handleStageDataChange = (stageIndex, newData) => {
    const updatedStagesData = [...stagesData];
    updatedStagesData[stageIndex] = newData;
    setStagesData(updatedStagesData);
    
    // Clear any validation error messages
    setMessages(prev => prev.filter(m => 
      !m.content.includes('Please fill in all required fields')));
  };

  const renderComponent = (component, props) => {
    switch (component) {
      case 'stage-selector':
        return <stage-selector {...props} />;
      case 'production-stage':
        return <production-stage {...props} onInput={clearValidationErrors} />;
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
                  goods-list={JSON.stringify(goodsList)}
                  initial-data={JSON.stringify((props['initial-data'] ? JSON.parse(props['initial-data'])[idx] : {}) || {})}
                  onInput={clearValidationErrors}
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
    backgroundColor: '#ffffff',
    color: '#340368',
    borderBottom: '1px solid #88bfe8',
    padding: '10px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: isEnlarged ? '0' : '8px',
    borderTopRightRadius: isEnlarged ? '0' : '8px',
  };

  const chatBubbleStyle = {
    backgroundColor: '#ffffff',
    color: '#340368',
    border: '1px solid #88bfe8',
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
    width: isEnlarged ? '80%' : '400px',
    height: isEnlarged ? '80vh' : '600px',
    position: 'fixed',
    top: isEnlarged ? '10vh' : 'auto',
    left: isEnlarged ? '10%' : 'auto',
    bottom: isEnlarged ? 'auto' : '20px',
    right: isEnlarged ? 'auto' : '20px',
    backgroundColor: '#fff',
    borderRadius: isEnlarged ? '0' : '8px',
    boxShadow: '0 2px 10px rgba(136,191,232,0.10)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
    zIndex: 1000,
  };

  const messageContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  };

  const messageStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    maxWidth: '80%',
  };

  const avatarStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const bubbleStyle = type => ({
    padding: '12px 16px',
    borderRadius: '12px',
    backgroundColor: type === 'user' ? '#340368' : '#88bfe8',
    color: '#ffffff',
    maxWidth: '100%',
    wordWrap: 'break-word',
  });

  const componentContainerStyle = {
    marginTop: '8px',
    padding: '12px',
    backgroundColor: '#ffffff',
    border: '1px solid #88bfe8',
    borderRadius: '8px',
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

  useEffect(() => {
    const handleGoodsListUpdate = (e) => {
      const newGoodsList = e.detail.goodsList;
      setGoodsList(newGoodsList);
    };

    document.addEventListener('goods-list-update', handleGoodsListUpdate);
    return () => document.removeEventListener('goods-list-update', handleGoodsListUpdate);
  }, []);

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
                <div style={messageContainerStyle}>
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      style={{
                        ...messageStyle,
                        alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start',
                      }}
                    >
                      {message.type === 'bot' && (
                        <div style={{ ...avatarStyle, backgroundColor: '#88bfe8' }}>
                          <MessageSquare size={20} color="#ffffff" />
                        </div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={bubbleStyle(message.type)}>
                          {message.content}
                        </div>
                        {message.component && (
                          <div style={componentContainerStyle}>
                            {renderComponent(message.component, message.props)}
                          </div>
                        )}
                      </div>
                      {message.type === 'user' && (
                        <div style={{ ...avatarStyle, backgroundColor: '#340368' }}>
                          <User size={20} color="#ffffff" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {stagesCount > 0 &&
                  messages.some(m => m.component === 'multi-production-stages') &&
                  stagesData.length === stagesCount &&
                  stagesData.every(stage =>
                    stage &&
                    Array.isArray(stage.rawGoods) && stage.rawGoods.length > 0 && stage.rawGoods.every(g => g.name && g.qty && g.dimension) &&
                    Array.isArray(stage.outputGoods) && stage.outputGoods.length > 0 && stage.outputGoods.every(g => g.name && g.qty && g.dimension) &&
                    stage.middleFields && stage.middleFields.time && stage.middleFields.outsource
                  ) &&
                  !messages.some(m => 
                    m.content.includes('Please fill in all required fields') || 
                    m.component === 'production-summary'
                  ) && (
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