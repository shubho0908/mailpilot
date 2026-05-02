import type { Message, PendingApproval } from "./assistantPanelMessagesList";

export interface AssistantPanelState {
  messages: Message[];
  input: string;
  isThinking: boolean;
  error: string | null;
  pendingApproval: PendingApproval | null;
}

export type AssistantPanelAction =
  | { type: "SET_MESSAGES"; value: Message[] }
  | { type: "ADD_MESSAGE"; value: Message }
  | { type: "SET_INPUT"; value: string }
  | { type: "SET_THINKING"; value: boolean }
  | { type: "SET_ERROR"; value: string | null }
  | { type: "SET_PENDING_APPROVAL"; value: PendingApproval | null }
  | { type: "RESET" };

export function assistantPanelReducer(
  state: AssistantPanelState,
  action: AssistantPanelAction
): AssistantPanelState {
  switch (action.type) {
    case "SET_MESSAGES":
      return { ...state, messages: action.value };
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.value] };
    case "SET_INPUT":
      return { ...state, input: action.value };
    case "SET_THINKING":
      return { ...state, isThinking: action.value };
    case "SET_ERROR":
      return { ...state, error: action.value };
    case "SET_PENDING_APPROVAL":
      return { ...state, pendingApproval: action.value };
    case "RESET":
      return { ...state, messages: [], input: "", error: null, pendingApproval: null };
    default:
      return state;
  }
}
