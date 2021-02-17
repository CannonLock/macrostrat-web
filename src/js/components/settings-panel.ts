// Settings panel for the map

import h from "@macrostrat/hyper";
import { GlobeSettings } from "@macrostrat/cesium-viewer/src/settings";

const SettingsPanel = (props) => {
  return h("div.settings", [h(GlobeSettings)]);
};

export { SettingsPanel };
