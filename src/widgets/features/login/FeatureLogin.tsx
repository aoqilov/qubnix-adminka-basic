import { useTranslation } from "react-i18next";
import { CusCardbox } from "@/components/ui/cardbox/CusCardbox";
import { QubnixLogoIntro } from "@/components/shared/enter-logo-page/EnterLogoPage";
import { useUiStore } from "@/store/ui.store";
import { LoginForm } from "./components/LoginForm";

/** Sessiya yo'q bo'lsa AppRoutes butun router o'rniga shuni ko'rsatadi. */
export default function FeatureLogin() {
  const { t } = useTranslation();
  const logoTheme = useUiStore((s) => (s.isDarkMode ? "dark" : "light"));

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <CusCardbox className="w-full max-w-sm rounded-modal p-6 shadow-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <QubnixLogoIntro animated={false} theme={logoTheme} className="w-40" />
          <p className="mt-2 text-sm leading-relaxed text-secondary">{t("auth.subtitle")}</p>
        </div>

        <LoginForm />
      </CusCardbox>
    </div>
  );
}
