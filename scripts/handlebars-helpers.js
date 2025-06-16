import Handlebars from 'handlebars';

// Регистрируем helper eq
Handlebars.registerHelper('eq', function (a: any, b: any) {
  return a === b;
});