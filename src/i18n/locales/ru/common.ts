// Butun ilovada qayta ishlatiladigan matnlar: amallar va holatlar.
// `actions`/`states` dagi kalitlarning bir qismini Cus* kit (components/ui) ishlatadi — o'chirmang.
const common = {
  actions: {
    save: "Сохранить",
    cancel: "Отмена",
    delete: "Удалить",
    edit: "Изменить",
    back: "Назад",
    next: "Далее",
    done: "Готово",
    close: "Закрыть",
    apply: "Применить",
    clear: "Очистить",
    confirm: "Подтвердить",
    retry: "Повторить",
    export: "Экспорт CSV",
  },
  states: {
    loading: "Загрузка...",
    loadError: "Не удалось загрузить данные.",
    loadErrorHint: "Проверьте соединение и попробуйте ещё раз",
    actionError: "Не удалось выполнить действие. Попробуйте ещё раз.",
    nothingFound: "Ничего не найдено",
    notFound: "Страница не найдена",
    exporting: "Экспорт...",
  },
  /** utils/apiErrorMessage.ts — HTTP status bo'yicha. */
  errors: {
    network: "Нет связи с сервером. Проверьте интернет и попробуйте ещё раз",
    badRequest: "Проверьте введённые данные",
    forbidden: "Недостаточно прав для этого действия",
    notFound: "Запись не найдена",
    conflict: "Действие невозможно",
    tooManyRequests: "Слишком много попыток. Попробуйте через несколько минут",
    server: "Сервер временно недоступен. Попробуйте позже",
  },
  currency: {
    uzs: "сум",
  },
  units: {
    /** Процентные пункты — изменение доли (конверсия, отток). */
    pp: "п.п.",
    days: "{{count}} дн.",
  },
};

export default common;
