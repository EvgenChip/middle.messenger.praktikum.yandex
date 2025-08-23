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
`;