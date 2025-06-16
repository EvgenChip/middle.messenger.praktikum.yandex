export const conversationHeaderTemplate = `<div class="conversation-header">
  <div class="chat-partner">
    <div class="partner-avatar">
      <img src="{{avatar}}" alt="{{name}}">
    </div>
    <div class="partner-info">
      <div class="partner-name">{{name}}</div>
      <div class="partner-status {{status}}">{{status}}</div>
    </div>
  </div>
  <button class="chat-settings">
    {{> icon name="settings"}}
  </button>
</div>`
