import hyper from "@macrostrat/hyper";
import ColumnIcon from "../components/icons/ColumnIcon";
import LineIcon from "../components/icons/LineIcon";
import ElevationIcon from "../components/icons/ElevationIcon";
import FossilIcon from "../components/icons/FossilIcon";
import BedrockIcon from "../components/icons/BedrockIcon";
import {
  Button,
  ButtonGroup,
  Alignment,
  ButtonProps,
  IconName,
  NonIdealState,
} from "@blueprintjs/core";
import { CloseableCard } from "../components/closeable-card";
import {
  useAppActions,
  useAppState,
  useSearchState,
  MapLayer,
  MapPosition,
  useHashNavigate,
} from "../app-state";
import { SearchResults } from "../components/searchbar";
import classNames from "classnames";
import styles from "./main.module.styl";
import loadable from "@loadable/component";
import UsageText from "../usage.mdx";
import { Routes, Route } from "react-router-dom";
import Changelog from "~/changelog.mdx";
import { useMatch, useLocation } from "react-router";
import { useTransition } from "transition-hook";
import { useCurrentPage } from "../app-state/nav-hooks";
import useBreadcrumbs from "use-react-router-breadcrumbs";
import { SettingsPanel, ExperimentsPanel, ThemeButton } from "./settings-panel";
import { useState, useEffect } from "react";
import { LinkButton, LayerButton, ListButton } from "../components/buttons";

function ChangelogPanel() {
  return h("div.bp4-text.text-panel", [h(Changelog)]);
}

const AboutText = loadable(() => import("../components/About"));

const h = hyper.styled(styles);

const TabButton = (props: ButtonProps & { to: string }) => {
  const { to, ...rest } = props;
  const active = useMatch(to) != null;

  return h(LinkButton, {
    minimal: true,
    active,
    to,
    ...rest,
    className: "tab-button",
  });
};

const MenuGroup = (props) =>
  h(ButtonGroup, {
    className: "menu-group",
    vertical: true,
    minimal: true,
    alignText: Alignment.LEFT,
    ...props,
  });

const LayerList = (props) => {
  const runAction = useAppActions();

  const toggleElevationChart = () => {
    runAction({ type: "toggle-menu" });
    runAction({ type: "toggle-elevation-chart" });
  };

  return h("div.menu-content", [
    h(MenuGroup, { large: true }, [
      h(LayerButton, {
        layer: MapLayer.LABELS,
        name: "Labels",
        icon: "tag",
        small: true,
      }),
      h(LayerButton, {
        name: "Bedrock",
        layer: MapLayer.BEDROCK,
        icon: BedrockIcon,
      }),
      h(LayerButton, {
        name: "Lines",
        layer: MapLayer.LINES,
        icon: LineIcon,
      }),
      h(LayerButton, {
        name: "Columns",
        layer: MapLayer.COLUMNS,
        icon: ColumnIcon,
      }),
      h(LayerButton, {
        name: "Fossils",
        layer: MapLayer.FOSSILS,
        icon: FossilIcon,
      }),
      h(LayerButton, {
        name: "Satellite",
        layer: MapLayer.SATELLITE,
        icon: "satellite",
      }),
    ]),
    h(MenuGroup, [
      h(
        ListButton,
        { onClick: toggleElevationChart, icon: ElevationIcon },
        "Elevation profile"
      ),
      h(ThemeButton),
    ]),
  ]);
};

const UsagePanel = () => h("div.text-panel", h(UsageText));

const locationTitleForRoute = {
  "/about": "About",
  "/usage": "Usage",
  "/settings": "Settings",
  "/experiments": "Experiments",
  "/layers": "Layers",
  "/changelog": "Changelog",
};

const menuBacklinkLocationOverrides = {
  "/changelog": "/about",
};

function useLastPageLocation(): { title: string; to: string } | null {
  const breadcrumbs = useBreadcrumbs();
  if (breadcrumbs.length < 2) return null;
  const prevPage = breadcrumbs[breadcrumbs.length - 2];
  const currentPage = breadcrumbs[breadcrumbs.length - 1];
  const prevRoute =
    menuBacklinkLocationOverrides[currentPage.match.pathname] ??
    prevPage.match.pathname;
  if (prevRoute == "/") return null;
  return { to: prevRoute, title: locationTitleForRoute[prevRoute] ?? "Back" };
}

function MenuHeaderButtons() {
  const backLoc = useLastPageLocation();
  const { pathname } = useLocation();

  if (backLoc != null) {
    return h([
      h(
        LinkButton,
        {
          icon: "chevron-left",
          minimal: true,
          to: backLoc.to,
        },
        backLoc.title
      ),
      h("h2.panel-title", locationTitleForRoute[pathname] ?? ""),
    ]);
  }

  return h("div.buttons", [
    h(TabButton, {
      icon: "layers",
      text: "Layers",
      to: "layers",
    }),
    h(TabButton, { icon: "settings", text: "Settings", to: "settings" }),
    h(TabButton, {
      icon: "info-sign",
      text: "About",
      to: "about",
    }),
    h(TabButton, {
      icon: "help",
      text: "Usage",
      to: "usage",
    }),
  ]);
}

function HeaderWrapper({ children, minimal = false }) {
  /* A small component that changes whether a "minimal" class is applied, but only if the item isn't hovered.
  This prevents buttons from moving around when the user is hovering over them. */
  const [isHovered, setIsHovered] = useState(false);
  const [isMinimal, setIsMinimal] = useState(minimal);
  const onMouseEnter = () => setIsHovered(true);
  const onMouseLeave = () => setIsHovered(false);
  useEffect(() => {
    if (isHovered) return;
    setIsMinimal(minimal);
  }, [minimal, isHovered]);

  const className = classNames("panel-header", { minimal: isMinimal });

  return h(
    CloseableCard.Header,
    { onMouseEnter, onMouseLeave, className },
    children
  );
}

const Menu = (props) => {
  let { className } = props;
  const { inputFocus } = useSearchState();

  const navigateHome = useHashNavigate("/");

  const pageName = useCurrentPage();
  const isNarrow = pageName == "layers" || pageName == "settings";
  const isNarrowTrans = useTransition(isNarrow, 800);

  if (inputFocus) {
    return h(SearchResults, { className });
  }

  className = classNames(
    className,
    "menu-card",
    pageName,
    { "narrow-card": isNarrowTrans.shouldMount },
    `narrow-${isNarrowTrans.stage}`
  );

  return h(
    CloseableCard,
    {
      onClose: navigateHome,
      insetContent: false,
      className,
      renderHeader: () =>
        h(HeaderWrapper, { minimal: isNarrow }, h(MenuHeaderButtons)),
    },
    [
      h(Routes, [
        h(Route, { path: "layers", element: h(LayerList) }),
        h(Route, { path: "about", element: h(AboutText) }),
        h(Route, { path: "usage", element: h(UsagePanel) }),
        h(Route, { path: "settings", element: h(SettingsPanel) }),
        h(Route, { path: "changelog", element: h(ChangelogPanel) }),
        h(Route, { path: "experiments", element: h(ExperimentsPanel) }),
        //h(Route, { path: "*", element: h(NotFoundPage) }),
      ]),
    ]
  );
};

function NotFoundPage() {
  const navigate = useHashNavigate("/");
  return h(
    "div.text-panel",
    h(NonIdealState, {
      title: "Unknown page",
      action: h(
        Button,
        {
          onClick: navigate,
          minimal: true,
          rightIcon: "chevron-right",
        },
        "Main page"
      ),
    })
  );
}

export default Menu;
