export type Language = "EN" | "FR" | "AR"

export const languages: Language[] = ["EN", "FR", "AR"]

const navLabels: Record<Language, Record<string, string>> = {
  EN: {
    Home: "Home",
    About: "About",
    Features: "Features",
    "Service Catalog": "Service Catalog",
    Contact: "Contact",
    Feedback: "Feedback",
    Suggestions: "Suggestions",
    FAQ: "FAQ",
    Search: "Search...",
    "Sign In": "Sign In",
    Dashboard: "Dashboard",
  },
  FR: {
    Home: "Accueil",
    About: "À propos",
    Features: "Fonctionnalités",
    "Service Catalog": "Catalogue",
    Contact: "Contact",
    Feedback: "Commentaires",
    Suggestions: "Suggestions",
    FAQ: "FAQ",
    Search: "Rechercher...",
    "Sign In": "Connexion",
    Dashboard: "Tableau de bord",
  },
  AR: {
    Home: "الرئيسية",
    About: "حول",
    Features: "الميزات",
    "Service Catalog": "الخدمات",
    Contact: "تواصل",
    Feedback: "ملاحظات",
    Suggestions: "اقتراحات",
    FAQ: "الأسئلة",
    Search: "بحث...",
    "Sign In": "تسجيل الدخول",
    Dashboard: "لوحة التحكم",
  },
}

export function translateNavLabel(language: Language, label: string) {
  return navLabels[language][label] ?? label
}
