export type CreateIdeaScreen = "home" | "composer";
export type ComposerMode = "writing" | "ai";

export type IdeaComposerState = {
  screen: CreateIdeaScreen;
  composerMode: ComposerMode;
  isReturningHome: boolean;
};

export type IdeaComposerAction =
  | { type: "OPEN_COMPOSER" }
  | { type: "CLOSE_COMPOSER" }
  | { type: "OPEN_AI" }
  | { type: "CLOSE_AI" }
  | { type: "CLEAR_RETURNING_HOME" };

export const initialIdeaComposerState: IdeaComposerState = {
  screen: "home",
  composerMode: "writing",
  isReturningHome: false,
};

export function ideaComposerReducer(
  state: IdeaComposerState,
  action: IdeaComposerAction,
): IdeaComposerState {
  switch (action.type) {
    case "OPEN_COMPOSER":
      return {
        screen: "composer",
        composerMode: "writing",
        isReturningHome: false,
      };
    case "CLOSE_COMPOSER":
      return {
        screen: "home",
        composerMode: "writing",
        isReturningHome: true,
      };
    case "OPEN_AI":
      if (state.screen !== "composer") return state;
      return {
        ...state,
        composerMode: "ai",
      };
    case "CLOSE_AI":
      if (state.screen !== "composer") return state;
      return {
        ...state,
        composerMode: "writing",
      };
    case "CLEAR_RETURNING_HOME":
      return {
        ...state,
        isReturningHome: false,
      };
    default:
      return state;
  }
}
