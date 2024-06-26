/**
 * Generators for the table columns in the ingestion table
 */

import { useCallback, useEffect, useState } from "react";

import hyper from "@macrostrat/hyper";

import { ColumnProps, Column } from "@blueprintjs/table";
import {
  ColumnConfig,
  ColumnConfigGenerator,
  CustomTableProps,
} from "~/pages/maps/ingestion/@id/table";
import IntervalSelection, {
  Interval,
} from "~/pages/maps/ingestion/@id/components/cell/interval-selection";
import { getTableUpdate } from "~/pages/maps/ingestion/@id/table-util";
import CheckboxCell from "~/pages/maps/ingestion/@id/components/cell/checkbox-cell";
import { TableInterface } from "../edit-table";
import styles from "~/pages/maps/ingestion/@id/edit-table.module.sass";
import { COMMON_COLUMNS } from "../tables";
import { toBoolean } from "~/pages/maps/ingestion/@id/components/cell/util";

const h = hyper.styled(styles);

export default function LineStringTable({
  url,
  ingestProcessId,
}: CustomTableProps) {
  const FINAL_LINE_COLUMNS = [
    ...COMMON_COLUMNS,
    "name",
    "descrip",
    "type",
    "direction",
  ];

  const linestringColumnGenerator = useCallback(
    ({
      url,
      defaultColumnConfig,
      dataParameters,
      setTableUpdates,
      transformedData,
      data,
      ref,
    }: ColumnConfigGenerator): ColumnConfig => {
      return {
        ...defaultColumnConfig,
        omit: h(Column, {
          ...defaultColumnConfig["omit"].props,
          cellRenderer: (rowIndex: number, columnIndex: number) =>
            h(CheckboxCell, {
              ref: (el) => {
                try {
                  ref.current[rowIndex][columnIndex] = el;
                } catch (e) {}
              },
              onConfirm: (value) => {
                const tableUpdate = getTableUpdate(
                  url,
                  value,
                  "omit",
                  rowIndex,
                  transformedData,
                  dataParameters
                );

                setTableUpdates((p) => [...p, tableUpdate]);
              },
              value: toBoolean(transformedData[rowIndex]["omit"]),
            }),
        }),
      };
    },
    []
  );

  return h(TableInterface, {
    url: url,
    ingestProcessId: ingestProcessId,
    finalColumns: FINAL_LINE_COLUMNS,
    columnGenerator: linestringColumnGenerator,
  });
}
