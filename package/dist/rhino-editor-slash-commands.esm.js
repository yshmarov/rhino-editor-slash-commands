/**
 * ========================================================================
 * RHINO EDITOR SLASH COMMANDS
 * ========================================================================
 * 
 * Notion-like slash commands for rhino-editor instances.
 * Replaces the default toolbar with a dropdown that appears when typing "/"
 * and provides comprehensive formatting options.
 * 
 * @version 1.0.0
 * @author Your Name
 * @license MIT
 */

// ===== CONSTANTS =====
const CONFIG = {
  DROPDOWN: {
    OFFSET_Y: 5,
    SCROLL_BEHAVIOR: 'nearest'
  },
  TIMING: {
    RETRY_INTERVAL: 200,
    MAX_RETRIES: 10,
    INITIAL_DELAY: 100,
    TURBO_DELAY: 500
  },
  SELECTORS: {
    RHINO_EDITOR: 'rhino-editor',
    FILE_INPUT: '#file-input',
    PARAGRAPH: 'p'
  },
  CLASSES: {
    DROPDOWN: 'slash-commands-dropdown',
    ITEM: 'slash-command-item',
    SELECTED: 'selected',
    EMPTY: 'is-empty'
  },
  KEYS: {
    ESCAPE: 'Escape',
    ARROW_DOWN: 'ArrowDown',
    ARROW_UP: 'ArrowUp',
    ENTER: 'Enter',
    TAB: 'Tab'
  }
};

// ===== GLOBAL STATE =====
let globalDropdown = null;
let isDropdownOpen = false;
let selectedIndex = -1;

// ===== UTILITY FUNCTIONS =====
const Utils = {
  safeExecute(fn, context = 'Unknown') {
    try {
      return fn();
    } catch (error) {
      console.warn(`[SlashCommands] Error in ${context}:`, error);
      return null;
    }
  },

  filterCommands(commands, query) {
    if (!query.trim()) return commands;
    
    const lowerQuery = query.toLowerCase();
    return commands.filter(cmd => {
      const title = cmd.title.toLowerCase();
      
      // Match if query is found anywhere in the title
      if (title.includes(lowerQuery)) return true;
      
      // Match if query matches the start of any word in the title
      const words = title.split(' ');
      return words.some(word => word.startsWith(lowerQuery));
    });
  },

  findFileInput(editor) {
    const rhinoElement = editor.view.dom.closest(CONFIG.SELECTORS.RHINO_EDITOR);
    if (!rhinoElement) return null;

    return rhinoElement.shadowRoot?.querySelector(CONFIG.SELECTORS.FILE_INPUT) || 
           rhinoElement.querySelector('input[type="file"]');
  }
};

// ===== DEFAULT COMMANDS =====
const defaultCommands = [
  {
    title: 'Heading 1',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" width="16" height="16"><path fill-rule="evenodd" d="M6.25 4a.75.75 0 01.75.75V11h10V4.75a.75.75 0 011.5 0v14.5a.75.75 0 01-1.5 0V12.5H7v6.75a.75.75 0 01-1.5 0V4.75A.75.75 0 016.25 4z"></path></svg>`,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run()
  },
  {
    title: 'Heading 2',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" width="16" height="16"><path fill-rule="evenodd" d="M6.25 4a.75.75 0 01.75.75V11h10V4.75a.75.75 0 011.5 0v14.5a.75.75 0 01-1.5 0V12.5H7v6.75a.75.75 0 01-1.5 0V4.75A.75.75 0 016.25 4z"></path></svg>`,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run()
  },
  {
    title: 'Bold',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" width="16" height="16"><path fill-rule="evenodd" d="M6 4.75c0-.69.56-1.25 1.25-1.25h5a4.75 4.75 0 013.888 7.479A5 5 0 0114 20.5H7.25c-.69 0-1.25-.56-1.25-1.25V4.75zM8.5 13v5H14a2.5 2.5 0 000-5H8.5zm0-2.5h3.751A2.25 2.25 0 0012.25 6H8.5v4.5z"></path></svg>`,
    command: (editor) => editor.chain().focus().toggleBold().run()
  },
  {
    title: 'Italic',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" width="16" height="16"><path fill-rule="evenodd" d="M10 4.75a.75.75 0 01.75-.75h8.5a.75.75 0 010 1.5h-3.514l-5.828 13h3.342a.75.75 0 010 1.5h-8.5a.75.75 0 010-1.5h3.514l5.828-13H10.75a.75.75 0 01-.75-.75z"></path></svg>`,
    command: (editor) => editor.chain().focus().toggleItalic().run()
  },
  {
    title: 'Strikethrough',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" width="16" height="16"><path fill-rule="evenodd" d="M12.36 5C9.37 5 8.105 6.613 8.105 7.848c0 .411.072.744.193 1.02a.75.75 0 01-1.373.603 3.993 3.993 0 01-.32-1.623c0-2.363 2.271-4.348 5.755-4.348 1.931 0 3.722.794 4.814 1.5a.75.75 0 11-.814 1.26c-.94-.607-2.448-1.26-4-1.26zm4.173 7.5h3.717a.75.75 0 000-1.5H3.75a.75.75 0 000 1.5h9.136c1.162.28 2.111.688 2.76 1.211.642.518.979 1.134.979 1.898a2.63 2.63 0 01-.954 2.036c-.703.601-1.934 1.105-3.999 1.105-2.018 0-3.529-.723-4.276-1.445a.75.75 0 10-1.042 1.08c1.066 1.028 2.968 1.865 5.318 1.865 2.295 0 3.916-.56 4.974-1.464a4.131 4.131 0 001.479-3.177c0-1.296-.608-2.316-1.538-3.066a5.77 5.77 0 00-.054-.043z"></path></svg>`,
    command: (editor) => editor.chain().focus().toggleStrike().run()
  },
  {
    title: 'Inline Code',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor" viewBox="0 0 16 16" width="16" height="16"><path d="M10.478 1.647a.5.5 0 1 0-.956-.294l-4 13a.5.5 0 0 0 .956.294zM4.854 4.146a.5.5 0 0 1 0 .708L1.707 8l3.147 3.146a.5.5 0 0 1-.708.708l-3.5-3.5a.5.5 0 0 1 0-.708l3.5-3.5a.5.5 0 0 1 .708 0m6.292 0a.5.5 0 0 0 0 .708L14.293 8l-3.147 3.146a.5.5 0 0 0 .708.708l3.5-3.5a.5.5 0 0 0 0-.708l-3.5-3.5a.5.5 0 0 0-.708 0"/></svg>`,
    command: (editor) => editor.chain().focus().toggleCode().run()
  },
  {
    title: 'Bullet List',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" width="16" height="16"><path fill-rule="evenodd" d="M4 7a1 1 0 100-2 1 1 0 000 2zm4.75-1.5a.75.75 0 000 1.5h11.5a.75.75 0 000-1.5H8.75zm0 6a.75.75 0 000 1.5h11.5a.75.75 0 000-1.5H8.75zm0 6a.75.75 0 000 1.5h11.5a.75.75 0 000-1.5H8.75zM5 12a1 1 0 11-2 0 1 1 0 012 0zm-1 7a1 1 0 100-2 1 1 0 000 2z"></path></svg>`,
    command: (editor) => editor.chain().focus().toggleBulletList().run()
  },
  {
    title: 'Numbered List',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" width="16" height="16"><path d="M3.604 3.089A.75.75 0 014 3.75V8.5h.75a.75.75 0 010 1.5h-3a.75.75 0 110-1.5h.75V5.151l-.334.223a.75.75 0 01-.832-1.248l1.5-1a.75.75 0 01.77-.037zM8.75 5.5a.75.75 0 000 1.5h11.5a.75.75 0 000-1.5H8.75zm0 6a.75.75 0 000 1.5h11.5a.75.75 0 000-1.5H8.75zm0 6a.75.75 0 000 1.5h11.5a.75.75 0 000-1.5H8.75zM5.5 15.75c0-.704-.271-1.286-.72-1.686a2.302 2.302 0 00-1.53-.564c-.535 0-1.094.178-1.53.565-.449.399-.72.982-.72 1.685a.75.75 0 001.5 0c0-.296.104-.464.217-.564A.805.805 0 013.25 15c.215 0 .406.072.533.185.113.101.217.268.217.565 0 .332-.069.48-.21.657-.092.113-.216.24-.403.419l-.147.14c-.152.144-.33.313-.52.504l-1.5 1.5a.75.75 0 00-.22.53v.25c0 .414.336.75.75.75H5A.75.75 0 005 19H3.31l.47-.47c.176-.176.333-.324.48-.465l.165-.156a5.98 5.98 0 00.536-.566c.358-.447.539-.925.539-1.593z"></path></svg>`,
    command: (editor) => editor.chain().focus().toggleOrderedList().run()
  },
  {
    title: 'Blockquote',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor" viewBox="0 0 16 16" width="16" height="16"><path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z" /><path d="M7.066 6.76A1.665 1.665 0 0 0 4 7.668a1.667 1.667 0 0 0 2.561 1.406c-.131.389-.375.804-.777 1.22a.417.417 0 0 0 .6.58c1.486-1.54 1.293-3.214.682-4.112zm4 0A1.665 1.665 0 0 0 8 7.668a1.667 1.667 0 0 0 2.561 1.406c-.131.389-.375.804-.777 1.22a.417.417 0 0 0 .6.58c1.486-1.54 1.293-3.214.682-4.112z" /></svg>`,
    command: (editor) => editor.chain().focus().toggleBlockquote().run()
  },
  {
    title: 'Code Block',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor" viewBox="0 0 16 16" width="16" height="16"><path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/><path d="M6.854 4.646a.5.5 0 0 1 0 .708L4.207 8l2.647 2.646a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0m2.292 0a.5.5 0 0 0 0 .708L11.793 8l-2.647 2.646a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708 0"/></svg>`,
    command: (editor) => editor.chain().focus().toggleCodeBlock().run()
  },
  {
    title: 'Horizontal Rule',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" width="16" height="16"><path d="M3 12h18v2H3z"/></svg>`,
    command: (editor) => editor.chain().focus().setHorizontalRule().run()
  },
  {
    title: 'Attach Files',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor" viewBox="0 0 16 16" width="16" height="16"><path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0V3z" /></svg>`,
    command: (editor) => {
      const fileInput = Utils.findFileInput(editor);
      if (fileInput) {
        fileInput.click();
      }
    }
  }
];

// ===== MAIN SLASH COMMANDS CLASS =====
class RhinoSlashCommands {
  constructor(options = {}) {
    this.options = {
      commands: defaultCommands,
      placeholder: "Write something or type / for options",
      ...options
    };
    
    this.commands = this.options.commands;
    this.isInitialized = false;
  }

  // Initialize slash commands for all rhino-editor instances
  init() {
    if (this.isInitialized) return;
    
    this.setupEventListeners();
    this.initializeExistingEditors();
    this.isInitialized = true;
  }

  // Add custom command
  addCommand(command) {
    this.commands.push(command);
  }

  // Remove command by title
  removeCommand(title) {
    this.commands = this.commands.filter(cmd => cmd.title !== title);
  }

  // Setup global event listeners
  setupEventListeners() {
    document.addEventListener("rhino-before-initialize", this.configureRhinoEditor.bind(this));
    document.addEventListener("rhino-initialize", this.onRhinoInitialized.bind(this));
    document.addEventListener('DOMContentLoaded', this.initializeExistingEditors.bind(this));
    document.addEventListener('turbo:load', () => {
      setTimeout(this.initializeExistingEditors.bind(this), CONFIG.TIMING.TURBO_DELAY);
    });

    // Global click handler to hide dropdown
    document.addEventListener('click', (e) => {
      if (isDropdownOpen && globalDropdown && !globalDropdown.contains(e.target)) {
        const rhinoEditor = e.target.closest(CONFIG.SELECTORS.RHINO_EDITOR);
        if (!rhinoEditor) {
          this.hideDropdown();
        }
      }
    });
  }

  // Configure rhino-editor before initialization
  configureRhinoEditor(e) {
    const editor = e.target;
    
    editor.starterKitOptions = {
      ...editor.starterKitOptions,
      rhinoPlaceholder: {
        placeholder: this.options.placeholder
      }
    };
  }

  // Setup after rhino-editor is initialized
  onRhinoInitialized(e) {
    const rhinoElement = e.target;
    
    if (rhinoElement.hasSlashCommands) return;
    
    setTimeout(() => {
      if (rhinoElement.editor) {
        this.setupSlashCommands(rhinoElement.editor);
        rhinoElement.hasSlashCommands = true;
      } else {
        this.retryEditorSetup(rhinoElement);
      }
    }, CONFIG.TIMING.INITIAL_DELAY);
  }

  // Initialize existing editors on page
  initializeExistingEditors() {
    const existingEditors = document.querySelectorAll(CONFIG.SELECTORS.RHINO_EDITOR);
    existingEditors.forEach((rhinoElement) => {
      if (rhinoElement.editor && !rhinoElement.hasSlashCommands) {
        this.setupSlashCommands(rhinoElement.editor);
        rhinoElement.hasSlashCommands = true;
      }
    });
  }

  // Retry editor setup with exponential backoff
  retryEditorSetup(rhinoElement) {
    let retries = 0;
    const retryInterval = setInterval(() => {
      retries++;
      if (rhinoElement.editor) {
        this.setupSlashCommands(rhinoElement.editor);
        rhinoElement.hasSlashCommands = true;
        clearInterval(retryInterval);
      } else if (retries >= CONFIG.TIMING.MAX_RETRIES) {
        clearInterval(retryInterval);
        console.warn('[SlashCommands] Max retries reached for editor setup');
      }
    }, CONFIG.TIMING.RETRY_INTERVAL);
  }

  // Setup slash commands for a specific editor instance
  setupSlashCommands(editor) {
    if (editor.slashCommandsKeydownHandler) return;
    
    editor.on('update', ({ editor }) => {
      Utils.safeExecute(() => {
        this.updateEmptyParagraphs(editor);
        this.checkForSlashCommand(editor);
      }, 'editor update');
    });

    const keydownHandler = this.handleKeydown.bind(this);
    editor.slashCommandsKeydownHandler = keydownHandler;
    editor.view.dom.addEventListener('keydown', keydownHandler, true);
    
    setTimeout(() => {
      this.updateEmptyParagraphs(editor);
    }, CONFIG.TIMING.INITIAL_DELAY);
  }

  // Update empty paragraph classes for placeholder display
  updateEmptyParagraphs(editor) {
    if (!editor.state.selection.empty) return;

    Utils.safeExecute(() => {
      const proseMirrorElement = editor.view.dom;
      const paragraphs = proseMirrorElement.querySelectorAll(CONFIG.SELECTORS.PARAGRAPH);
      
      paragraphs.forEach(p => {
        const isEmpty = p.textContent.trim() === '' && p.children.length === 0;
        p.classList.toggle(CONFIG.CLASSES.EMPTY, isEmpty);
      });
    }, 'updateEmptyParagraphs');
  }

  // Check for slash command trigger and show/hide dropdown
  checkForSlashCommand(editor) {
    const { state } = editor;
    const { selection } = state;
    const { $from } = selection;
    
    const currentLineText = $from.parent.textContent;
    const cursorPos = $from.parentOffset;
    const slashIndex = currentLineText.lastIndexOf('/', cursorPos);
    
    if (slashIndex !== -1 && slashIndex === cursorPos - 1) {
      const coords = editor.view.coordsAtPos($from.pos);
      this.showDropdown(coords.left, coords.bottom + CONFIG.DROPDOWN.OFFSET_Y, '', editor);
    } else if (slashIndex !== -1 && slashIndex < cursorPos) {
      const query = currentLineText.slice(slashIndex + 1, cursorPos);
      const coords = editor.view.coordsAtPos($from.pos);
      this.showDropdown(coords.left, coords.bottom + CONFIG.DROPDOWN.OFFSET_Y, query, editor);
    } else if (isDropdownOpen) {
      this.hideDropdown();
    }
  }

  // Handle keyboard navigation in dropdown
  handleKeydown(e) {
    if (!isDropdownOpen) return;
    
    const filteredCommands = globalDropdown?.filteredCommands;
    const currentEditor = globalDropdown?.currentEditor;
    
    if (!filteredCommands || !currentEditor) return;
    
    let handled = false;
    
    switch (e.key) {
      case CONFIG.KEYS.ESCAPE:
        this.hideDropdown();
        handled = true;
        break;
        
      case CONFIG.KEYS.ARROW_DOWN:
        selectedIndex = selectedIndex < filteredCommands.length - 1 ? selectedIndex + 1 : 0;
        this.updateSelectedItem();
        handled = true;
        break;
        
      case CONFIG.KEYS.ARROW_UP:
        selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : filteredCommands.length - 1;
        this.updateSelectedItem();
        handled = true;
        break;
        
      case CONFIG.KEYS.ENTER:
        this.executeSelectedCommand(currentEditor, filteredCommands);
        handled = true;
        break;
        
      case CONFIG.KEYS.TAB:
        selectedIndex = selectedIndex < filteredCommands.length - 1 ? selectedIndex + 1 : 0;
        this.updateSelectedItem();
        handled = true;
        break;
    }

    if (handled) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }

  // Create the global dropdown element
  createGlobalDropdown() {
    if (globalDropdown) return globalDropdown;
    
    const dropdown = document.createElement('div');
    dropdown.className = CONFIG.CLASSES.DROPDOWN;
    
    dropdown.style.cssText = `
      position: absolute;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      max-height: 200px;
      overflow-y: auto;
      min-width: 200px;
      display: none;
    `;
    
    globalDropdown = dropdown;
    return dropdown;
  }

  // Update selected item styling for keyboard navigation
  updateSelectedItem() {
    const items = globalDropdown?.querySelectorAll(`.${CONFIG.CLASSES.ITEM}`);
    if (!items) return;
    
    items.forEach((item, index) => {
      if (index === selectedIndex) {
        item.classList.add(CONFIG.CLASSES.SELECTED);
        item.scrollIntoView({ block: CONFIG.DROPDOWN.SCROLL_BEHAVIOR });
      } else {
        item.classList.remove(CONFIG.CLASSES.SELECTED);
      }
    });
  }

  // Execute selected command and clean up
  executeSelectedCommand(currentEditor, filteredCommands) {
    if (selectedIndex < 0 || selectedIndex >= filteredCommands.length) return;

    const selectedCommand = filteredCommands[selectedIndex];
    this.hideDropdown();
    
    Utils.safeExecute(() => {
      this.removeSlashText(currentEditor);
      selectedCommand.command(currentEditor);
    }, 'executeSelectedCommand');
  }

  // Remove slash and query text from editor
  removeSlashText(editor) {
    const { state } = editor;
    const { selection } = state;
    const { $from } = selection;
    const currentLineText = $from.parent.textContent;
    const cursorPos = $from.parentOffset;
    const slashIndex = currentLineText.lastIndexOf('/', cursorPos);
    
    if (slashIndex !== -1) {
      const from = $from.pos - (cursorPos - slashIndex);
      const to = $from.pos;
      editor.chain().focus().deleteRange({ from, to }).run();
    }
  }

  // Render dropdown options with event handlers
  renderDropdown(filteredCommands, currentEditor) {
    const dropdown = this.createGlobalDropdown();
    dropdown.innerHTML = '';
    selectedIndex = 0;
    
    filteredCommands.forEach((cmd, index) => {
      const item = document.createElement('div');
      item.className = CONFIG.CLASSES.ITEM;
      
      item.style.cssText = `
        padding: 8px 12px;
        cursor: pointer;
        border-bottom: 1px solid #f3f4f6;
        display: flex;
        align-items: center;
        gap: 8px;
      `;
      
      item.innerHTML = `
        <span style="font-size: 16px;">${cmd.icon}</span>
        <div style="font-weight: 500; font-size: 14px;">${cmd.title}</div>
      `;
      
      item.addEventListener('mouseenter', () => {
        selectedIndex = index;
        this.updateSelectedItem();
      });
      
      item.addEventListener('click', () => {
        selectedIndex = index;
        this.executeSelectedCommand(currentEditor, filteredCommands);
      });
      
      dropdown.appendChild(item);
    });
    
    this.updateSelectedItem();
  }

  // Show dropdown at specified coordinates
  showDropdown(x, y, query = '', currentEditor) {
    const filteredCommands = Utils.filterCommands(this.commands, query);
    
    if (filteredCommands.length === 0) {
      this.hideDropdown();
      return;
    }
    
    this.renderDropdown(filteredCommands, currentEditor);
    const dropdown = this.createGlobalDropdown();
    
    const rhinoElement = currentEditor.view.dom.closest(CONFIG.SELECTORS.RHINO_EDITOR);
    const dialogElement = rhinoElement?.closest('dialog');
    
    if (dialogElement) {
      if (dropdown.parentNode === document.body) {
        document.body.removeChild(dropdown);
      }
      dialogElement.appendChild(dropdown);
      
      const dialogRect = dialogElement.getBoundingClientRect();
      const adjustedX = x - dialogRect.left;
      const adjustedY = y - dialogRect.top;
      
      dropdown.style.position = 'absolute';
      dropdown.style.left = adjustedX + 'px';
      dropdown.style.top = (adjustedY + CONFIG.DROPDOWN.OFFSET_Y) + 'px';
      dropdown.style.zIndex = '1000';
    } else {
      if (dropdown.parentNode !== document.body) {
        if (dropdown.parentNode) {
          dropdown.parentNode.removeChild(dropdown);
        }
        document.body.appendChild(dropdown);
      }
      
      dropdown.style.position = 'absolute';
      dropdown.style.left = x + 'px';
      dropdown.style.top = (y + CONFIG.DROPDOWN.OFFSET_Y) + 'px';
      dropdown.style.zIndex = '1000';
    }
    
    dropdown.style.display = 'block';
    isDropdownOpen = true;
    
    dropdown.filteredCommands = filteredCommands;
    dropdown.currentEditor = currentEditor;
  }

  // Hide dropdown and reset state
  hideDropdown() {
    if (globalDropdown) {
      globalDropdown.style.display = 'none';
      globalDropdown.filteredCommands = null;
      globalDropdown.currentEditor = null;
      
      if (globalDropdown.parentNode) {
        globalDropdown.parentNode.removeChild(globalDropdown);
      }
    }
    isDropdownOpen = false;
    selectedIndex = -1;
  }
}

export { CONFIG, RhinoSlashCommands as default, defaultCommands };
