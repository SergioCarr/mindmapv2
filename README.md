# MindMap Creator

A powerful, interactive web-based mindmap application that allows users to create, edit, and manage visual thought maps with seamless client-side functionality and local storage capabilities.

![MindMap Creator](https://img.shields.io/badge/Version-1.0.0-blue) ![License](https://img.shields.io/badge/License-MIT-green) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)

## 🚀 Features

### Core Functionality
- **Create Nodes**: Click anywhere on the canvas to add new nodes to your mindmap
- **Edit Nodes**: Double-click any node to edit its text content and color
- **Connect Nodes**: Link related ideas by connecting nodes with visual lines
- **Drag & Drop**: Reposition nodes by dragging them around the canvas
- **Delete Elements**: Remove individual nodes or connections, or clear the entire mindmap

### Advanced Features
- **Multiple Selection**: Select multiple nodes using Ctrl+Click
- **Zoom Controls**: Zoom in/out and reset view for better navigation
- **Save/Load**: Persist your mindmaps locally and load them later
- **Color Customization**: Choose from preset colors or use a custom color picker
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Keyboard Shortcuts**: Efficient workflow with keyboard shortcuts

## 🛠️ Tools & Actions

### Toolbar Tools

| Tool | Icon | Description | Usage |
|------|------|-------------|-------|
| **Select Tool** | 🖱️ | Default selection and manipulation tool | Click to select nodes, drag to move them |
| **Add Node** | ⭕ | Create new nodes | Click anywhere on canvas to add a node |
| **Connect Nodes** | 🔗 | Link nodes together | Click first node, then click second node to connect |
| **Delete** | 🗑️ | Remove selected elements | Select elements first, then click delete |
| **Clear All** | 🧹 | Clear entire mindmap | Removes all nodes and connections |
| **Zoom In** | 🔍+ | Increase canvas zoom | Zoom in for detailed work |
| **Zoom Out** | 🔍- | Decrease canvas zoom | Zoom out for overview |
| **Reset Zoom** | ↔️ | Reset to default zoom | Return to 100% zoom level |

### Header Actions

| Action | Icon | Description |
|--------|------|-------------|
| **Save** | 💾 | Save current mindmap to local storage |
| **Load** | 📁 | Load a previously saved mindmap |
| **Project Title** | ✏️ | Edit the title of your current mindmap |

## 🎯 How to Use

### Getting Started
1. **Open the Application**: Open `index.html` in your web browser
2. **Create Your First Node**: 
   - Click the "Add Node" tool (⭕) in the toolbar
   - Click anywhere on the canvas to create a node
   - Double-click the node to edit its text and color

### Creating a Mindmap
1. **Add Multiple Nodes**: Use the Add Node tool to create several nodes
2. **Connect Related Ideas**: 
   - Select the "Connect Nodes" tool (🔗)
   - Click on the first node you want to connect
   - Click on the second node to create a connection
3. **Organize Your Layout**: 
   - Switch to Select tool (🖱️)
   - Drag nodes to arrange them logically
   - Use zoom controls for better navigation

### Editing and Customization
- **Edit Node Text**: Double-click any node to open the edit dialog
- **Change Node Colors**: In the edit dialog, choose from preset colors or use the color picker
- **Select Multiple Nodes**: Hold Ctrl and click multiple nodes for batch operations
- **Delete Elements**: Select nodes or connections and press Delete key or use the delete button

### Saving and Loading
1. **Save Your Work**:
   - Click the "Save" button in the header
   - Enter a filename for your mindmap
   - Your mindmap is saved to browser's local storage
2. **Load Previous Work**:
   - Click the "Load" button
   - Select from your saved mindmaps
   - Click "Load" to restore the mindmap

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Delete` or `Backspace` | Delete selected elements |
| `Escape` | Clear selection and switch to select tool |
| `Ctrl + S` | Open save dialog |
| `Ctrl + Click` | Add to selection (multiple selection) |

## 🎨 Design Features

### Visual Design
- **Modern UI**: Clean, professional interface inspired by contemporary design principles
- **Gradient Backgrounds**: Beautiful gradient backgrounds for visual appeal
- **Smooth Animations**: Fluid transitions and hover effects
- **Responsive Layout**: Adapts to different screen sizes and devices

### User Experience
- **Intuitive Controls**: Easy-to-understand toolbar and actions
- **Visual Feedback**: Clear indication of selected elements and active tools
- **Help System**: Built-in instructions panel for new users
- **Error Prevention**: Confirmation dialogs for destructive actions

## 🏗️ Technical Architecture

### File Structure
```
mindmapv2/
├── index.html          # Main HTML structure
├── styles.css          # CSS styling and animations
├── mindmap.js          # Core JavaScript functionality
└── README.md           # Documentation (this file)
```

### Core Components

#### MindMapCreator Class
The main application class that manages:
- **State Management**: Nodes, connections, selections, and tool states
- **Event Handling**: Mouse, keyboard, and UI interactions
- **Rendering**: SVG-based node and connection visualization
- **Data Persistence**: Local storage save/load functionality

#### Key Methods
- `createNode()`: Creates new mindmap nodes
- `createConnection()`: Links nodes with connections
- `editNode()`: Opens node editing interface
- `saveMindMap()`: Persists data to localStorage
- `loadMindMap()`: Restores saved mindmaps

### Data Structure
```javascript
// Node Structure
{
  id: "node_1",
  x: 100,
  y: 200,
  text: "Node Text",
  color: "#4A90E2",
  radius: 40
}

// Connection Structure
{
  id: "connection_1",
  start: "node_1",
  end: "node_2"
}
```

## 🔧 Customization

### Adding New Colors
To add new preset colors, modify the color presets in `index.html`:
```html
<div class="color-preset" data-color="#YOUR_COLOR" style="background: #YOUR_COLOR;"></div>
```

### Modifying Node Appearance
Adjust node styling in `styles.css`:
```css
.node-circle {
  fill: #4A90E2;
  stroke: rgba(255, 255, 255, 0.8);
  stroke-width: 2;
}
```

### Extending Functionality
The modular design allows easy extension:
1. Add new tools to the toolbar
2. Implement additional node shapes
3. Add export functionality (PDF, PNG, etc.)
4. Integrate with cloud storage services

## 🌐 Browser Compatibility

- **Chrome**: ✅ Fully supported
- **Firefox**: ✅ Fully supported  
- **Safari**: ✅ Fully supported
- **Edge**: ✅ Fully supported
- **Mobile Browsers**: ✅ Responsive design

## 📱 Mobile Support

The application is fully responsive and supports:
- Touch interactions for node creation and selection
- Pinch-to-zoom functionality
- Mobile-optimized toolbar layout
- Touch-friendly button sizes

## 🔒 Privacy & Data

- **Local Storage Only**: All data is stored locally in your browser
- **No Server Communication**: Complete client-side application
- **Privacy Focused**: No data collection or external requests
- **Offline Capable**: Works without internet connection

## 🚀 Getting Started

1. **Download**: Clone or download the project files
2. **Open**: Open `index.html` in any modern web browser
3. **Start Creating**: Begin building your mindmap immediately
4. **No Installation Required**: Pure web application, no setup needed

## 🤝 Contributing

This project welcomes contributions! Areas for enhancement:
- Additional export formats
- Cloud storage integration
- Collaborative editing features
- Advanced node types and shapes
- Improved mobile experience

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

### Common Issues

**Q: My mindmap disappeared after closing the browser**
A: Make sure to save your mindmap using the Save button. Data is only persisted when explicitly saved.

**Q: I can't connect nodes**
A: Ensure you're using the Connect Nodes tool (🔗) and click on two different nodes.

**Q: The application is not responding**
A: Try refreshing the page. All data is saved locally, so saved mindmaps will persist.

### Tips for Best Experience
- Save your work frequently
- Use descriptive names for saved mindmaps
- Organize nodes logically before connecting them
- Use colors to categorize different types of ideas
- Take advantage of zoom controls for large mindmaps

---

**Created with ❤️ for visual thinkers and idea organizers**
