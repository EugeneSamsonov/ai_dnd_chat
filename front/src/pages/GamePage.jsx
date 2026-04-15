import ChatContainer from "../features/chat/ChatContainer";

import "../features/chat/GamePage.css";

const GamePage = () => {
  return (
    <div className="game-page-layout">
      <aside className="sidebar">
        {/* Тут будут статы персонажа или список игроков */}
        <h3>Игроки</h3>
      </aside>

      <section className="chat-section">
        <ChatContainer />
      </section>
    </div>
  );
};

export default GamePage;
