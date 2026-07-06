import { createContext, useContext, useState, useEffect } from "react";

const dict = {
  en: {
    // nav
    explore: "Explore", atlas: "Atlas", planner: "Planner", companion: "Companion", taste: "Taste", passport: "Passport",
    cosplay: "Cosplay", gallery: "Gallery",
    signIn: "Sign In", signOut: "Sign Out", begin: "Begin",
    // hero
    eyebrow: "SEASON 2 · READY",
    heroTitle: "Travel through the worlds that inspired your favorite anime.",
    heroSub: "A cinematic AI pilgrimage planner. Suga Shrine to Ashikaga Wisteria — every location, mapped, planned, and guided by your favorite characters.",
    beginJourney: "Begin Journey", exploreAtlas: "Explore Atlas",
    // sections
    features: "Features", companionSection: "Companion", passportSection: "Passport",
    // planner
    plannerTitle: "Craft your pilgrimage",
    plannerSub: "Pick your favorite anime. Set your budget. Claude will architect the entire journey.",
    favoriteAnime: "FAVORITE ANIME (SELECT MULTIPLE)",
    duration: "DURATION (DAYS)", budget: "BUDGET (₹)", season: "SEASON", startCity: "START CITY",
    generateItinerary: "Generate Itinerary", crafting: "Crafting...",
    saveTrip: "Save Trip", copyLink: "Copy Link", downloadPdf: "Download PDF", downloadIcs: "Add to Calendar",
    // explore
    exploreTitle: "The Anime Atlas",
    exploreSub: "Describe a feeling and let Claude discover your next series, or browse the curated library.",
    recommenderLabel: "MOOD-BASED AI RECOMMENDER",
    recommenderPlaceholder: "I want something peaceful like Frieren but with mystery...",
    recommend: "Recommend",
    // companion
    companionTitle: "Walk Japan with a voice you love",
    companionSub: "Choose your companion. They will guide you through temples, alleys and stations — in-character, powered by Claude.",
    // toasts
    copied: "Link copied!", saved: "Saved!", loading: "Loading..."
  },
  jp: {
    explore: "巡礼", atlas: "地図", planner: "計画", companion: "同行", taste: "食祭", passport: "手帳",
    cosplay: "コスプレ", gallery: "画廊",
    signIn: "サインイン", signOut: "サインアウト", begin: "はじめる",
    eyebrow: "第2期 · 準備完了",
    heroTitle: "あなたの好きなアニメが生まれた世界を旅しよう。",
    heroSub: "映画のようなAI巡礼プランナー。須賀神社からあしかがフラワーパークまで — すべての聖地を、地図に、旅程に、そしてキャラクターの声で案内します。",
    beginJourney: "旅を始める", exploreAtlas: "地図を見る",
    features: "機能", companionSection: "同行者", passportSection: "手帳",
    plannerTitle: "あなたの巡礼を計画する",
    plannerSub: "好きなアニメを選び、予算を決めて。Claudeが旅のすべてを設計します。",
    favoriteAnime: "好きなアニメ（複数選択可）",
    duration: "日数", budget: "予算 (₹)", season: "季節", startCity: "出発都市",
    generateItinerary: "旅程を生成", crafting: "作成中...",
    saveTrip: "旅を保存", copyLink: "リンクをコピー", downloadPdf: "PDFで保存", downloadIcs: "カレンダーに追加",
    exploreTitle: "アニメ図鑑",
    exploreSub: "気分を伝えれば、Claudeが次に見るべきアニメを提案します。",
    recommenderLabel: "気分から選ぶAI推薦",
    recommenderPlaceholder: "フリーレンのように穏やかで、少しミステリアスな作品が観たい...",
    recommend: "推薦する",
    companionTitle: "好きな声と一緒に日本を歩こう",
    companionSub: "同行者を選んでください。彼らがClaudeの力で、キャラクターのまま神社や路地、駅を案内します。",
    copied: "リンクをコピーしました", saved: "保存しました", loading: "読み込み中..."
  }
};

const I18nCtx = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem("aj_lang") || "en");
  useEffect(() => { localStorage.setItem("aj_lang", lang); }, [lang]);
  const t = (k) => (dict[lang] && dict[lang][k]) || dict.en[k] || k;
  return <I18nCtx.Provider value={{ lang, setLang, t }}>{children}</I18nCtx.Provider>;
}

export const useI18n = () => useContext(I18nCtx);
