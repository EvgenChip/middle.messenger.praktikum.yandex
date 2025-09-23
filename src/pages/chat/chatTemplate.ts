export const chatTemplate = `
<div class="chat-container">
  <!-- Блок списка чатов -->
  <div class="chat-list">
    <div class="chat-list-header">
      <h2>Чаты</h2>
      <button class="new-chat-button">{{> icon name="plus"}}</button>
    </div>

    <div class="chat-items">
      {{#each chats}}
        <div class="chat-item {{#if (eq this.id ../activeChatId)}}active{{/if}}" data-chat-id="{{this.id}}">
          {{> chatItem
            avatar=this.avatar
            name=this.name
            preview=this.preview
            time=this.time
            id=this.id
            unreadCount=this.unreadCount
          }}
        </div>
      {{/each}}
    </div>
  </div>

  <!-- Блок переписки -->
  <div class="chat-conversation">
    {{#if activeChat}}
      {{> conversationHeader
        avatar=activeChat.avatar
        name=activeChat.name
        status=activeChat.status
      }}

      <div class="messages-container">
        {{#each messages}}
          {{> message
            type=this.type
            content=this.content
            time=this.time
          }}
        {{/each}}
      </div>

      {{> messageInput
        placeholder="Введите сообщение..."
        onSend=handleMessageSend
      }}
    {{else}}
      <div class="no-chat-selected">
        <div class="no-chat-content">
          <h3>Выберите чат</h3>
          <p>Выберите чат из списка слева, чтобы начать переписку</p>
        </div>
      </div>
    {{/if}}
  </div>
</div>

<!-- Модальное окно создания чата -->
<div class="modal" id="createChatModal">
  <div class="modal-content">
    <h2 class="modal-title">СОЗДАТЬ НОВЫЙ ЧАТ</h2>
    <form id="createChatForm">
      <div class="input-group">
        <label class="input-group__label" for="chatTitle">
          НАЗВАНИЕ ЧАТА
          <span class="input-group__required">*</span>
        </label>
        <input
          class="input-group__input"
          type="text"
          id="chatTitle"
          name="chatTitle"
          placeholder="Введите название чата"
          required
        >
        <div class="input-group__icon">
          <svg class="icon icon--message" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path>
          </svg>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn" type="submit">
          СОЗДАТЬ
          <span class="btn__icon">plus</span>
        </button>
        <button class="btn" type="button" data-action="closeCreateChatModal">
          ОТМЕНА
        </button>
      </div>
    </form>
  </div>
</div>
`;
