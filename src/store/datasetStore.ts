import { create } from "zustand";
import type { DatasetMeta } from "../types/dataset";
import type { ImportError, ImportPhase, ImportStatus } from "../types/import";
import { nowIso } from "../utils/time";

interface DatasetStoreState {
  activeDataset: DatasetMeta | null;
  isLoading: boolean;
  importStatus: ImportStatus;
  setActiveDataset: (dataset: DatasetMeta | null) => void;
  setLoading: (isLoading: boolean) => void;
  setImportPhase: (phase: ImportPhase) => void;
  setImportError: (error: ImportError | null) => void;
  startImport: () => void;
  completeImport: () => void;
  failImport: (message: string) => void;
  resetImportStatus: () => void;
}

const initialImportStatus: ImportStatus = {
  phase: "idle",
  startedAt: null,
  finishedAt: null,
  error: null,
};

export const useDatasetStore = create<DatasetStoreState>((set) => ({
  activeDataset: null,
  isLoading: false,
  importStatus: initialImportStatus,
  setActiveDataset: (dataset) => {
    set({ activeDataset: dataset });
  },
  setLoading: (isLoading) => {
    set({ isLoading });
  },
  setImportPhase: (phase) => {
    set((state) => ({
      importStatus: {
        ...state.importStatus,
        phase,
      },
    }));
  },
  setImportError: (error) => {
    set((state) => ({
      importStatus: {
        ...state.importStatus,
        error,
      },
    }));
  },
  startImport: () => {
    set({
      isLoading: true,
      importStatus: {
        phase: "reading_file",
        startedAt: nowIso(),
        finishedAt: null,
        error: null,
      },
    });
  },
  completeImport: () => {
    set((state) => ({
      isLoading: false,
      importStatus: {
        ...state.importStatus,
        phase: "completed",
        finishedAt: nowIso(),
        error: null,
      },
    }));
  },
  failImport: (message) => {
    set((state) => ({
      isLoading: false,
      importStatus: {
        ...state.importStatus,
        phase: "error",
        finishedAt: nowIso(),
        error: {
          message,
        },
      },
    }));
  },
  resetImportStatus: () => {
    set({ isLoading: false, importStatus: initialImportStatus });
  },
}));
