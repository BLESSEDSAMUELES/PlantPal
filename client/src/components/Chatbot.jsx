import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
    MainContainer, ChatContainer, MessageList, Message, MessageInput,
    TypingIndicator, Avatar, ConversationHeader, MessageSeparator
} from '@chatscope/chat-ui-kit-react';
import { Button } from 'react-bootstrap';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState([
        {
            message: "Hi! I'm PlantBot 🌱. I can see your garden! Ask me anything about your plants.",
            sentTime: "just now",
            sender: "PlantBot",
            direction: "incoming",
            position: "single"
        }
    ]);

    // Use a ref to keep track of the chat window to scroll to bottom
    const messageListRef = useRef(null);

    const handleSend = async (messageText) => {
        // 1. Immediately show the user's message
        const newUserMsg = {
            message: messageText,
            direction: "outgoing",
            sender: "user",
            position: "single"
        };
        setMessages(prevMessages => [...prevMessages, newUserMsg]);
        setIsTyping(true);

        try {
            // 2. Make the actual API call to your Groq backend
            const res = await axios.post('/api/chat', { message: messageText });

            // 3. Create the bot's response message
            const newBotMsg = {
                message: res.data.reply,
                direction: "incoming",
                sender: "PlantBot",
                position: "single"
            };

            // 4. Add bot response to state
            setMessages(prevMessages => [...prevMessages, newBotMsg]);

        } catch (error) {
            // 5. Handle connection errors gracefully
            const errorMsg = {
                message: "⚠️ Sorry, I'm having trouble reaching the server right now. Please try again later.",
                direction: "incoming",
                sender: "PlantBot",
                position: "single"
            };
            setMessages(prevMessages => [...prevMessages, errorMsg]);
            console.error("Chatbot Error:", error);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <Button
                variant="success"
                onClick={() => setIsOpen(!isOpen)}
                className="shadow-lg"
                style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    zIndex: 1050, // Ensure it's above other elements
                    borderRadius: '50%',
                    width: '65px',
                    height: '65px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '30px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #28a745, #218838)'
                }}
            >
                {isOpen ? '✕' : '🌿'}
            </Button>

            {/* Chat Window Container */}
            <div
                className="shadow-lg"
                style={{
                    display: isOpen ? 'flex' : 'none',
                    position: 'fixed',
                    bottom: '110px',
                    right: '30px',
                    zIndex: 1050,
                    height: '550px',
                    width: '380px',
                    maxHeight: 'calc(100vh - 150px)', // Prevent going off-screen on small devices
                    maxWidth: 'calc(100vw - 60px)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    flexDirection: 'column',
                    border: '1px solid rgba(0,0,0,0.1)'
                }}
            >
                <MainContainer responsive>
                    <ChatContainer>
                        {/* Header with Bot Info */}
                        <ConversationHeader>
                            <Avatar src="https://cdn-icons-png.flaticon.com/512/4150/4150719.png" name="PlantBot" status="available" />
                            <ConversationHeader.Content
                                userName="PlantBot AI"
                                info="Powered by Groq Llama 3"
                            />
                        </ConversationHeader>

                        {/* Message List Area */}
                        <MessageList
                            ref={messageListRef}
                            typingIndicator={isTyping ? <TypingIndicator content="PlantBot is thinking..." /> : null}
                        >
                            <MessageSeparator content="Today" />
                            {messages.map((msg, i) => (
                                <Message key={i} model={msg}>
                                    {msg.sender === "PlantBot" && <Avatar src="https://cdn-icons-png.flaticon.com/512/4150/4150719.png" name="PlantBot" />}
                                </Message>
                            ))}
                        </MessageList>

                        {/* Input Area */}
                        <MessageInput
                            placeholder="Ask about your garden..."
                            onSend={handleSend}
                            attachButton={false}
                            autoFocus
                        />
                    </ChatContainer>
                </MainContainer>
            </div>
        </>
    );
};

export default Chatbot; 