import { createContext, useContext, useState, useEffect } from "react";

const dict = {
  en: {
    explore: "Explore", atlas: "Atlas", planner: "Planner", companion: "Companion", taste: "Taste", passport: "Passport",
    signIn: "Sign In", signOut: "Sign Out", begin: "Begin",
    heroTitle1: "Travel through", heroTitle2: "the", heroTitle3: "worlds", heroTitle4: "that", heroTitle5: "inspired your", heroTitle6: "favorite", heroTitle7: "anime.",
    beginJourney: "Begin Journey", exploreAtlas: "Explore Atlas",
    saveTrip: "Save Trip", shareTrip: "Share Trip", copied: "Link copied!"
  },
  jp: {
    explore: "巡礼", atlas: "地図", planner: "計画", companion: "同行", taste: "食祭", passport: "手帳",
    signIn: "サインイン", signOut: "サインアウト", begin: "はじめる",
    heroTitle1: "あなたの", heroTitle2: "好きな", heroTitle3: "アニメ", heroTitle4: "が", heroTitle5: "生まれた", heroTitle6: "世界を", heroTitle7: "旅しよう。",
    beginJourney: "旅を始める", exploreAtlas: "地図を見る",
    saveTrip: "旅を保存", shareTrip: "旅を共有", copied: "リンクをコピー"
  }
};

const I18nCtx = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem("aj_lang") || "en");
  useEffect(() => { localStorage.setItem("aj_lang", lang); }, [lang]);
  const t = (k) => dict[lang][k] || dict.en[k] || k;
  return <I18nCtx.Provider value={{ lang, setLang, t }}>{children}</I18nCtx.Provider>;
}

export const useI18n = () => useContext(I18nCtx);
