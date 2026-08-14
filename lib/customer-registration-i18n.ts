export const customerRegistrationCopy = {
  backToLogin: { en: "Back to Login", am: "← ወደ መግቢያ" },
  title: { en: "Customer Registration", am: "የደንበኛ መመዝገቢያ" },
  subtitle: {
    en: "Create your account to access our services",
    am: "አገልግሎታችንን ለመጠቀም መለያዎን ይፍጠሩ",
  },
  firstName: { en: "First Name", am: "ስም" },
  lastName: { en: "Last Name", am: "የአባት ስም" },
  phone: { en: "Phone Number", am: "ስልክ ቁጥር" },
  gender: { en: "Gender", am: "ጾታ" },
  language: { en: "Language", am: "ቋንቋ" },
  email: { en: "Email (Optional)", am: "ኢሜይል" },
  nationalId: { en: "National ID (Optional)", am: "መታወቂያ ቁጥር" },
  password: { en: "Password", am: "የይለፍ ቃል" },
  confirmPassword: { en: "Confirm", am: "አረጋግጥ" },
  register: { en: "Register", am: "መመዝገብ" },
  alreadyHaveAccount: { en: "Already have an account?", am: "መለያ አለዎት?" },
  signIn: { en: "Sign in", am: "ግባ" },
  placeholders: {
    firstName: { en: "Enter first name", am: "ስምዎን ያስገቡ" },
    lastName: { en: "Enter last name", am: "የአባት ስምዎን ያስገቡ" },
    phone: { en: "0911234567", am: "0911234567" },
    email: { en: "your@email.com", am: "your@email.com" },
    nationalId: { en: "Enter national ID", am: "መታወቂያ ቁጥርዎን ያስገቡ" },
    password: { en: "Min 6 characters", am: "አንድ የ 6 ቁምፊ" },
    confirmPassword: { en: "Confirm password", am: "የይለፍ ቃል አረጋግጥ" },
  },
  genderOptions: {
    MALE: { en: "Male", am: "ወንድ" },
    FEMALE: { en: "Female", am: "ሴት" },
  },
  languageOptions: {
    AM: { en: "Amharic", am: "አማርኛ" },
    EN: { en: "English", am: "English" },
  },
} as const

export function bilingualLabel(
  key: keyof Omit<
    typeof customerRegistrationCopy,
    "placeholders" | "genderOptions" | "languageOptions" | "backToLogin" | "title" | "subtitle" | "alreadyHaveAccount" | "signIn" | "register"
  >,
) {
  const item = customerRegistrationCopy[key] as { en: string; am: string }
  return `${item.en} / ${item.am}`
}

export function bilingualText(item: { en: string; am: string }) {
  return `${item.en} / ${item.am}`
}
