import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  ar: {
    translation: {
      "welcome": "مرحباً بك في منصة رفيقك في طريق الوعي",
      "dashboard": "لوحة التحكم",
      "pages": "الصفحات",
      "analytics": "التحليلات",
      "tickets": "التذاكر",
      "ads": "الإعلانات",
      "settings": "الإعدادات",
      "logout": "تسجيل الخروج",
      "login": "تسجيل الدخول",
      "theme": "المظهر",
      "language": "اللغة",
      "whats_new": "لكل جديد",
      "important": "لكل مهم",
      "requests": "لكل الطلبات",
      "admin_panel": "لوحة الإدارة",
      "visitor_stats": "إحصائيات الزوار",
      "active_users": "المستخدمين النشطين",
      "total_views": "إجمالي المشاهدات",
      "geo_location": "الموقع الجغرافي",
      "device_type": "نوع الجهاز",
      "search": "بحث...",
      "save": "حفظ",
      "cancel": "إلغاء",
      "delete": "حذف",
      "edit": "تعديل",
      "add_page": "إضافة صفحة",
      "upload_media": "رفع وسائط",
      "managers_leaders": "رفيق المدراء والقادة",
      "teachers": "رفيق المعلمين",
      "students": "رفيق الطلاب",
      "parents": "رفيق أولياء الأمور"
    }
  },
  en: {
    translation: {
      "welcome": "Welcome to your Awareness Path Companion",
      "dashboard": "Dashboard",
      "pages": "Pages",
      "analytics": "Analytics",
      "tickets": "Tickets",
      "ads": "Ads",
      "settings": "Settings",
      "logout": "Logout",
      "login": "Login",
      "theme": "Theme",
      "language": "Language",
      "whats_new": "What's New",
      "important": "Important",
      "requests": "Requests",
      "admin_panel": "Admin Panel",
      "visitor_stats": "Visitor Stats",
      "active_users": "Active Users",
      "total_views": "Total Views",
      "geo_location": "Geo Location",
      "device_type": "Device Type",
      "search": "Search...",
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete",
      "edit": "Edit",
      "add_page": "Add Page",
      "upload_media": "Upload Media",
      "managers_leaders": "Managers & Leaders Companion",
      "teachers": "Teachers Companion",
      "students": "Students Companion",
      "parents": "Parents Companion"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
