import { render } from "./render";
import { HomePage } from "../pages/homePage/HomePage";
import { LoginPage } from "../pages/login/LoginPage";
import { RegistrationPage } from "../pages/registration/RegistrationPage";
import { ProfilePage } from "../pages/profile/ProfilePage";
import { ErrorPage } from "../pages/errorsPage/ErrorPage";

export interface Route {
  path: string;
  component: any;
  props?: any;
}

export class Router {
  private routes: Route[] = [];
  // private currentRoute: Route | null = null;

  constructor() {
    this.initRoutes();
    this.initEventListeners();
  }

  private initRoutes() {
    this.routes = [
      {
        path: "/",
        component: HomePage,
        props: {
          title: "NEON-CHAT v3.1.2",
          subtitle: "ДОБРО ПОЖАЛОВАТЬ В КИБЕРПРОСТРАНСТВО",
        },
      },
      {
        path: "/home",
        component: HomePage,
        props: {
          title: "NEON-CHAT v3.1.2",
          subtitle: "ДОБРО ПОЖАЛОВАТЬ В КИБЕРПРОСТРАНСТВО",
        },
      },
      {
        path: "/login",
        component: LoginPage,
        props: {
          title: "NEON-CHAT v3.1.2",
          subtitle: "АВТОРИЗАЦИЯ В СИСТЕМЕ",
        },
      },
      {
        path: "/registration",
        component: RegistrationPage,
        props: {
          title: "NEON-CHAT v3.1.2",
          subtitle: "СОЗДАНИЕ НОВОГО АККАУНТА",
        },
      },
      {
        path: "/profile",
        component: ProfilePage,
        props: {
          title: "ПРОФИЛЬ",
          user: {
            avatar: "/assets/avatar-default.jpg",
            email: "user@neonmail.io",
            login: "neon_user",
            firstName: "Алексей",
            lastName: "Иванов",
            displayName: "NEON_WARRIOR",
            phone: "+79001234567",
          },
        },
      },
      {
        path: "/chat",
        component: null, // Будет загружаться динамически
        props: {},
      },
      {
        path: "/404",
        component: ErrorPage,
        props: {
          errorCode: "404",
          title: "ОШИБКА: КОТ НАСТРОЙКИ",
          message: "Сервер съел ваш запрос. Буквально.",
          terminalLines: [
            "> ERROR: Путь не найден",
            "> WARNING: Кот-хакер замечен в системе",
            "> TIP: Проверьте URL или спросите кота",
          ],
        },
      },
      {
        path: "/500",
        component: ErrorPage,
        props: {
          errorCode: "500",
          title: "СЕРВЕР УПАЛ",
          message: "Наши инженеры уже бегут с кофе и паяльниками.",
          terminalLines: [
            "> CRITICAL ERROR: Сервер не отвечает",
            "> LAST ACTION: Попытка загрузить кофе",
            "> STATUS: Инженеры в пути",
          ],
        },
      },
    ];
  }

  private initEventListeners() {
    // Обработка кликов по ссылкам
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");

      if (link && link.href && link.href.startsWith(window.location.origin)) {
        e.preventDefault();
        const path = new URL(link.href).pathname;
        this.navigate(path);
      }
    });

    // Обработка навигации браузера (кнопки назад/вперед)
    window.addEventListener("popstate", () => {
      this.handleRoute(window.location.pathname);
    });
  }

  public navigate(path: string) {
    // Обновляем URL без перезагрузки страницы
    window.history.pushState({}, "", path);
    this.handleRoute(path);
  }

  private async handleRoute(path: string) {
    console.log("🔍 Navigating to:", path);

    // Ищем маршрут
    let route = this.routes.find((r) => r.path === path);

    // Если точного совпадения нет, ищем частичное
    if (!route) {
      route = this.routes.find((r) => path.startsWith(r.path));
    }

    // Если маршрут не найден, показываем 404
    if (!route) {
      route = this.routes.find((r) => r.path === "/404")!;
    }

    // Специальная обработка для чата (динамический импорт)
    if (path.includes("/chat")) {
      try {
        const { ChatPage } = await import("../pages/chat/ChatPage");
        const chatPage = new ChatPage();
        render("#app", chatPage);
        return;
      } catch (error) {
        console.error("Error importing ChatPage:", error);
        // В случае ошибки показываем 500
        route = this.routes.find((r) => r.path === "/500")!;
      }
    }

    // Рендерим компонент
    if (route && route.component) {
      const component = new route.component(route.props);
      render("#app", component);
      // this.currentRoute = route;
    }
  }

  public start() {
    // Обрабатываем текущий маршрут при запуске
    this.handleRoute(window.location.pathname);
  }
}
