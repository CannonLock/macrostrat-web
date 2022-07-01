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
  PanelStack2,
  Panel,
  NonIdealState,
  IconSize,
} from "@blueprintjs/core";
import { CloseableCard } from "../components/closeable-card";
import { useSelector, useDispatch } from "react-redux";
import { SettingsPanel } from "./settings-panel";
import {
  useAppActions,
  useMenuState,
  useAppState,
  useSearchState,
  MenuPanel,
  MapLayer,
  MapPosition,
} from "../app-state";
import { SearchResults } from "../components/searchbar";
import classNames from "classnames";
import styles from "./main.module.styl";
import loadable from "@loadable/component";
import UsageText from "../usage.mdx";
import { Routes, Route, useNavigate } from "react-router-dom";
import Changelog from "../../changelog.mdx";
import { useMatch, useLocation, Navigate } from "react-router";
import { useTransition } from "transition-hook";
import useBreadcrumbs from "use-react-router-breadcrumbs";

function ChangelogPanel() {
  return h("div.bp3-text.text-panel", [h(Changelog)]);
}

const AboutText = loadable(() => import("../components/About"));

const h = hyper.styled(styles);

type ListButtonProps = ButtonProps & {
  icon: React.ComponentType | IconName | React.ReactNode;
};

const ListButton = (props: ListButtonProps) => {
  let { icon, ...rest } = props;
  if (typeof props.icon != "string") {
    icon = h(props.icon, { size: 20 });
  }
  return h(Button, { ...rest, className: "list-button", icon });
};

const YourLocationButton = () => {
  const runAction = useAppActions();
  const onClick = () => {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const lngLat = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        const mapPosition: MapPosition = {
          camera: {
            altitude: 0,
            bearing: 0,
            pitch: 0,
            ...lngLat,
          },
          target: {
            zoom: 6,
            ...lngLat,
          },
        };
        runAction({
          type: "map-moved",
          data: mapPosition,
        });
      },
      (e) => {
        console.log(e);
      },
      { timeout: 100000 }
    );
  };
  return h(
    ListButton,
    { icon: "map-marker", onClick, disabled: true },
    "Your location"
  );
};

const LinkButton = (props: ButtonProps & { to: string }) => {
  const { to, ...rest } = props;
  const navigate = useNavigate();
  return h(Button, {
    ...rest,
    onClick() {
      navigate(to);
    },
  });
};

const MinimalButton = (props) => h(Button, { ...props, minimal: true });

const TabButton = (props: ButtonProps & { to: string }) => {
  const { to, ...rest } = props;
  let navigate = useNavigate();
  const active = useMatch(to) != null;

  return h(MinimalButton, {
    active,
    onClick() {
      navigate(to, { replace: false });
    },
    ...rest,
    className: "tab-button",
  });
};

type LayerButtonProps = ListButtonProps & { layer: MapLayer; name: string };

function LayerButton(props: LayerButtonProps) {
  const { layer, name, ...rest } = props;
  const active = useAppState((state) => state.core.mapLayers.has(layer));
  const runAction = useAppActions();
  const onClick = () => runAction({ type: "toggle-map-layer", layer });
  return h(ListButton, {
    active,
    onClick,
    text: name,
    ...rest,
  });
}

const MenuGroup = (props) =>
  h(ButtonGroup, {
    className: "menu-options",
    vertical: true,
    minimal: true,
    alignText: Alignment.LEFT,
    large: true,
    ...props,
  });

const LayerList = (props) => {
  const runAction = useAppActions();

  const toggleElevationChart = () => {
    runAction({ type: "toggle-menu" });
    runAction({ type: "toggle-elevation-chart" });
  };

  return h("div.menu-content", [
    h(MenuGroup, [
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
      h(YourLocationButton),
      h(
        ListButton,
        { onClick: toggleElevationChart, icon: ElevationIcon },
        "Elevation profile"
      ),
    ]),
  ]);
};

function useMainPanel(): Panel<{}> {
  const activePanel = useSelector((state) => state.menu.activePanel);
  switch (activePanel) {
    case MenuPanel.LAYERS:
      return {
        title: "Layers",
        renderPanel: () => h(LayerList),
      };
    case MenuPanel.SETTINGS:
      return {
        title: "Settings",
        renderPanel: () => h(SettingsPanel),
      };
    case MenuPanel.ABOUT:
      return {
        title: "About",
        renderPanel: () => h(AboutText),
      };
    case MenuPanel.USAGE:
      return {
        title: "Usage",
        renderPanel: () => h("div.text-panel", h(UsageText)),
      };
  }
  return null;
}

function usePanelStack() {
  const { panelStack = [] } = useMenuState();
  return [useMainPanel(), ...panelStack];
}

const UsagePanel = () => h("div.text-panel", h(UsageText));

export function usePanelOpen() {
  const match = useMatch("/");
  return match?.pathname != "/";
}

export function useContextClass() {
  const panelOpen = usePanelOpen();
  const pageName = useCurrentPage();
  if (!panelOpen) return null;
  return classNames("panel-open", pageName);
}

const useCurrentPage = () => {
  const { pathname } = useLocation();
  return pathname.slice(pathname.lastIndexOf("/") + 1, pathname.length);
};

const locationTitleForRoute = {
  "/about": "About",
  "/usage": "Usage",
  "/settings": "Settings",
  "/layers": "Layers",
};

const menuBacklinkLocationOverrides = {
  "/changelog": "/about",
};

const Menu = (props) => {
  let { className } = props;
  const runAction = useAppActions();
  const { infoDrawerOpen } = useMenuState();
  const { inputFocus } = useSearchState();
  const breadcrumbs = useBreadcrumbs();

  const navigate = useNavigate();

  const pageName = useCurrentPage();
  const isNarrow = pageName == "layers";
  const isNarrowTrans = useTransition(isNarrow, 800);

  const stack = usePanelStack();

  if (inputFocus) {
    return h(SearchResults, { className });
  }

  if (window.innerWidth <= 768 && infoDrawerOpen) {
    return null;
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
      onClose() {
        navigate("/");
      },
      insetContent: false,
      className,
      renderHeader: () =>
        h(CloseableCard.Header, [
          h.if(stack.length == 1)("div.buttons", [
            h(TabButton, {
              icon: "layers",
              text: "Layers",
              to: "layers",
            }),
            // Settings are mostly for globe, which is currently disabled
            //h(TabButton, {icon: "settings", text: "Settings", tab: MenuPanel.SETTINGS}),
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
          ]),
          h.if(stack.length > 1)([
            h(
              LinkButton,
              {
                icon: "chevron-left",
                minimal: true,
                to: "/",
              },
              stack[stack.length - 2]?.title ?? "Back"
            ),
            h("h2.panel-title", stack[stack.length - 1]?.title),
          ]),
        ]),
    },
    [
      h(Routes, [
        h(Route, { path: "layers", element: h(LayerList) }),
        h(Route, { path: "about", element: h(AboutText) }),
        h(Route, { path: "usage", element: h(UsagePanel) }),
        h(Route, { path: "changelog", element: h(ChangelogPanel) }),
        h(Route, { path: "*", element: h(NotFoundPage) }),
      ]),
      //h(Route, { path: "/settings", element: h(SettingsPanel) })
    ]
  );
};

function NotFoundPage() {
  const navigate = useNavigate();
  return h(
    "div.text-panel",
    h(NonIdealState, {
      title: "Unknown page",
      action: h(
        Button,
        {
          onClick() {
            navigate("/");
          },
          minimal: true,
          rightIcon: "chevron-right",
        },
        "Main page"
      ),
    })
  );
}

export default Menu;
