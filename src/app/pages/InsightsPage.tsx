import { useEffect, useState } from "react";
import svgPaths from "../../imports/MidinerocreceV6DeudaDeExperiencia/svg-curwnqj0xs";
import { loadActiveDatasetMeta } from "../../features/import";
import { useDatasetStore } from "../../store/datasetStore";
import { useUiStore } from "../../store/uiStore";
import { rowRepository } from "../../db";
import { buildInsightsSummary, type InsightsSummary } from "../../features/data";

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

function truncateLabel(value: string, maxLength = 48): string {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength).trim()}...`;
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function InsightsPage() {
  const searchQuery = useUiStore((state) => state.searchQuery);
  const setSearchQuery = useUiStore((state) => state.setSearchQuery);
  const showFilters = useUiStore((state) => state.showFilters);
  const toggleFilters = useUiStore((state) => state.toggleFilters);
  const setActiveDataset = useDatasetStore((state) => state.setActiveDataset);
  const datasetName = useDatasetStore(
    (state) => state.activeDataset?.name ?? "Nombre del archivo",
  );
  const activeDatasetId = useDatasetStore((state) => state.activeDataset?.id ?? null);

  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insights, setInsights] = useState<InsightsSummary | null>(null);

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

  useEffect(() => {
    let active = true;

    if (!activeDatasetId) {
      setInsights(null);
      setIsLoadingInsights(false);
      return () => {
        active = false;
      };
    }

    setIsLoadingInsights(true);
    void (async () => {
      const persistedRows = await rowRepository.getAllByDataset(activeDatasetId);
      if (!active) {
        return;
      }

      setInsights(buildInsightsSummary(persistedRows));
      setIsLoadingInsights(false);
    })();

    return () => {
      active = false;
    };
  }, [activeDatasetId]);

  return (
    <>
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
            Insights
          </p>
        </div>
      </div>

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
                Análisis de {datasetName}
              </span>
            </div>

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

          <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
            {!activeDatasetId ? (
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
                  No hay datos importados. Importa un archivo en Diagnóstico para habilitar Insights.
                </span>
              </div>
            ) : isLoadingInsights || !insights ? (
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
                  Cargando insights...
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-4 pb-2">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                  {[
                    { label: "Total iniciativas", value: insights.kpis.totalIniciativas },
                    { label: "En desarrollo", value: insights.kpis.enDesarrollo },
                    { label: "No abordada aún", value: insights.kpis.noAbordadaAun },
                    { label: "Prioridad Alta", value: insights.kpis.prioridadAlta },
                  ].map((card) => (
                    <div
                      key={card.label}
                      className="rounded-[8px]"
                      style={{
                        border: "1px solid #e6e6e6",
                        background: "#fff",
                        padding: 14,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 12,
                          color: "#666",
                          marginBottom: 6,
                        }}
                      >
                        {card.label}
                      </div>
                      <div
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 700,
                          fontSize: 28,
                          lineHeight: "30px",
                          color: "#1f1f1f",
                        }}
                      >
                        {card.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <div
                    className="rounded-[8px]"
                    style={{ border: "1px solid #e6e6e6", background: "#fff", padding: 14 }}
                  >
                    <div
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 600,
                        fontSize: 14,
                        color: "#2b2b2b",
                        marginBottom: 10,
                      }}
                    >
                      Combinaciones de riesgo
                    </div>
                    <div className="flex flex-col gap-2">
                      {insights.riskCombinations.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3"
                          style={{
                            border: "1px solid #f0f0f0",
                            borderRadius: 8,
                            padding: "8px 10px",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: 13,
                              color: "#444",
                            }}
                          >
                            {item.label}
                          </span>
                          <span
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 600,
                              fontSize: 13,
                              color: "#2b2b2b",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.count} ({formatPercentage(item.percentage)})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className="rounded-[8px]"
                    style={{ border: "1px solid #e6e6e6", background: "#fff", padding: 14 }}
                  >
                    <div
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 600,
                        fontSize: 14,
                        color: "#2b2b2b",
                        marginBottom: 10,
                      }}
                    >
                      Top deudas recurrentes
                    </div>
                    <div className="flex flex-col gap-2">
                      {insights.topDeudaExperiencia.map((item, index) => (
                        <div
                          key={`${item.value}-${index}`}
                          className="flex items-center justify-between gap-3 p-1"
                        >
                          <span
                            title={item.value}
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: 13,
                              color: "#444",
                            }}
                          >
                            {index + 1}. {truncateLabel(item.value)}
                          </span>
                          <span
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 600,
                              fontSize: 13,
                              color: "#2b2b2b",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <div
                    className="rounded-[8px]"
                    style={{ border: "1px solid #e6e6e6", background: "#fff", padding: 14 }}
                  >
                    <div
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 600,
                        fontSize: 14,
                        color: "#2b2b2b",
                        marginBottom: 10,
                      }}
                    >
                      Distribución por estado
                    </div>
                    <div className="flex flex-col gap-2">
                      {insights.estadoDistribution.map((item) => (
                        <div key={item.value} className="flex flex-col gap-1">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: 13,
                                color: "#444",
                              }}
                            >
                              {item.value}
                            </span>
                            <span
                              style={{
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: 600,
                                fontSize: 12,
                                color: "#2b2b2b",
                              }}
                            >
                              {item.count} ({formatPercentage(item.percentage)})
                            </span>
                          </div>
                          <div
                            style={{
                              height: 6,
                              borderRadius: 999,
                              background: "#f1f1f1",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.min(100, Math.max(0, item.percentage))}%`,
                                height: "100%",
                                background: "#fa6400",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className="rounded-[8px]"
                    style={{ border: "1px solid #e6e6e6", background: "#fff", padding: 14 }}
                  >
                    <div
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 600,
                        fontSize: 14,
                        color: "#2b2b2b",
                        marginBottom: 10,
                      }}
                    >
                      Top canales
                    </div>
                    <div className="flex flex-col gap-2">
                      {insights.topCanal.map((item, index) => (
                        <div
                          key={`${item.value}-${index}`}
                          className="flex items-center justify-between gap-3"
                        >
                          <span
                            title={item.value}
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: 13,
                              color: "#444",
                            }}
                          >
                            {index + 1}. {truncateLabel(item.value, 36)}
                          </span>
                          <span
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 600,
                              fontSize: 13,
                              color: "#2b2b2b",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.count} ({formatPercentage(item.percentage)})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
