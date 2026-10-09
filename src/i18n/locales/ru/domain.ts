// Domen qiymatlari (types/domain.ts) uchun nomlar. Tarif nomlari (Start, Pro, Business) — brend
// va admin tomonidan kiritiladi, tarjima qilinmaydi.
const domain = {
  subscriptionStatus: {
    active: "Активна",
    expired: "Истекла",
    cancelled: "Отменена",
  },
  orderStatus: {
    created: "Создан",
    pending: "В обработке",
    paid: "Оплачен",
    cancelled: "Отменён",
    failed: "Ошибка",
  },
  orderPurpose: {
    create_organization: "Новая компания",
    renew_subscription: "Продление",
  },
  duration: "{{count}} мес.",
  statsDepth: {
    today: "за сегодня",
    "3months": "за 3 месяца",
    full: "вся история",
  },
};

export default domain;
