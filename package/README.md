# Rhino Editor Slash Commands

Notion-like slash commands for [rhino-editor](https://github.com/KonnorRogers/rhino-editor) with modern UI and comprehensive formatting options.

## Features

- 🎯 **Notion-like Interface** - Type "/" to show formatting options
- ⌨️ **Keyboard Navigation** - Arrow keys, Enter, Escape, Tab support
- 🎨 **Modern UI** - Clean dropdown with hover and selection states
- 📱 **Responsive Design** - Works on desktop and mobile
- 🔧 **Customizable** - Add/remove commands, customize styling
- 🚀 **Performance Optimized** - Single global dropdown, efficient event handling
- 🎪 **Dialog Support** - Works inside HTML `<dialog>` elements
- 🔄 **Turbo Compatible** - Full support for Rails Turbo navigation

## Installation

### Option 1: NPM Package (Recommended)

```bash
npm install rhino-editor-slash-commands
```

### Option 2: Direct Download

Download the files from the `dist/` folder and include them in your project.

## Usage

### Rails with Importmaps

1. **Add to your importmap** (`config/importmap.rb`):

```ruby
pin "rhino-editor-slash-commands", to: "rhino-editor-slash-commands.esm.js"
```

2. **Import and initialize** in your `app/javascript/application.js`:

```javascript
import RhinoSlashCommands from "rhino-editor-slash-commands";

// Initialize with default settings
const slashCommands = new RhinoSlashCommands();
slashCommands.init();
```

3. **Add the CSS** to your `app/assets/stylesheets/application.css`:

```css
@import url("rhino-editor-slash-commands/src/styles.css");
```

4. **Hide the toolbar** in your rhino-editor:

```erb
<rhino-editor input="<%= form.field_id(:content) %>">
  <div slot="toolbar"></div>
</rhino-editor>
```

### Rails with esbuild/webpack

```javascript
import RhinoSlashCommands from "rhino-editor-slash-commands";
import "rhino-editor-slash-commands/src/styles.css";

const slashCommands = new RhinoSlashCommands();
slashCommands.init();
```

### Direct Browser Usage

```html
<link
  rel="stylesheet"
  href="path/to/rhino-editor-slash-commands/src/styles.css"
/>
<script src="path/to/rhino-editor-slash-commands/dist/rhino-editor-slash-commands.min.js"></script>

<script>
  const slashCommands = new RhinoSlashCommands.default();
  slashCommands.init();
</script>
```

## Configuration

### Custom Commands

```javascript
const slashCommands = new RhinoSlashCommands({
  commands: [
    {
      title: "Custom Heading",
      icon: "<svg>...</svg>",
      command: (editor) =>
        editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
  ],
});
```

### Add Commands Dynamically

```javascript
slashCommands.addCommand({
  title: "Highlight",
  icon: "<svg>...</svg>",
  command: (editor) => editor.chain().focus().toggleHighlight().run(),
});
```

### Remove Commands

```javascript
slashCommands.removeCommand("Strikethrough");
```

### Custom Placeholder

```javascript
const slashCommands = new RhinoSlashCommands({
  placeholder: "Start typing or press / for commands...",
});
```

## Default Commands

- **Heading 1 & 2** - Create headings
- **Bold, Italic, Strikethrough** - Text formatting
- **Inline Code** - Inline code formatting
- **Bullet List, Numbered List** - List creation
- **Blockquote** - Quote blocks
- **Code Block** - Code blocks with syntax highlighting
- **Horizontal Rule** - Divider lines
- **Attach Files** - File upload integration

## Styling Customization

Override CSS custom properties to match your design:

```css
:root {
  --rhino-placeholder-color: #your-color;
  --dropdown-bg: #your-bg-color;
  --dropdown-item-selected-bg: #your-accent-color;
  /* ... other variables */
}
```

## Browser Support

- Chrome/Edge 88+
- Firefox 87+
- Safari 14+

## Framework Compatibility

- ✅ Rails with Turbo
- ✅ Rails with Stimulus
- ✅ Vanilla JavaScript
- ✅ Any framework using rhino-editor

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.

## Credits

Built for [rhino-editor](https://github.com/KonnorRogers/rhino-editor) by the Rails community.
