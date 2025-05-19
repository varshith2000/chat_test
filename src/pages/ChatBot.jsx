import React from 'react';
import ChatInterface from '../components/Chat_Compnents';

const Home = () => {
  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-8 text-3xl font-bold text-center">Welcome</h1>
      <div className="chat-container">
        <ChatInterface />
      </div>
    </div>
  );
};

export default Home; 