// Проектные настройки npm run check — MIXER.
// Юридические тексты — типовые, Главред их не проверяет.
export const glavredSkip = ["/privacy-policy/", "/consent/"];
export const thinOk = ["/consent/", "/privacy-policy/"];
// Исключение на время тестовой выкладки mixer.nikalimp.ru: реквизиты ждём от клиента (requests.md §2.6).
// УБРАТЬ перед выкладкой на домен школы — там реквизиты обязательны (стандарт §11).
export const exceptions = {};
