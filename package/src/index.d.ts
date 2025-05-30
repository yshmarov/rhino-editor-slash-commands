export interface Command {
  title: string;
  icon: string;
  command: (editor: any) => void;
}

export interface SlashCommandsOptions {
  commands?: Command[];
  placeholder?: string;
}

export interface Config {
  DROPDOWN: {
    OFFSET_Y: number;
    SCROLL_BEHAVIOR: string;
  };
  TIMING: {
    RETRY_INTERVAL: number;
    MAX_RETRIES: number;
    INITIAL_DELAY: number;
    TURBO_DELAY: number;
  };
  SELECTORS: {
    RHINO_EDITOR: string;
    FILE_INPUT: string;
    PARAGRAPH: string;
  };
  CLASSES: {
    DROPDOWN: string;
    ITEM: string;
    SELECTED: string;
    EMPTY: string;
  };
  KEYS: {
    ESCAPE: string;
    ARROW_DOWN: string;
    ARROW_UP: string;
    ENTER: string;
    TAB: string;
  };
}

declare class RhinoSlashCommands {
  constructor(options?: SlashCommandsOptions);
  
  init(): void;
  addCommand(command: Command): void;
  removeCommand(title: string): void;
}

export default RhinoSlashCommands;
export { defaultCommands, CONFIG }; 