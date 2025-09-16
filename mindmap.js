/**
 * MindMap Creator - Interactive mindmap application
 * Allows users to create, edit, connect, and manage mindmap nodes
 */

class MindMapCreator {
    constructor() {
        // Core application state
        this.nodes = new Map();
        this.connections = new Map();
        this.selectedNodes = new Set();
        this.selectedConnections = new Set();
        this.currentTool = 'select';
        this.isConnecting = false;
        this.connectionStart = null;
        this.tempConnection = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.nodeCounter = 0;
        this.connectionCounter = 0;
        this.zoom = 1;
        this.pan = { x: 0, y: 0 };

        // DOM elements
        this.canvas = document.getElementById('mindmapCanvas');
        this.nodesLayer = document.getElementById('nodesLayer');
        this.connectionsLayer = document.getElementById('connectionsLayer');
        this.connectionOverlay = document.getElementById('connectionOverlay');

        // Initialize the application
        this.init();
    }

    /**
     * Initialize the mindmap application
     */
    init() {
        this.setupEventListeners();
        this.setupToolbar();
        this.setupModals();
        
        // Wait for DOM to be fully rendered before creating welcome node
        setTimeout(() => {
            this.createWelcomeNode();
        }, 100);
        
        // Show instructions panel initially
        setTimeout(() => {
            document.getElementById('instructionsPanel').style.display = 'block';
        }, 1000);
    }

    /**
     * Set up all event listeners for the application
     */
    setupEventListeners() {
        // Canvas events
        this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));
        this.canvas.addEventListener('mousemove', this.handleCanvasMouseMove.bind(this));
        this.canvas.addEventListener('mousedown', this.handleCanvasMouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this.handleCanvasMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this.handleCanvasWheel.bind(this));

        // Keyboard events
        document.addEventListener('keydown', this.handleKeyDown.bind(this));

        // Window events
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    /**
     * Set up toolbar functionality
     */
    setupToolbar() {
        // Tool selection
        document.getElementById('selectTool').addEventListener('click', () => this.setTool('select'));
        document.getElementById('nodeTool').addEventListener('click', () => this.setTool('node'));
        document.getElementById('connectionTool').addEventListener('click', () => this.setTool('connection'));

        // Actions
        document.getElementById('deleteBtn').addEventListener('click', () => this.deleteSelected());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAll());
        
        // Zoom controls
        document.getElementById('zoomInBtn').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoomOutBtn').addEventListener('click', () => this.zoomOut());
        document.getElementById('resetZoomBtn').addEventListener('click', () => this.resetZoom());

        // Save/Load
        document.getElementById('saveBtn').addEventListener('click', () => this.showSaveModal());
        document.getElementById('loadBtn').addEventListener('click', () => this.showLoadModal());

        // Instructions
        document.getElementById('closeInstructions').addEventListener('click', () => {
            document.getElementById('instructionsPanel').style.display = 'none';
        });
    }

    /**
     * Set up modal functionality
     */
    setupModals() {
        // Node edit modal
        const nodeModal = document.getElementById('nodeEditModal');
        document.getElementById('closeModal').addEventListener('click', () => this.hideNodeModal());
        document.getElementById('cancelEdit').addEventListener('click', () => this.hideNodeModal());
        document.getElementById('saveEdit').addEventListener('click', () => this.saveNodeEdit());

        // Node color presets
        document.querySelectorAll('#nodeColorPresets .color-preset').forEach(preset => {
            preset.addEventListener('click', (e) => {
                document.getElementById('nodeColor').value = e.target.dataset.color;
                document.querySelectorAll('#nodeColorPresets .color-preset').forEach(p => p.classList.remove('selected'));
                e.target.classList.add('selected');
            });
        });

        // Text color presets
        document.querySelectorAll('#textColorPresets .color-preset').forEach(preset => {
            preset.addEventListener('click', (e) => {
                document.getElementById('textColor').value = e.target.dataset.color;
                document.querySelectorAll('#textColorPresets .color-preset').forEach(p => p.classList.remove('selected'));
                e.target.classList.add('selected');
            });
        });

        // Shape selector
        document.querySelectorAll('.shape-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const shape = e.currentTarget.dataset.shape;
                document.querySelectorAll('.shape-option').forEach(opt => opt.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                // Store selected shape for saving
                this.selectedShape = shape;
            });
        });

        // Save/Load modal
        const saveLoadModal = document.getElementById('saveLoadModal');
        document.getElementById('closeSaveLoadModal').addEventListener('click', () => this.hideSaveLoadModal());
        document.getElementById('cancelSaveLoad').addEventListener('click', () => this.hideSaveLoadModal());
        document.getElementById('confirmSaveLoad').addEventListener('click', () => this.handleSaveLoad());

        // Close modals on backdrop click
        [nodeModal, saveLoadModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        });
    }

    /**
     * Create a welcome node to get users started
     */
    createWelcomeNode() {
        const centerX = this.canvas.clientWidth / 2;
        const centerY = this.canvas.clientHeight / 2;
        console.log('Creating welcome node at:', centerX, centerY);
        console.log('Canvas dimensions:', this.canvas.clientWidth, this.canvas.clientHeight);
        console.log('NodesLayer element:', this.nodesLayer);
        this.createNode(centerX, centerY, 'Welcome to MindMap!', '#4A90E2', '#FFFFFF', 'circle');
    }

    /**
     * Set the current tool
     */
    setTool(tool) {
        this.currentTool = tool;
        
        // Update toolbar UI
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(tool + 'Tool').classList.add('active');
        
        // Update canvas cursor
        this.canvas.setAttribute('class', 'mindmap-canvas');
        if (tool === 'select') {
            this.canvas.classList.add('select-mode');
        }
        
        // Reset connection state
        this.isConnecting = false;
        this.connectionStart = null;
        this.clearTempConnection();
    }

    /**
     * Handle canvas click events
     */
    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.currentTool === 'node') {
            // Adjust coordinates for zoom and pan
            const adjustedX = (x / this.zoom) - this.pan.x;
            const adjustedY = (y / this.zoom) - this.pan.y;
            this.createNode(adjustedX, adjustedY, 'New Node', '#4A90E2', '#FFFFFF', 'circle');
        } else if (this.currentTool === 'select') {
            if (!e.target.closest('.mindmap-node')) {
                this.clearSelection();
            }
        }
    }

    /**
     * Handle canvas mouse move events
     */
    handleCanvasMouseMove(e) {
        if (this.isDragging && this.selectedNodes.size > 0) {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = (e.clientX - rect.left) / this.zoom - this.pan.x;
            const mouseY = (e.clientY - rect.top) / this.zoom - this.pan.y;
            
            // Calculate new position by subtracting the offset
            const newX = mouseX - this.dragOffset.x;
            const newY = mouseY - this.dragOffset.y;
            
            this.selectedNodes.forEach(nodeId => {
                this.moveNode(nodeId, newX, newY);
            });
        }

        if (this.isConnecting && this.connectionStart) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.updateTempConnection(x, y);
        }
    }

    /**
     * Handle canvas mouse down events
     */
    handleCanvasMouseDown(e) {
        if (e.target.closest('.mindmap-node') && this.currentTool === 'select') {
            const nodeElement = e.target.closest('.mindmap-node');
            const nodeId = nodeElement.getAttribute('data-node-id');
            const node = this.nodes.get(nodeId);
            
            if (node) {
                // Don't interfere with Ctrl+Click selection - let handleNodeClick handle it
                if (!e.ctrlKey && !e.metaKey) {
                    // Only clear and select for dragging if not using Ctrl+Click
                    if (!this.selectedNodes.has(nodeId)) {
                        this.clearSelection();
                        this.selectedNodes.add(nodeId);
                        this.updateNodeSelection(nodeId, true);
                    }
                } else {
                    // For Ctrl+Click, don't do anything here - let the click handler manage selection
                    return;
                }
                
                // Start dragging immediately
                this.isDragging = true;
                const rect = this.canvas.getBoundingClientRect();
                const mouseX = (e.clientX - rect.left) / this.zoom - this.pan.x;
                const mouseY = (e.clientY - rect.top) / this.zoom - this.pan.y;
                this.dragOffset.x = mouseX - node.x;
                this.dragOffset.y = mouseY - node.y;
                
                this.canvas.classList.add('dragging');
                
                // Prevent the click event from firing
                e.preventDefault();
                e.stopPropagation();
            }
        }
    }

    /**
     * Handle canvas mouse up events
     */
    handleCanvasMouseUp(e) {
        this.isDragging = false;
        this.canvas.classList.remove('dragging');
    }

    /**
     * Handle canvas wheel events for zooming
     */
    handleCanvasWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.zoom *= delta;
        this.zoom = Math.max(0.1, Math.min(3, this.zoom));
        this.updateTransform();
    }

    /**
     * Handle keyboard events
     */
    handleKeyDown(e) {
        // Don't handle global shortcuts when editing text in modals or inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            // Only handle Ctrl+S for save when in input fields
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.showSaveModal();
            }
            return;
        }

        if (e.key === 'Delete' || e.key === 'Backspace') {
            this.deleteSelected();
        } else if (e.key === 'Escape') {
            this.clearSelection();
            this.setTool('select');
        } else if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            this.showSaveModal();
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Update canvas dimensions and redraw
        this.updateConnections();
    }

    /**
     * Create a new node
     */
    createNode(x, y, text = 'New Node', color = '#4A90E2', textColor = '#FFFFFF', shape = 'circle') {
        const nodeId = `node_${++this.nodeCounter}`;
        
        // Calculate dynamic size based on text content and shape
        const words = text.split(' ');
        const longestWord = Math.max(...words.map(word => word.length));
        const totalWords = words.length;
        
        // Base size calculation considering word count and longest word
        const minSize = 60;
        let baseSize = Math.max(minSize, longestWord * 8 + totalWords * 4);
        
        // For circles, increase size to account for circular geometry constraints
        if (shape === 'circle') {
            baseSize = baseSize * 1.4; // 40% larger for circles to prevent corner spillage
        }
        
        const size = baseSize;
        
        const node = {
            id: nodeId,
            x: x,
            y: y,
            text: text,
            color: color,
            textColor: textColor,
            shape: shape,
            size: size,
            // For backwards compatibility
            radius: size
        };

        console.log('Creating node:', node);
        this.nodes.set(nodeId, node);
        this.renderNode(node);
        console.log('Node created and rendered');
        return nodeId;
    }

    /**
     * Render a node on the canvas
     */
    renderNode(node) {
        const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        nodeGroup.classList.add('mindmap-node');
        nodeGroup.setAttribute('data-node-id', node.id);
        nodeGroup.setAttribute('transform', `translate(${node.x}, ${node.y})`);

        // Create shape based on node type
        const shape = this.createNodeShape(node);
        nodeGroup.appendChild(shape);

        // Create text with proper wrapping
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.classList.add('node-text');
        this.renderWrappedText(text, node.text, node.size, node.textColor, node.shape);
        
        nodeGroup.appendChild(text);

        // Add event listeners
        nodeGroup.addEventListener('click', (e) => this.handleNodeClick(e, node.id));
        nodeGroup.addEventListener('dblclick', (e) => this.editNode(node.id));

        this.nodesLayer.appendChild(nodeGroup);
    }

    /**
     * Create the appropriate SVG shape for a node
     */
    createNodeShape(node) {
        const shape = node.shape || 'circle';
        const size = node.size || node.radius || 40;
        
        let element;
        
        switch (shape) {
            case 'square':
                element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                element.classList.add('node-shape', 'node-square');
                element.setAttribute('x', -size/2);
                element.setAttribute('y', -size/2);
                element.setAttribute('width', size);
                element.setAttribute('height', size);
                element.setAttribute('rx', 8);
                break;
                
            case 'rectangle':
                element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                element.classList.add('node-shape', 'node-rectangle');
                const rectWidth = size * 1.6;
                const rectHeight = size * 0.8;
                element.setAttribute('x', -rectWidth/2);
                element.setAttribute('y', -rectHeight/2);
                element.setAttribute('width', rectWidth);
                element.setAttribute('height', rectHeight);
                element.setAttribute('rx', 8);
                break;
                
            default: // circle
                element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                element.classList.add('node-shape', 'node-circle');
                element.setAttribute('r', size/2);
                break;
        }
        
        element.setAttribute('fill', node.color);
        element.setAttribute('stroke', 'rgba(255, 255, 255, 0.8)');
        element.setAttribute('stroke-width', '2');
        
        return element;
    }

    /**
     * Handle node click events
     */
    handleNodeClick(e, nodeId) {
        console.log('Node clicked:', nodeId, 'Tool:', this.currentTool, 'CtrlKey:', e.ctrlKey, 'MetaKey:', e.metaKey);
        e.stopPropagation();
        
        if (this.currentTool === 'connection') {
            if (!this.isConnecting) {
                this.startConnection(nodeId);
            } else if (this.connectionStart !== nodeId) {
                this.completeConnection(nodeId);
            }
        } else if (this.currentTool === 'select') {
            if (e.ctrlKey || e.metaKey) {
                // Ctrl+Click or Cmd+Click for multiple selection
                console.log('Ctrl+Click detected, toggling selection');
                this.toggleNodeSelection(nodeId);
            } else {
                // Regular click - clear other selections and select this node
                console.log('Regular click, selecting single node');
                this.selectNode(nodeId);
            }
        }
    }

    /**
     * Start creating a connection
     */
    startConnection(nodeId) {
        this.isConnecting = true;
        this.connectionStart = nodeId;
        this.selectNode(nodeId);
    }

    /**
     * Complete creating a connection
     */
    completeConnection(nodeId) {
        if (this.connectionStart && this.connectionStart !== nodeId) {
            this.createConnection(this.connectionStart, nodeId);
        }
        this.isConnecting = false;
        this.connectionStart = null;
        this.clearTempConnection();
    }

    /**
     * Create a connection between two nodes
     */
    createConnection(startNodeId, endNodeId) {
        const connectionId = `connection_${++this.connectionCounter}`;
        const connection = {
            id: connectionId,
            start: startNodeId,
            end: endNodeId
        };

        this.connections.set(connectionId, connection);
        this.renderConnection(connection);
        return connectionId;
    }

    /**
     * Render a connection on the canvas
     */
    renderConnection(connection) {
        const startNode = this.nodes.get(connection.start);
        const endNode = this.nodes.get(connection.end);
        
        if (!startNode || !endNode) return;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.classList.add('connection-line');
        line.setAttribute('data-connection-id', connection.id);
        line.setAttribute('x1', startNode.x);
        line.setAttribute('y1', startNode.y);
        line.setAttribute('x2', endNode.x);
        line.setAttribute('y2', endNode.y);

        line.addEventListener('click', (e) => this.handleConnectionClick(e, connection.id));

        this.connectionsLayer.appendChild(line);
    }

    /**
     * Handle connection click events
     */
    handleConnectionClick(e, connectionId) {
        e.stopPropagation();
        if (this.currentTool === 'select') {
            this.selectConnection(connectionId);
        }
    }

    /**
     * Update temporary connection line
     */
    updateTempConnection(x, y) {
        if (!this.connectionStart) return;

        const startNode = this.nodes.get(this.connectionStart);
        if (!startNode) return;

        this.clearTempConnection();

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.classList.add('temp-connection');
        line.setAttribute('x1', startNode.x);
        line.setAttribute('y1', startNode.y);
        line.setAttribute('x2', x);
        line.setAttribute('y2', y);

        this.connectionsLayer.appendChild(line);
        this.tempConnection = line;
    }

    /**
     * Clear temporary connection line
     */
    clearTempConnection() {
        if (this.tempConnection) {
            this.tempConnection.remove();
            this.tempConnection = null;
        }
    }

    /**
     * Select a node
     */
    selectNode(nodeId) {
        this.clearSelection();
        this.selectedNodes.add(nodeId);
        this.updateNodeSelection(nodeId, true);
    }

    /**
     * Toggle node selection
     */
    toggleNodeSelection(nodeId) {
        console.log('Toggle selection for node:', nodeId, 'Currently selected:', Array.from(this.selectedNodes));
        if (this.selectedNodes.has(nodeId)) {
            this.selectedNodes.delete(nodeId);
            this.updateNodeSelection(nodeId, false);
        } else {
            this.selectedNodes.add(nodeId);
            this.updateNodeSelection(nodeId, true);
        }
        console.log('After toggle, selected nodes:', Array.from(this.selectedNodes));
    }

    /**
     * Select a connection
     */
    selectConnection(connectionId) {
        this.clearSelection();
        this.selectedConnections.add(connectionId);
        this.updateConnectionSelection(connectionId, true);
    }

    /**
     * Update node selection visual state
     */
    updateNodeSelection(nodeId, selected) {
        const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
        console.log('Updating node selection:', nodeId, 'selected:', selected, 'element found:', !!nodeElement);
        if (nodeElement) {
            if (selected) {
                nodeElement.classList.add('selected');
                console.log('Added selected class to node:', nodeId);
            } else {
                nodeElement.classList.remove('selected');
                console.log('Removed selected class from node:', nodeId);
            }
        }
    }

    /**
     * Update connection selection visual state
     */
    updateConnectionSelection(connectionId, selected) {
        const connectionElement = document.querySelector(`[data-connection-id="${connectionId}"]`);
        if (connectionElement) {
            if (selected) {
                connectionElement.classList.add('selected');
            } else {
                connectionElement.classList.remove('selected');
            }
        }
    }

    /**
     * Clear all selections
     */
    clearSelection() {
        this.selectedNodes.forEach(nodeId => this.updateNodeSelection(nodeId, false));
        this.selectedConnections.forEach(connectionId => this.updateConnectionSelection(connectionId, false));
        this.selectedNodes.clear();
        this.selectedConnections.clear();
    }

    /**
     * Move a node to new position
     */
    moveNode(nodeId, x, y) {
        const node = this.nodes.get(nodeId);
        if (!node) return;

        node.x = x;
        node.y = y;

        // Update node position
        const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
        if (nodeElement) {
            nodeElement.setAttribute('transform', `translate(${x}, ${y})`);
        }

        // Update connected lines
        this.updateNodeConnections(nodeId);
    }

    /**
     * Update connections for a specific node
     */
    updateNodeConnections(nodeId) {
        this.connections.forEach(connection => {
            if (connection.start === nodeId || connection.end === nodeId) {
                this.updateConnectionPosition(connection.id);
            }
        });
    }

    /**
     * Update connection position
     */
    updateConnectionPosition(connectionId) {
        const connection = this.connections.get(connectionId);
        if (!connection) return;

        const startNode = this.nodes.get(connection.start);
        const endNode = this.nodes.get(connection.end);
        if (!startNode || !endNode) return;

        const connectionElement = document.querySelector(`[data-connection-id="${connectionId}"]`);
        if (connectionElement) {
            connectionElement.setAttribute('x1', startNode.x);
            connectionElement.setAttribute('y1', startNode.y);
            connectionElement.setAttribute('x2', endNode.x);
            connectionElement.setAttribute('y2', endNode.y);
        }
    }

    /**
     * Update all connections
     */
    updateConnections() {
        this.connections.forEach(connection => {
            this.updateConnectionPosition(connection.id);
        });
    }

    /**
     * Edit a node or multiple nodes
     */
    editNode(nodeId) {
        // Check if multiple nodes are selected
        if (this.selectedNodes.size > 1) {
            this.editMultipleNodes();
            return;
        }
        
        const node = this.nodes.get(nodeId);
        if (!node) return;

        this.currentEditingNode = nodeId;
        document.getElementById('nodeText').value = node.text;
        document.getElementById('nodeColor').value = node.color;
        document.getElementById('textColor').value = node.textColor || '#FFFFFF';
        
        // Update color preset selection for node color
        document.querySelectorAll('#nodeColorPresets .color-preset').forEach(preset => {
            preset.classList.toggle('selected', preset.dataset.color === node.color);
        });
        
        // Update color preset selection for text color
        document.querySelectorAll('#textColorPresets .color-preset').forEach(preset => {
            preset.classList.toggle('selected', preset.dataset.color === (node.textColor || '#FFFFFF'));
        });
        
        // Update shape selection
        const nodeShape = node.shape || 'circle';
        document.querySelectorAll('.shape-option').forEach(option => {
            option.classList.toggle('selected', option.dataset.shape === nodeShape);
        });
        this.selectedShape = nodeShape;

        this.showNodeModal();
    }

    /**
     * Edit multiple selected nodes
     */
    editMultipleNodes() {
        // Get first selected node for default values
        const firstNodeId = Array.from(this.selectedNodes)[0];
        const firstNode = this.nodes.get(firstNodeId);
        
        this.currentEditingNodes = Array.from(this.selectedNodes);
        
        // Hide text input for multiple selection
        const textInput = document.getElementById('nodeText');
        const textLabel = textInput.previousElementSibling;
        textInput.style.display = 'none';
        textLabel.style.display = 'none';
        
        // Set default values from first node
        document.getElementById('nodeColor').value = firstNode.color;
        document.getElementById('textColor').value = firstNode.textColor || '#FFFFFF';
        
        // Update color preset selection for node color
        document.querySelectorAll('#nodeColorPresets .color-preset').forEach(preset => {
            preset.classList.toggle('selected', preset.dataset.color === firstNode.color);
        });
        
        // Update color preset selection for text color
        document.querySelectorAll('#textColorPresets .color-preset').forEach(preset => {
            preset.classList.toggle('selected', preset.dataset.color === (firstNode.textColor || '#FFFFFF'));
        });
        
        // Update shape selection
        const nodeShape = firstNode.shape || 'circle';
        document.querySelectorAll('.shape-option').forEach(option => {
            option.classList.toggle('selected', option.dataset.shape === nodeShape);
        });
        this.selectedShape = nodeShape;

        this.showNodeModal();
    }

    /**
     * Show node edit modal
     */
    showNodeModal() {
        document.getElementById('nodeEditModal').classList.add('show');
        // Only focus text input if it's visible (single node editing)
        const textInput = document.getElementById('nodeText');
        if (textInput.style.display !== 'none') {
            textInput.focus();
        }
    }

    /**
     * Hide node edit modal
     */
    hideNodeModal() {
        document.getElementById('nodeEditModal').classList.remove('show');
        this.currentEditingNode = null;
        this.currentEditingNodes = null;
        
        // Show text input again for next time
        const textInput = document.getElementById('nodeText');
        const textLabel = textInput.previousElementSibling;
        textInput.style.display = '';
        textLabel.style.display = '';
    }

    /**
     * Save node edit
     */
    saveNodeEdit() {
        // Handle multiple node editing
        if (this.currentEditingNodes && this.currentEditingNodes.length > 1) {
            this.saveMultipleNodeEdit();
            return;
        }
        
        if (!this.currentEditingNode) return;

        const node = this.nodes.get(this.currentEditingNode);
        if (!node) return;

        const newText = document.getElementById('nodeText').value.trim();
        const newColor = document.getElementById('nodeColor').value;
        const newTextColor = document.getElementById('textColor').value;
        const newShape = this.selectedShape || node.shape || 'circle';

        // Always update properties
        node.color = newColor;
        node.textColor = newTextColor;
        node.shape = newShape;

        // Update text if provided, otherwise keep existing text
        if (newText) {
            node.text = newText;
        }

        // Always recalculate size based on current text content and shape
        const words = node.text.split(' ');
        const longestWord = Math.max(...words.map(word => word.length));
        const totalWords = words.length;
        
        // Base size calculation considering word count and longest word
        const minSize = 60;
        let baseSize = Math.max(minSize, longestWord * 8 + totalWords * 4);
        
        // For circles, increase size to account for circular geometry constraints
        if (node.shape === 'circle') {
            baseSize = baseSize * 1.4; // 40% larger for circles to prevent corner spillage
        }
        
        node.size = baseSize;
        node.radius = node.size; // For backwards compatibility

        // Re-render the entire node to apply shape changes
        const nodeElement = document.querySelector(`[data-node-id="${this.currentEditingNode}"]`);
        if (nodeElement) {
            // Remove the old node and create a new one
            nodeElement.remove();
            this.renderNode(node);
        }

        this.hideNodeModal();
    }

    /**
     * Save multiple node edit
     */
    saveMultipleNodeEdit() {
        const newColor = document.getElementById('nodeColor').value;
        const newTextColor = document.getElementById('textColor').value;
        const newShape = this.selectedShape;

        // Update all selected nodes
        this.currentEditingNodes.forEach(nodeId => {
            const node = this.nodes.get(nodeId);
            if (!node) return;

            // Always update properties (but not text for multiple selection)
            node.color = newColor;
            node.textColor = newTextColor;
            if (newShape) {
                node.shape = newShape;
            }

            // Recalculate size based on current text and new shape
            const words = node.text.split(' ');
            const longestWord = Math.max(...words.map(word => word.length));
            const totalWords = words.length;
            
            const minSize = 60;
            let baseSize = Math.max(minSize, longestWord * 8 + totalWords * 4);
            
            if (node.shape === 'circle') {
                baseSize = baseSize * 1.4;
            }
            
            node.size = baseSize;
            node.radius = node.size;

            // Re-render the node
            const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
            if (nodeElement) {
                nodeElement.remove();
                this.renderNode(node);
            }
        });

        this.hideNodeModal();
    }

    /**
     * Delete selected nodes and connections
     */
    deleteSelected() {
        // Delete selected connections
        this.selectedConnections.forEach(connectionId => {
            this.deleteConnection(connectionId);
        });

        // Delete selected nodes
        this.selectedNodes.forEach(nodeId => {
            this.deleteNode(nodeId);
        });

        this.clearSelection();
    }

    /**
     * Delete a node and its connections
     */
    deleteNode(nodeId) {
        // Delete all connections to this node
        const connectionsToDelete = [];
        this.connections.forEach((connection, connectionId) => {
            if (connection.start === nodeId || connection.end === nodeId) {
                connectionsToDelete.push(connectionId);
            }
        });

        connectionsToDelete.forEach(connectionId => {
            this.deleteConnection(connectionId);
        });

        // Delete the node
        this.nodes.delete(nodeId);
        const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
        if (nodeElement) {
            nodeElement.remove();
        }
    }

    /**
     * Delete a connection
     */
    deleteConnection(connectionId) {
        this.connections.delete(connectionId);
        const connectionElement = document.querySelector(`[data-connection-id="${connectionId}"]`);
        if (connectionElement) {
            connectionElement.remove();
        }
    }

    /**
     * Clear all nodes and connections
     */
    clearAll() {
        if (confirm('Are you sure you want to clear the entire mindmap?')) {
            this.nodes.clear();
            this.connections.clear();
            this.clearSelection();
            this.nodesLayer.innerHTML = '';
            this.connectionsLayer.innerHTML = '';
            this.nodeCounter = 0;
            this.connectionCounter = 0;
        }
    }

    /**
     * Zoom in
     */
    zoomIn() {
        this.zoom = Math.min(3, this.zoom * 1.2);
        this.updateTransform();
    }

    /**
     * Zoom out
     */
    zoomOut() {
        this.zoom = Math.max(0.1, this.zoom / 1.2);
        this.updateTransform();
    }

    /**
     * Reset zoom
     */
    resetZoom() {
        this.zoom = 1;
        this.pan = { x: 0, y: 0 };
        this.updateTransform();
    }

    /**
     * Update canvas transform
     */
    updateTransform() {
        const transform = `scale(${this.zoom}) translate(${this.pan.x}px, ${this.pan.y}px)`;
        this.nodesLayer.style.transform = transform;
        this.connectionsLayer.style.transform = transform;
    }

    /**
     * Show save modal
     */
    showSaveModal() {
        document.getElementById('saveLoadTitle').textContent = 'Save MindMap';
        document.getElementById('saveSection').style.display = 'block';
        document.getElementById('loadSection').style.display = 'none';
        document.getElementById('confirmSaveLoad').textContent = 'Save';
        
        const projectTitle = document.getElementById('projectTitle').value || 'Untitled MindMap';
        document.getElementById('saveFileName').value = projectTitle;
        
        this.loadSavedFilesList('save');
        document.getElementById('saveLoadModal').classList.add('show');
    }

    /**
     * Show load modal
     */
    showLoadModal() {
        document.getElementById('saveLoadTitle').textContent = 'Load MindMap';
        document.getElementById('saveSection').style.display = 'none';
        document.getElementById('loadSection').style.display = 'block';
        document.getElementById('confirmSaveLoad').textContent = 'Load';
        
        this.loadSavedFilesList('load');
        document.getElementById('saveLoadModal').classList.add('show');
    }

    /**
     * Hide save/load modal
     */
    hideSaveLoadModal() {
        document.getElementById('saveLoadModal').classList.remove('show');
    }

    /**
     * Handle save/load action
     */
    handleSaveLoad() {
        const title = document.getElementById('saveLoadTitle').textContent;
        if (title.includes('Save')) {
            this.saveMindMap();
        } else {
            this.loadMindMap();
        }
    }

    /**
     * Save mindmap to localStorage
     */
    saveMindMap() {
        const fileName = document.getElementById('saveFileName').value.trim();
        if (!fileName) {
            alert('Please enter a file name');
            return;
        }

        const mindmapData = {
            title: fileName,
            nodes: Array.from(this.nodes.entries()),
            connections: Array.from(this.connections.entries()),
            nodeCounter: this.nodeCounter,
            connectionCounter: this.connectionCounter,
            savedAt: new Date().toISOString()
        };

        const savedMaps = JSON.parse(localStorage.getItem('mindmaps') || '{}');
        savedMaps[fileName] = mindmapData;
        localStorage.setItem('mindmaps', JSON.stringify(savedMaps));

        document.getElementById('projectTitle').value = fileName;
        this.hideSaveLoadModal();
        
        // Show success message
        this.showMessage('MindMap saved successfully!', 'success');
    }

    /**
     * Load mindmap from localStorage
     */
    loadMindMap() {
        const selectedFile = document.querySelector('.saved-file-item.selected');
        if (!selectedFile) {
            alert('Please select a file to load');
            return;
        }

        const fileName = selectedFile.querySelector('.file-name').textContent;
        const savedMaps = JSON.parse(localStorage.getItem('mindmaps') || '{}');
        const mindmapData = savedMaps[fileName];

        if (!mindmapData) {
            alert('File not found');
            return;
        }

        // Clear current mindmap
        this.clearAll();

        // Load data
        this.nodes = new Map(mindmapData.nodes);
        this.connections = new Map(mindmapData.connections);
        this.nodeCounter = mindmapData.nodeCounter || 0;
        this.connectionCounter = mindmapData.connectionCounter || 0;

        // Render nodes and connections
        this.nodes.forEach(node => this.renderNode(node));
        this.connections.forEach(connection => this.renderConnection(connection));

        document.getElementById('projectTitle').value = mindmapData.title;
        this.hideSaveLoadModal();
        
        // Show success message
        this.showMessage('MindMap loaded successfully!', 'success');
    }

    /**
     * Load saved files list
     */
    loadSavedFilesList(mode) {
        const savedMaps = JSON.parse(localStorage.getItem('mindmaps') || '{}');
        const listContainer = document.getElementById(mode === 'save' ? 'savedFilesList' : 'loadFilesList');
        
        listContainer.innerHTML = '';

        Object.entries(savedMaps).forEach(([fileName, data]) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'saved-file-item';
            fileItem.innerHTML = `
                <div class="file-info">
                    <div class="file-name">${fileName}</div>
                    <div class="file-date">${new Date(data.savedAt).toLocaleString()}</div>
                </div>
                <button class="delete-file" onclick="event.stopPropagation(); mindmap.deleteSavedFile('${fileName}')">
                    <i class="fas fa-trash"></i>
                </button>
            `;

            fileItem.addEventListener('click', () => {
                document.querySelectorAll('.saved-file-item').forEach(item => item.classList.remove('selected'));
                fileItem.classList.add('selected');
                
                if (mode === 'save') {
                    document.getElementById('saveFileName').value = fileName;
                }
            });

            listContainer.appendChild(fileItem);
        });

        if (Object.keys(savedMaps).length === 0) {
            listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No saved mindmaps found</div>';
        }
    }

    /**
     * Delete a saved file
     */
    deleteSavedFile(fileName) {
        if (confirm(`Are you sure you want to delete "${fileName}"?`)) {
            const savedMaps = JSON.parse(localStorage.getItem('mindmaps') || '{}');
            delete savedMaps[fileName];
            localStorage.setItem('mindmaps', JSON.stringify(savedMaps));
            
            // Refresh the list
            const isLoadMode = document.getElementById('loadSection').style.display !== 'none';
            this.loadSavedFilesList(isLoadMode ? 'load' : 'save');
        }
    }

    /**
     * Show a temporary message
     */
    showMessage(text, type = 'info') {
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#7ED321' : type === 'error' ? '#D0021B' : '#4A90E2'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 3000;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(message);

        setTimeout(() => {
            message.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => message.remove(), 300);
        }, 3000);
    }

    /**
     * Truncate text to fit in node
     */
    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    /**
     * Render wrapped text within a node
     */
    renderWrappedText(textElement, text, size, textColor = '#FFFFFF', shape = 'circle') {
        // Calculate font size based on size
        const fontSize = Math.max(10, Math.min(16, size / 3));
        textElement.style.fontSize = `${fontSize}px`;
        textElement.setAttribute('fill', textColor);
        
        // Calculate maximum width for text based on shape
        let maxWidth;
        switch (shape) {
            case 'rectangle':
                maxWidth = (size * 1.6) * 0.9; // 90% of rectangle width
                break;
            case 'square':
                maxWidth = size * 0.9; // 90% of square width
                break;
            default: // circle
                // For circles, use inscribed square width to avoid corner spillage
                maxWidth = size * 0.7; // 70% of diameter to fit in inscribed square
                break;
        }
        
        const avgCharWidth = fontSize * 0.5; // More accurate character width
        const maxCharsPerLine = Math.floor(maxWidth / avgCharWidth);
        
        // Split text into words
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            
            if (testLine.length <= maxCharsPerLine) {
                currentLine = testLine;
            } else {
                if (currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    // Single word is too long, just add it as is - no truncation
                    lines.push(word);
                    currentLine = '';
                }
            }
        }
        
        if (currentLine) {
            lines.push(currentLine);
        }
        
        // Use all lines - no truncation based on height
        const displayLines = lines;
        
        // Create tspan elements for each line
        const lineHeight = fontSize + 2;
        const totalHeight = displayLines.length * lineHeight;
        const startY = -(totalHeight / 2) + (lineHeight / 2);
        
        displayLines.forEach((line, index) => {
            const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            tspan.textContent = line;
            tspan.setAttribute('x', '0');
            tspan.setAttribute('y', startY + (index * lineHeight));
            tspan.setAttribute('text-anchor', 'middle');
            tspan.setAttribute('dominant-baseline', 'central');
            tspan.setAttribute('fill', textColor);
            textElement.appendChild(tspan);
        });
    }

    /**
     * Wrap text based on node radius for better display (legacy method)
     */
    wrapText(text, radius) {
        // Calculate max characters that can fit in a circle
        // Use a more conservative estimate for circular text fitting
        const baseCharsPerRadius = 0.4; // More conservative ratio
        const maxChars = Math.floor(radius * baseCharsPerRadius);
        
        if (text.length <= maxChars) {
            return text;
        }
        
        // For longer text, truncate with ellipsis
        return text.substring(0, Math.max(1, maxChars - 3)) + '...';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mindmap = new MindMapCreator();
});

// Add CSS animations for messages
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
