import { useEffect, useMemo, useRef, useState } from "react";
import { ProyectosSankeyChart } from "../components/charts/ProyectosSankeyChart";
import { rowRepository } from "../../db";
import { toDiagnosticoSankeyData, type SankeyData } from "../../features/data";
import { loadActiveDatasetMeta } from "../../features/import";
import { useDatasetStore } from "../../store/datasetStore";

export function ProyectosPage() {
  const activeDatasetId = useDatasetStore((state) => state.activeDataset?.id ?? null);
  const setActiveDataset = useDatasetStore((state) => state.setActiveDataset);
  const importPhase = useDatasetStore((state) => state.importStatus.phase);
  const importFinishedAt = useDatasetStore((state) => state.importStatus.finishedAt);
  const [isLoadingRows, setIsLoadingRows] = useState(false);
  const [generatedDatasetId, setGeneratedDatasetId] = useState<string | null>(null);
  const [sankeyData, setSankeyData] = useState<SankeyData>({ nodes: [], links: [] });
  const lastAutoBuildKeyRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const currentDataset = useDatasetStore.getState().activeDataset;
      if (currentDataset) {
        return;
      }

      const persistedActiveDataset = await loadActiveDatasetMeta();
      if (!active) {
        return;
      }

      setActiveDataset(persistedActiveDataset);
    })();

    return () => {
      active = false;
    };
  }, [setActiveDataset]);

  useEffect(() => {
    // Reset chart only when the active dataset changed from the one used to generate it.
    if (generatedDatasetId && activeDatasetId && generatedDatasetId !== activeDatasetId) {
      setGeneratedDatasetId(null);
      setSankeyData({ nodes: [], links: [] });
    }
  }, [activeDatasetId, generatedDatasetId]);

  async function generateChartForDataset(datasetId: string): Promise<void> {
    setIsLoadingRows(true);
    try {
      const rows = await rowRepository.getAllByDataset(datasetId);
      setSankeyData(toDiagnosticoSankeyData(rows));
      setGeneratedDatasetId(datasetId);
    } catch (error) {
      console.warn("No se pudo generar el Sankey para el dataset activo.", error);
      setSankeyData({ nodes: [], links: [] });
      setGeneratedDatasetId(null);
    } finally {
      setIsLoadingRows(false);
    }
  }

  async function handleGenerateChart(): Promise<void> {
    let datasetId = activeDatasetId;
    if (!datasetId) {
      const persistedActiveDataset = await loadActiveDatasetMeta();
      setActiveDataset(persistedActiveDataset);
      datasetId = persistedActiveDataset?.id ?? null;
    }

    if (!datasetId) {
      setSankeyData({ nodes: [], links: [] });
      setGeneratedDatasetId(null);
      return;
    }

    await generateChartForDataset(datasetId);
  }

  useEffect(() => {
    let active = true;

    async function autoGenerateChartIfNeeded(): Promise<void> {
      if (!activeDatasetId || isLoadingRows) {
        return;
      }

      const completionKey =
        importPhase === "completed"
          ? `${activeDatasetId}:${importFinishedAt ?? "completed"}`
          : null;
      const hydrationKey =
        generatedDatasetId === null ? `${activeDatasetId}:hydrate` : null;
      const targetKey = completionKey ?? hydrationKey;

      if (!targetKey || lastAutoBuildKeyRef.current === targetKey) {
        return;
      }

      lastAutoBuildKeyRef.current = targetKey;
      await generateChartForDataset(activeDatasetId);
    }

    void (async () => {
      await autoGenerateChartIfNeeded();
      if (!active) {
        return;
      }
    })();

    return () => {
      active = false;
    };
  }, [activeDatasetId, generatedDatasetId, importFinishedAt, importPhase, isLoadingRows]);

  const shouldRenderChart = useMemo(
    () => !isLoadingRows && generatedDatasetId !== null && sankeyData.nodes.length > 0,
    [generatedDatasetId, isLoadingRows, sankeyData.nodes.length],
  );
  const sankeyFlowReference = [
    "Canal",
    "Funcionalidad",
    "Deuda de Experiencia",
    "Prioridad diseño",
    "Factibilidad técnica",
    "Estado",
  ];

  return (
    <>
      {/* ── Topbar ── */}
      <div
        className="absolute flex items-center gap-4 left-0 right-0 top-0"
        style={{ minHeight: 102, padding: 24, zIndex: 10 }}
      >
        {/* Title */}
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
            Estado de los proyectos
          </p>
        </div>

        {/* Right action */}
        <div
          className="flex items-center gap-2 shrink-0"
          style={{ zIndex: 2 }}
        >
          <button
            className="flex items-center justify-center rounded-[8px]"
            id="btnChartGenerator"
            onClick={() => {
              void handleGenerateChart();
            }}
            disabled={isLoadingRows}
            style={{
              background: "#fa6400",
              height: 40,
              padding: "10px 16px",
              opacity: isLoadingRows ? 0.7 : 1,
              cursor: isLoadingRows ? "not-allowed" : "pointer",
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
              {isLoadingRows ? "Generando..." : "Graficar Diagnóstico"}
            </span>
          </button>
        </div>
      </div>

      {/* ── Module Box (vacío) ── */}
      <div
        className="absolute"
        style={{ top: 102, left: 24, right: 24, bottom: 2 }}
      >
        <div
          className="p-4"
          style={{
            height: "100%",
            background: "#fff",
            borderRadius: 16,
            border: "1px solid #e6e6e6",
            boxShadow: "0px 2px 4px 1px rgba(231,231,231,0.5)",
          }}
        >
          {shouldRenderChart ? (
            <div className="h-full flex flex-col gap-3">
              <div className="flex items-center flex-wrap gap-2">
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    fontSize: 12,
                    color: "#4d4d4d",
                  }}
                >
                  Referencia del flujo:
                </span>
                {sankeyFlowReference.map((label, index) => (
                  <span
                    key={label}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 12,
                      color: "#666",
                    }}
                  >
                    {index === 0 ? label : `→ ${label}`}
                  </span>
                ))}
              </div>
              <div className="flex-1 min-h-0">
                <ProyectosSankeyChart data={sankeyData} />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
