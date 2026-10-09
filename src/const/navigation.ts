import type { IconType } from "react-icons";
import { LuBuilding2, LuLayers, LuLayoutDashboard, LuUsers } from "react-icons/lu";

// Matn emas, i18n kalit saqlanadi — t() render vaqtida chaqiriladi.
export const NAV_GROUPS = [
  {
    labelKey: "layout.nav.groups.main",
    items: [
      { to: "/dashboard", labelKey: "layout.nav.dashboard", icon: LuLayoutDashboard },
      { to: "/tariffs", labelKey: "layout.nav.tariffs", icon: LuLayers },
      { to: "/users", labelKey: "layout.nav.users", icon: LuUsers },
      { to: "/companies", labelKey: "layout.nav.companies", icon: LuBuilding2 },
    ],
  },
] as const satisfies readonly {
  labelKey: string;
  items: readonly { to: string; labelKey: string; icon: IconType }[];
}[];
