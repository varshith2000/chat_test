# Production Workflow Management System

A React-based web application for managing and visualizing production workflows with multiple stages, goods tracking, and wastage management.

## Features

- 🏭 Multi-stage production workflow management
- 📊 Visual flow diagram representation
- 🔄 Input/output goods tracking
- ⚠️ Wastage monitoring
- 📝 Edit and review capabilities
- 🖨️ Print-friendly summaries
- 💾 Data persistence
- 🎨 Modern, responsive UI

## Tech Stack

- React (Frontend Framework)
- Vite (Build Tool)
- Web Components (Custom Elements)
- CSS3 (Styling)

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd chat_test
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## Usage Guide

### Creating a New Workflow

1. Launch the application
2. Click on the chat bubble icon to open the interface
3. Log in with your credentials
4. Select the number of production stages
5. For each stage, input:
   - Raw/Intermediate goods
   - Production details
   - Output goods
   - Wastage information

### Editing a Workflow

- Use the "Edit Workflow" button to modify the entire workflow
- Use individual stage edit buttons to modify specific stages
- All changes are validated in real-time

### Submitting a Workflow

1. Fill in all required fields
2. Click "Submit Workflow"
3. Review the summary
4. Confirm submission

### Printing

- Use the print button in the summary view for a printer-friendly version

## Project Structure

```
chat_test/
├── src/
│   ├── components/
│   │   ├── Chat_Components.jsx      # Main chat interface
│   │   ├── Production_Stage.jsx     # Stage input component
│   │   ├── Production_Summary.jsx   # Summary view
│   │   ├── Stage_Flow.jsx          # Flow diagram
│   │   ├── Stage_Selector.jsx      # Stage number selector
│   │   ├── Goods_Input_Row.jsx     # Goods input interface
│   │   ├── Wastage_Fields.jsx      # Wastage input interface
│   │   └── Confirmation_Modal.jsx   # Confirmation dialogs
│   ├── App.jsx                      # Root component
│   └── main.jsx                     # Entry point
├── public/                          # Static assets
├── package.json
└── vite.config.js
```

## Features in Detail

### Production Stages
- Dynamic stage creation
- Flexible goods input
- Wastage tracking
- Time tracking
- Outsourcing options

### Data Visualization
- Interactive flow diagram
- Stage-wise breakdown
- Clear input/output representation
- Wastage indicators

### User Interface
- Responsive design
- Intuitive navigation
- Real-time validation
- Error handling

## Component Communication

The application uses custom events for component communication:
- `select`: Triggered when selecting number of stages
- `complete`: Fired when a stage is completed
- `edit`: Used for editing individual stages
- `edit-workflow`: For editing the entire workflow
- `submit-workflow`: Handles final submission
- `reset`: Resets the workflow to initial state

## Data Flow

1. User inputs are collected at each stage
2. Data is validated in real-time
3. Stage completion triggers state updates
4. Summary view shows consolidated data
5. Final submission formats data for backend

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
