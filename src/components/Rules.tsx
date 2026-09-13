import { Landmark, ListOrdered } from "lucide-react";
import { useLanguage } from "../localization/LanguageProvider";
export function Rules() {
  const { t } = useLanguage();
  return (
    <div className="rules-content">
      <p>{t("rulesIntro")}</p>
      <h3>
        <Landmark size={22} />
        {t("bank")}
      </h3>
      <p>{t("bankRules")}</p>
      <h3>
        <ListOrdered size={22} />
        {t("top-ten")}
      </h3>
      <p>{t("topRules")}</p>
      <div className="notice">{t("hostNote")}</div>
      <p className="muted">{t("houseNote")}</p>
    </div>
  );
}
