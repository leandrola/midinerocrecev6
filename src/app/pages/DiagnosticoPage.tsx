import { type ChangeEvent, useEffect, useRef } from "react";
import svgPaths from "../../imports/MidinerocreceV6DeudaDeExperiencia/svg-curwnqj0xs";
import { PersistedDiagnosticoTable } from "../components/PersistedDiagnosticoTable";
import { useDatasetStore } from "../../store/datasetStore";
import { useUiStore } from "../../store/uiStore";
import { importDatasetFromXlsx, loadActiveDatasetMeta } from "../../features/import";
import { datasetRepository } from "../../db";

// ─────────────────────────────────────────────
// Search icon (Figma SVG)
// ─────────────────────────────────────────────
function SearchIconFigma() {
  return (
    <div className="relative shrink-0" style={{ width: 16, height: 16 }}>
      <div className="absolute" style={{ inset: "8.33% 4.17% 4.17% 8.33%" }}>
        <svg
          className="absolute block inset-0 size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 14 14"
        >
          <path
            clipRule="evenodd"
            d={svgPaths.p1d9df480}
            fill="#4D4D4D"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d={svgPaths.p18501e00}
            fill="#4D4D4D"
            fillRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Filter icon (Figma SVG)
// ─────────────────────────────────────────────
function FilterIconFigma() {
  return (
    <div
      className="overflow-clip relative shrink-0"
      style={{ width: 20, height: 20 }}
    >
      <div className="absolute" style={{ inset: "12.5% 4.17%" }}>
        <svg
          className="absolute block inset-0 size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 18.3333 15"
        >
          <path
            clipRule="evenodd"
            d={svgPaths.p20e38980}
            fill="#4D4D4D"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d={svgPaths.p1511f880}
            fill="#4D4D4D"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d={svgPaths.p3d445000}
            fill="#4D4D4D"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d={svgPaths.p25b5afc0}
            fill="#4D4D4D"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d={svgPaths.p3a971480}
            fill="#4D4D4D"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d={svgPaths.p20b6e700}
            fill="#4D4D4D"
            fillRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Diagnóstico Page
// ─────────────────────────────────────────────
export function DiagnosticoPage() {
  const searchQuery = useUiStore((state) => state.searchQuery);
  const setSearchQuery = useUiStore((state) => state.setSearchQuery);
  const showFilters = useUiStore((state) => state.showFilters);
  const toggleFilters = useUiStore((state) => state.toggleFilters);
  const resetUiState = useUiStore((state) => state.resetUiState);
  const setActiveDataset = useDatasetStore((state) => state.setActiveDataset);
  const isLoading = useDatasetStore((state) => state.isLoading);
  const importStatus = useDatasetStore((state) => state.importStatus);
  const startImport = useDatasetStore((state) => state.startImport);
  const setImportPhase = useDatasetStore((state) => state.setImportPhase);
  const setImportError = useDatasetStore((state) => state.setImportError);
  const completeImport = useDatasetStore((state) => state.completeImport);
  const failImport = useDatasetStore((state) => state.failImport);
  const resetImportStatus = useDatasetStore((state) => state.resetImportStatus);
  const setLoading = useDatasetStore((state) => state.setLoading);
  const datasetName = useDatasetStore(
    (state) => state.activeDataset?.name ?? "Nombre del archivo",
  );
  const activeDatasetId = useDatasetStore((state) => state.activeDataset?.id ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const activeDataset = await loadActiveDatasetMeta();
      if (!active) {
        return;
      }

      const currentDataset = useDatasetStore.getState().activeDataset;
      if (!currentDataset && activeDataset) {
        setActiveDataset(activeDataset);
      }
    })();

    return () => {
      active = false;
    };
  }, [setActiveDataset]);

  async function handleImportFileChange(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    startImport();
    try {
      const result = await importDatasetFromXlsx(file, (phase) => {
        setImportPhase(phase);
      });
      setActiveDataset(result.dataset);
      setImportError(null);
      completeImport();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo importar el archivo.";
      failImport(message);
    } finally {
      event.target.value = "";
    }
  }

  async function handleClearDiagnostico(): Promise<void> {
    setLoading(true);
    try {
      await datasetRepository.clearAll();
      setActiveDataset(null);
      resetUiState();
      resetImportStatus();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* ── Topbar ── */}
      <div
        className="absolute flex items-center gap-4 left-0 right-0 top-0"
        style={{ minHeight: 102, padding: 24, zIndex: 10 }}
      >
        <div
          className="flex-1 flex flex-col gap-1 justify-center"
          style={{ zIndex: 3 }}
        >
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: 24,
              lineHeight: "26px",
              letterSpacing: "-1.08px",
              color: "#000",
            }}
          >
            Diagnóstico de experiencia
          </p>
        </div>

        <div
          className="flex items-center gap-2 shrink-0"
          style={{ zIndex: 2 }}
        >
          <button
            type="button"
            id="btnUpload_Diagnostico"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="flex items-center justify-center rounded-[8px]"
            style={{
              background: "#fa6400",
              height: 40,
              padding: "10px 16px",
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: 14,
                lineHeight: "20px",
                letterSpacing: "0.14px",
                color: "#fff",
                whiteSpace: "nowrap",
              }}
            >
              {isLoading ? "Importando..." : "Importar archivo"}
            </span>
          </button>

          <button
            type="button"
            id="btnClear_Diagnostico"
            onClick={() => {
              void handleClearDiagnostico();
            }}
            className="flex items-center justify-center rounded-[8px]"
            style={{
              height: 40,
              padding: "10px 16px",
              border: "1px solid #fa6400",
              background: "transparent",
            }}
          >
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: 14,
                lineHeight: "20px",
                letterSpacing: "0.14px",
                color: "#fa6400",
                whiteSpace: "nowrap",
              }}
            >
              Reset
            </span>
          </button>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx"
        style={{ display: "none" }}
        onChange={(event) => {
          void handleImportFileChange(event);
        }}
      />

      {/* ── Module Box ── */}
      <div
        className="absolute"
        style={{ top: 102, left: 24, right: 24, bottom: 2 }}
      >
        <div
          className="flex flex-col gap-4 overflow-hidden"
          style={{
            height: "100%",
            background: "#fff",
            borderRadius: 16,
            padding: 16,
            border: "1px solid #e6e6e6",
            boxShadow: "0px 2px 4px 1px rgba(231,231,231,0.5)",
          }}
        >
          {/* Module Header */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              className="flex-1 flex flex-col justify-center"
              style={{ padding: "8px 0" }}
            >
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: 20,
                  lineHeight: "24px",
                  color: "#000",
                }}
              >
                {datasetName}
              </span>
            </div>

            {/* Search */}
            <div
              className="flex items-center gap-2"
              style={{
                background: "#fff",
                border: "1px solid #ccc",
                borderRadius: 8,
                height: 40,
                width: 357,
                padding: "6px 8px",
                flexShrink: 0,
              }}
            >
              <SearchIconFigma />
              <input
                type="text"
                placeholder="Buscar"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: "transparent",
                  outline: "none",
                  border: "none",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 400,
                  fontSize: 16,
                  lineHeight: "22px",
                  letterSpacing: "0.16px",
                  color: "#2b2b2b",
                }}
              />
            </div>

            {/* Filtros */}
            <button
              onClick={toggleFilters}
              className="flex items-center gap-2 rounded-[8px]"
              style={{
                border: `1px solid ${showFilters ? "#fa6400" : "#ccc"}`,
                padding: "10px 12px 10px 14px",
                background: showFilters ? "#fff0e5" : "transparent",
                flexShrink: 0,
                cursor: "pointer",
                transition: "border-color 0.15s, background 0.15s",
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: 14,
                  lineHeight: "20px",
                  letterSpacing: "0.14px",
                  color: showFilters ? "#fa6400" : "#4d4d4d",
                  whiteSpace: "nowrap",
                }}
              >
                Filtros
              </span>
              <FilterIconFigma />
            </button>
          </div>

          {(importStatus.phase !== "idle" || importStatus.error) && (
            <div
              className="flex items-center gap-2 shrink-0"
              style={{
                padding: "8px 12px",
                background: "#f9f9f9",
                borderRadius: 8,
                border: "1px solid #e6e6e6",
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: 12,
                  color: "#4d4d4d",
                  whiteSpace: "nowrap",
                }}
              >
                Estado de importación:
              </span>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  color: importStatus.phase === "error" ? "#b42318" : "#666",
                }}
              >
                {importStatus.error?.message ?? importStatus.phase}
              </span>
            </div>
          )}

          {/* Filters bar */}
          {showFilters && (
            <div
              className="flex items-center gap-3 shrink-0 flex-wrap"
              style={{
                padding: "10px 12px",
                background: "#f9f9f9",
                borderRadius: 8,
                border: "1px solid #e6e6e6",
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: 12,
                  color: "#4d4d4d",
                }}
              >
                Filtros activos:
              </span>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  color: "#666",
                }}
              >
                Panel de filtros avanzados (próximamente)
              </span>
            </div>
          )}

          {/* Table */}
          <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
            <div className="flex-1 min-h-0 h-full">
              {activeDatasetId ? (
                <PersistedDiagnosticoTable datasetId={activeDatasetId} />
              ) : (
                <div
                  className="rounded-[8px] flex items-center justify-center h-full"
                  style={{ border: "1px solid #e6e6e6", background: "#fff" }}
                >
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 14,
                      color: "#666",
                    }}
                  >
                    No hay datos importados. Importa un archivo para comenzar.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
