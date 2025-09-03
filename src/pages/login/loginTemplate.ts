export const loginTemplate = `<div class="login-page">
  <div class="login-container">
    <div class="login-header">
      <h1 class="login-title" data-text="{{title}}">{{title}}</h1>
      <p class="login-subtitle">{{subtitle}}</p>
    </div>

    <form class="login-form" id="loginForm">
      {{> formInputGroup
        id="login"
        label="ЛОГИН"
        type="text"
        name="login"
        required=true
        placeholder="> Введите ваш логин"
        icon="user"
      }}

      {{> formInputGroup
        id="password"
        label="ПАРОЛЬ"
        type="password"
        name="password"
        required=true
        placeholder="> ********"
        icon="lock"
      }}

      <div class="form-actions">
        {{> btn text="ВОЙТИ" type="submit" pulse=true icon="login" }}
      </div>

      <div class="login-links">
        <a href="/password-recovery" class="neon-link">Забыли пароль?</a>
        <a href="/registration" class="neon-link">Регистрация</a>
      </div>
    </form>

    <div class="login-social">
      <p class="social-title">ИЛИ ВОЙТИ ЧЕРЕЗ:</p>
      <div class="social-buttons">
        {{> btn text="" type="button" icon="google" onClick="loginWithGoogle()" }}
        {{> btn text="" type="button" icon="github" onClick="loginWithGithub()" }}
      </div>
    </div>
  </div>
</div>`;
