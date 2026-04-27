import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  vi: {
    translation: {
      "nav": {
        "home": "Trang chủ",
        "about": "Giới thiệu",
        "projects": "Dự án",
        "snippets": "Góc chia sẻ",
        "contact": "Liên hệ",
        "now": "Hiện tại",
        "feed": "Bản tin",
        "notes": "Ghi chú",
        "attendance": "Điểm danh",

        "login": "Đăng nhập",
        "profile": "Hồ sơ cá nhân",
        "logout": "Đăng xuất"
      },
      "home": {
        "hero_title": "Xin chào, tôi là",
        "hero_subtitle": "Lập trình viên Fullstack & Người yêu công nghệ",
        "hero_desc": "Tôi xây dựng những sản phẩm kỹ thuật số mượt mà, tập trung vào trải nghiệm người dùng và hiệu suất cao.",
        "view_projects": "Xem dự án",
        "contact_me": "Liên hệ tôi"
      }
    }
  },
  en: {
    translation: {
      "nav": {
        "home": "Home",
        "about": "About",
        "projects": "Projects",
        "snippets": "Snippets",
        "contact": "Contact",
        "now": "Now",
        "feed": "Feed",
        "notes": "Notes",
        "attendance": "Attendance",

        "login": "Login",
        "profile": "Profile",
        "logout": "Logout"
      },
      "home": {
        "hero_title": "Hi, I'm",
        "hero_subtitle": "Fullstack Developer & Tech Enthusiast",
        "hero_desc": "I build smooth digital products with a focus on user experience and high performance.",
        "view_projects": "View Projects",
        "contact_me": "Contact Me"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
