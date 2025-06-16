export const loginTemplate = `<div class="login-page">
  <div class="login-container">
    <div class="login-header">
      <h1 class="login-title" data-text="{{title}}">{{title}}</h1>
      <p class="login-subtitle">{{subtitle}}</p>
    </div>

    <form class="login-form" id="loginForm">
      {{{loginInput}}}
      {{{passwordInput}}}

      <div class="form-actions">
        {{{submitButton}}}
      </div>

      <div class="login-links">
        <a href="/password-recovery" class="neon-link">Забыли пароль?</a>
        <a href="/registration" class="neon-link">Регистрация</a>
      </div>
    </form>

    <div class="login-social">
      <p class="social-title">ИЛИ ВОЙТИ ЧЕРЕЗ:</p>
      <div class="social-buttons">
        {{{googleButton}}}
        {{{githubButton}}}
      </div>
    </div>
  </div>
</div>`;
