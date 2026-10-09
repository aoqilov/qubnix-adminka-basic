// Mock ma'lumot uchun ismlar. Tarjima qilinmaydi — bu "ma'lumot", interfeys matni emas.

export const MALE_FIRST_NAMES = [
  "Aziz", "Jasur", "Sardor", "Bekzod", "Otabek", "Shahzod", "Rustam", "Umid", "Sherzod", "Akmal",
  "Dilshod", "Jamshid", "Farhod", "Anvar", "Timur", "Nodir", "Sanjar", "Eldor", "Ulugbek", "Behruz",
] as const;

export const FEMALE_FIRST_NAMES = [
  "Dilnoza", "Madina", "Nodira", "Malika", "Zilola", "Feruza", "Kamola", "Gulnora", "Lola", "Shahnoza",
  "Muhayyo", "Nigora", "Sevara", "Hilola", "Barno", "Mohira", "Zarina", "Iroda", "Sitora", "Laylo",
] as const;

/** Familiya o'zagi: erkaklar uchun `-ov`, ayollar uchun `-ova`. */
export const LAST_NAME_STEMS = [
  "Karim", "Rahim", "Tursun", "Aliyev", "Yusuf", "Abdulla", "Nazar", "Saidov", "Ergash", "Mirzo",
  "Hamid", "Normat", "Qodir", "Sobir", "Ismoil", "Botir", "Komil", "Nurmat", "Olim", "Rasul",
] as const;

export const COMPANY_PREFIXES = [
  "Silk", "Registon", "Amir", "Navoi", "Bukhara", "Samarkand", "Tashkent", "Fergana", "Orient", "Mega",
  "Smart", "Prime", "Alfa", "Nova", "Zebo", "Baraka", "Oltin", "Yangi", "Chinor", "Sarvar",
] as const;

export const COMPANY_SUFFIXES = [
  "Logistics", "Trading", "Group", "Tech", "Build", "Agro", "Media", "Textile", "Consulting", "Pharm",
  "Foods", "Studio",
] as const;

export const TELEGRAM_USERNAME_SUFFIXES = ["", "_uz", "01", "_official", "88", "_pro"] as const;
