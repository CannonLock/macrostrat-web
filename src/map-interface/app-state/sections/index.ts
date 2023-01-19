import { combineReducers } from "redux";
import reduceReducers from "reduce-reducers";
import { createBrowserHistory, Location } from "history";
import { CoreAction } from "./core/actions";
import { coreReducer, CoreState } from "./core";
import { MapAction } from "./map";
import { contextPanelIsOpen } from "../nav-hooks";
import { createRouterReducer } from "@lagunovsky/redux-react-router";
import {
  ReduxRouterState,
  RouterActions,
} from "@lagunovsky/redux-react-router";

export const browserHistory = createBrowserHistory();

export type AppState = {
  core: CoreState;
  router: ReduxRouterState;
};

const routerReducer = createRouterReducer(browserHistory);

const reducers = combineReducers({
  router: routerReducer,
  core: coreReducer,
});

function overallReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "@@router/ON_LOCATION_CHANGED": {
      console.log(action.payload.location);
      const { pathname } = action.payload.location;
      const isOpen = contextPanelIsOpen(pathname);
      return {
        ...state,
        core: { ...state.core, menuOpen: isOpen, contextPanelOpen: isOpen },
      };
    }
    case "got-initial-map-state":
      console.log(state.router);
      const { pathname } = state.router.location;
      const isOpen = contextPanelIsOpen(pathname);

      return {
        ...state,
        core: {
          ...state.core,
          ...action.data,
          menuOpen: isOpen,
          contextPanelOpen: isOpen,
        },
      };
    case "map-moved":
      return {
        ...state,
        core: {
          ...state.core,
          ...action.data,
        },
      };
    default:
      return state;
  }
}

const appReducer = reduceReducers(overallReducer, reducers);

export type Action = CoreAction | MapAction | RouterActions;

export default appReducer;
export * from "./core";
export * from "./map";
