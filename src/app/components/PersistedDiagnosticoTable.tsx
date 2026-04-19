import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ChevronsUpDown } from "lucide-react";
import { rowRepository } from "../../db";
import {
  filterRowsBySearch,
  paginateRows,
  sortRows,
  toDataTableRows,
  type DataTableRow,
  type SortDirection,
} from "../../features/data";
import { DIAGNOSTICO_TEMPLATE_COLUMNS } from "../../types/diagnostico";
import { useUiStore } from "../../store/uiStore";

interface Props {
  datasetId: string;
}

const PER_PAGE_OPTIONS = [5, 10, 20, 50];

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  if (active) {
    return direction === "asc" ? (
      <ChevronUp className="w-[16px] h-[16px] text-[#2b2b2b]" />
    ) : (
      <ChevronDown className="w-[16px] h-[16px] text-[#2b2b2b]" />
    );
  }
  return <ChevronsUpDown className="w-[16px] h-[16px] text-[#2b2b2b]" />;
}

export function PersistedDiagnosticoTable({ datasetId }: Props) {
  const searchQuery = useUiStore((state) => state.searchQuery);
  const selectedRowIds = useUiStore((state) => state.selectedRowIds);
  const setSelectedRowIds = useUiStore((state) => state.setSelectedRowIds);
  const toggleRowSelection = useUiStore((state) => state.toggleRowSelection);

  const [loading, setLoading] = useState(true);
  const [allRows, setAllRows] = useState<DataTableRow[]>([]);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, perPage, datasetId]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    void (async () => {
      const persisted = await rowRepository.getAllByDataset(datasetId);
      if (!active) {
        return;
      }
      setAllRows(toDataTableRows(persisted));
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [datasetId]);

  const filteredRows = useMemo(
    () => filterRowsBySearch(allRows, searchQuery),
    [allRows, searchQuery],
  );
  const sortedRows = useMemo(
    () => sortRows(filteredRows, sortKey, sortDirection),
    [filteredRows, sortKey, sortDirection],
  );

  const totalRows = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / perPage));
  const safePage = Math.min(page, totalPages);
  const rows = useMemo(
    () => paginateRows(sortedRows, safePage, perPage),
    [sortedRows, safePage, perPage],
  );

  const selected = useMemo(() => new Set(selectedRowIds), [selectedRowIds]);
  const allSelected = rows.length > 0 && rows.every((row) => selected.has(row.id));

  function toggleSort(key: string) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDirection("asc");
      return;
    }

    if (sortDirection === "asc") {
      setSortDirection("desc");
      return;
    }

    if (sortDirection === "desc") {
      setSortKey(null);
      setSortDirection(null);
      return;
    }

    setSortDirection("asc");
  }

  function toggleAllRows() {
    const next = new Set(selected);
    if (allSelected) {
      rows.forEach((row) => next.delete(row.id));
    } else {
      rows.forEach((row) => next.add(row.id));
    }
    setSelectedRowIds(Array.from(next));
  }

  if (loading) {
    return (
      <div
        className="rounded-[8px] flex items-center justify-center"
        style={{ minHeight: 220, border: "1px solid #e6e6e6", background: "#fff" }}
      >
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#666" }}>
          Cargando datos...
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-[8px] overflow-hidden" style={{ border: "1px solid #d8d8d8" }}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: 980 }}>
          <thead>
            <tr style={{ background: "#f7f7f7" }}>
              <th style={{ padding: "10px 8px", borderBottom: "1px solid #dedede", width: 40 }}>
                <input type="checkbox" checked={allSelected} onChange={toggleAllRows} />
              </th>
              {DIAGNOSTICO_TEMPLATE_COLUMNS.map((column) => (
                <th
                  key={column.field}
                  onClick={() => toggleSort(column.field)}
                  style={{
                    padding: "10px 8px",
                    borderBottom: "1px solid #dedede",
                    textAlign: "left",
                    cursor: "pointer",
                    userSelect: "none",
                    minWidth: 140,
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 600,
                        fontSize: 12,
                        color: "#2b2b2b",
                      }}
                    >
                      {column.label}
                    </span>
                    <SortIcon active={sortKey === column.field} direction={sortDirection} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={DIAGNOSTICO_TEMPLATE_COLUMNS.length + 1}
                  style={{
                    padding: "20px 12px",
                    textAlign: "center",
                    color: "#666",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14,
                  }}
                >
                  No hay resultados para mostrar.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} style={{ background: selected.has(row.id) ? "#fff6ef" : "#fff" }}>
                  <td style={{ padding: "8px", borderBottom: "1px solid #f0f0f0", width: 40 }}>
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggleRowSelection(row.id)}
                    />
                  </td>
                  {DIAGNOSTICO_TEMPLATE_COLUMNS.map((column) => (
                    <td
                      key={`${row.id}-${column.field}`}
                      style={{
                        padding: "8px",
                        borderBottom: "1px solid #f0f0f0",
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 13,
                        color: "#2b2b2b",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {String(row.values[column.field] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div
        className="flex items-center justify-between"
        style={{ padding: "8px 10px", borderTop: "1px solid #dedede", background: "#fff" }}
      >
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#2b2b2b" }}>
            Filas por página
          </span>
          <select
            value={perPage}
            onChange={(event) => setPerPage(Number(event.target.value))}
            style={{ border: "1px solid #ccc", borderRadius: 6, padding: "4px 6px" }}
          >
            {PER_PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#666" }}>
            {totalRows} resultados
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={safePage <= 1}
            style={{ border: "none", background: "transparent", cursor: "pointer" }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#2b2b2b" }}>
            {safePage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            disabled={safePage >= totalPages}
            style={{ border: "none", background: "transparent", cursor: "pointer" }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
