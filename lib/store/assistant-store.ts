import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface AssistantState {
  isOpen: boolean;
}

interface AssistantActions {
  togglePanel: () => void;
  closePanel: () => void;
}

type AssistantStore = AssistantState & AssistantActions;

const initialState: AssistantState = {
  isOpen: false,
};

export const useAssistantStore = create<AssistantStore>()(
  devtools(
    (set) => ({
      ...initialState,
      togglePanel: () => set((state) => ({ isOpen: !state.isOpen }), false, "togglePanel"),
      closePanel: () => set({ isOpen: false }, false, "closePanel"),
    }),
    { name: "AssistantStore" }
  )
);
