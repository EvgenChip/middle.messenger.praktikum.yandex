export default function handlebarsHelpers() {
    return {
      name: 'vite-plugin-handlebars-helpers',
      transform(src, id) {
        if (id.endsWith('.hbs')) {
          return {
            code: `import Handlebars from 'handlebars';
                   Handlebars.registerHelper('ifeq', function(a, b, options) {
                     return a === b ? options.fn(this) : options.inverse(this);
                   });
                   export default Handlebars.compile(\`${src}\`);`,
            map: null
          };
        }
      }
    };
  }