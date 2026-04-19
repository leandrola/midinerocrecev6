import { create } from "zustand";

interface UiStoreState {
  searchQuery: string;
  showFilters: boolean;
  selectedRowIds: string[];
  setSearchQuery: (searchQuery: string) => void;
  setShowFilters: (showFilters: boolean) => void;
  toggleFilters: () => void;
  setSelectedRowIds: (ids: string[]) => void;
  toggleRowSelection: (id: string) => void;
  clearRowSelection: () => void;
  resetUiState: () => void;
}

const initialUiState = {
  searchQuery: "",
  showFilters: false,
  selectedRowIds: [] as string[],
};

export const useUiStore = create<UiStoreState>((set) => ({
  ...initialUiState,
  setSearchQuery: (searchQuery) => {
    set({ searchQuery });
  },
  setShowFilters: (showFilters) => {
    set({ showFilters });
  },
  toggleFilters: () => {
    set((state) => ({ showFilters: !state.showFilters }));
  },
  setSelectedRowIds: (ids) => {
    set({ selectedRowIds: ids });
  },
  toggleRowSelection: (id) => {
    set((state) => {
      const nextSelected = new Set(state.selectedRowIds);
      if (nextSelected.has(id)) {
        nextSelected.delete(id);
      } else {
        nextSelected.add(id);
      }

      return { selectedRowIds: Array.from(nextSelected) };
    });
  },
  clearRowSelection: () => {
    set({ selectedRowIds: [] });
  },
  resetUiState: () => {
    set(initialUiState);
  },
}));
