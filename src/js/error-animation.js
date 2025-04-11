// Рандомные заголовки и сообщения
const titles = [
    "ОШИБКА: КОТ НАСТРОЙКИ",
    "ДОСТУП ЗАПРЕЩЁН",
    "ТЫ НЕ ПРОЙДЁШЬ",
    "ЗДЕСЬ БЫЛ ВАСЯ"
  ];

  const messages = [
    'Погадите, практикум ломает мне мозг',
    'Ревьюер, не топи, все мы люди ',
    "Ошибка 404: страница эмигрировала в метавселенную."
  ];

  // Установка рандомного заголовка и сообщения
  document.getElementById('random-title').textContent = titles[Math.floor(Math.random() * titles.length)];
  document.getElementById('random-message').textContent = messages[Math.floor(Math.random() * messages.length)];

  // Анимация цифр
  document.querySelectorAll('.digit').forEach((digit, index) => {
    digit.style.opacity = '0';
    digit.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      digit.style.opacity = '1';
      digit.style.transform = 'translateY(0)';
      // Звук печатающей клавиатуры для последней цифры
      if (index === 2) {
        const typingSound = new Audio('/assets/keyboard-typing.mp3');
        typingSound.volume = 0.3;
        typingSound.play();
      }
    }, 300 * index);
  });

