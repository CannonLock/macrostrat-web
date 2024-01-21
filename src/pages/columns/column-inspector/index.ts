import {
  UnitSelectionProvider,
  useSelectedUnit,
  useUnitSelectionDispatch,
} from "@macrostrat/column-views";
import { hyperStyled } from "@macrostrat/hyper";
import { getHashString, setHashString } from "@macrostrat/ui-components";
import { useEffect, useRef } from "react";

import { Column } from "@macrostrat/column-views";
import { PatternProvider } from "~/_providers";
import styles from "./column-inspector.module.styl";
import ModalUnitPanel from "./modal-panel";

const h = hyperStyled(styles);

function ColumnPage({ columnInfo }) {
  const { units } = columnInfo;

  useUnitSelection(units);

  return h("div.column-ui", [
    h("div.left-column", [
      h("div.column-view", [
        h("h1", columnInfo.col_name),
        h("p.column-details", [
          h("span.column-id", ["#", columnInfo.col_id]),
          ", ",
          h("span.project", ["project ", columnInfo.project_id]),
        ]),
        h(Column, {
          data: units,
          unconformityLabels: true,
          columnWidth: 250,
          width: 500,
          unitComponentProps: {
            nColumns: 3,
          },
        }),
      ]),
    ]),
    h("div.right-column", [
      // h.if(selectedUnit == null)(ColumnNavigatorMap, {
      //   className: "column-map",
      //   currentColumn: columnFeature,
      //   setCurrentColumn,
      //   margin: 10,
      //   ...projectParams,
      // }),
      h(ModalUnitPanel, { unitData: units }),
    ]),
  ]);
}

export default function ColumnInspector({ columnInfo }) {
  return h(
    UnitSelectionProvider,
    h(PatternProvider, h(ColumnPage, { columnInfo }))
  );
}

function useUnitSelection(units) {
  /* Harmonize selected unit and column data providers
    TODO: we could link the providers for selecting units and columns,
    but for now we have just nested together current separate state elements
  */

  const initializedRef = useRef(false);
  const initialized = initializedRef.current;

  // TODO: this API should probably be moved into the column itself. We shouldn't need
  // to use a context for this.
  const selectedUnit = useSelectedUnit();
  const setSelectedUnit = useUnitSelectionDispatch();

  useEffect(() => {
    // Set initial unit selection
    if (units.length == 0) return;
    if (!initialized) {
      // Harvest selected unit ID from hash string
      const unit_id =
        getHashString(document.location.hash)?.unit ?? selectedUnit?.unit_id;

      const unit = units.find((d) => d.unit_id == unit_id);
      setSelectedUnit(unit);
      initializedRef.current = true;
    } else {
      setHashString({ unit: selectedUnit?.unit_id });
      setSelectedUnit(selectedUnit);
    }
  }, [units, selectedUnit]);
}
