import React, { useRef, useState } from 'react';
import Chatbot, { ChatbotInterface } from './Chatbot';
import { getChatOptions } from '../config/chatOptions';
import styles from './ChatbotContainer.module.css';
import { closeIcon, refreshIcon, bubbleTipIcon } from './icon/svgIcons';

const ChatbotContainer: React.FC = () => {
  const options = getChatOptions()

  const [isChatBoxVisible, setIsChatBoxVisible] = useState(window.CHATBOT_CONFIG.displayByDefault || false);
  const chatRef = useRef(null);

  const toggleChatBox = () => {    
    setIsChatBoxVisible(!isChatBoxVisible);
  };

  const onClickRefresh = () => {
    (chatRef.current as unknown as ChatbotInterface).resetConversation();
    sessionStorage.removeItem('chatSessionId');
  };

  return (
    <>
      {/* 气泡提示 */}
      <div
        className={'webchat-bubble-tip ' + styles.bubbleTip}
        onClick={toggleChatBox}
      >
         {bubbleTipIcon}
      </div>

      {/* 聊天框容器 */}
      <div

        className={`webchat-container ${styles.chatBoxContainer} ${isChatBoxVisible ? styles.chatBoxVisible : ''}`} // 动态添加显示状态的类
      >
        <div className={'webchat-container-toolbar ' + styles.toolbar}>
          <div className={'webchat-logo-container ' + styles.webchatLogoContainer}>
            <img src="https://www.ceeg.cn/en/assets/v1/2024-9/upload/logo.svg" alt="ceeg" />
          </div>
          <button className={styles.refreshButton} onClick={onClickRefresh} >
            {refreshIcon}
          </button>
          {/* 关闭按钮 */}
          <button
            className={styles.closeButton}
            onClick={() => setIsChatBoxVisible(false)}
          >{closeIcon}</button>
        </div>
        <Chatbot ref={chatRef} />
      </div>
    </>
  );
};

export default ChatbotContainer;