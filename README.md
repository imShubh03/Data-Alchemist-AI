# Data Alchemist

Data Alchemist is a React-based web application designed for intelligent resource allocation. It allows users to upload CSV or XLSX files containing data about clients, workers, and tasks, validate the data, apply business rules, set priorities, and export optimized allocations. The application features a modern, user-friendly interface built with Tailwind CSS and supports client-side rendering with Next.js.

## Features

- **Data Upload**: Upload and process CSV/XLSX files for clients, workers, and tasks with real-time validation.
- **Data Validation**: Validate uploaded data and display errors, warnings, and confidence scores.
- **Data Grid**: View and edit uploaded data in a tabular format.
- **Business Rules**: Define and manage custom business rules for resource allocation.
- **Priority Settings**: Configure weights for client priority, skill matching, workload balance, deadlines, and cost optimization.
- **Export**: Export processed data and allocations based on defined rules and priorities.
- **Responsive Design**: Fully responsive UI with a modern, minimalist aesthetic.

## Prerequisites

- Node.js (v16 or higher)
- npm or Yarn
- Next.js (configured for 'use client')
- Tailwind CSS (configured in the project)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/imShubh03/Data-Alchemist-AI.git
cd data-alchemist
```

### 2. Install Dependencies

Using **npm**:

```bash
npm install
```

Or using **Yarn**:

```bash
yarn install
```

# ⚙️ Set Up Environment

Ensure Tailwind CSS is configured in your `tailwind.config.js` and included in your CSS setup.

No additional environment variables are required for this project.

# 🧪 Run the Development Server

Using npm:
```bash
npm run dev
```

Or:
```bash
yarn dev
```

The application will be available at: [http://localhost:3000](http://localhost:3000)

# 🚀 Usage

## 🔼 Upload Data

- Navigate to the **"Upload"** tab.
- Upload **CSV** or **XLSX** files for:
  - Clients
  - Workers
  - Tasks  
  *(Max file size: 10MB each)*
- View the number of rows loaded and any validation errors.

## 📝 View and Edit Data

- Click **"View Details"** on an uploaded file to see its data in a grid.
- Edit data directly in the grid, with validation updates in real-time.

## ✅ Validate Data

- Go to the **"Validation"** tab to view detailed validation results, including errors and warnings.

## ⚖️ Configure Rules and Priorities

- Use the **"Rules"** tab to define business rules for resource allocation.
- Adjust priority weights in the **"Priorities"** tab (e.g., client priority, skill match).

## 📤 Export Results

- Navigate to the **"Export"** tab to download the processed data and optimized allocations.

## 📁 File Structure

```
data-alchemist/
├── public/                            # Static assets
│   ├── favicon.ico
│   └── logo.png

├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout with metadata
│   │   ├── page.tsx                   # Main dashboard
│   │   └── globals.css                # Tailwind CSS global styles

│   ├── components/
│   │   ├── FileUpload.tsx             # File upload component
│   │   ├── DataGrid.tsx               # Editable data grid
│   │   ├── ValidationPanel.tsx        # Validation results display
│   │   ├── BusinessRulesPanel.tsx     # Rule creation UI
│   │   ├── PriorityPanel.tsx          # Priority settings UI
│   │   ├── ExportPanel.tsx            # Export functionality
│   │   └── ui/                        # Reusable UI elements
│   │       ├── Button.tsx             # Reusable button component
│   │       ├── Input.tsx              # Reusable input component
│   │       ├── Select.tsx             # Reusable select component
│   │       ├── Slider.tsx             # Reusable slider component
│   │       └── Label.tsx              # Reusable label component

│   ├── lib/
│   │   └── gemini.ts                  # Gemini AI integration

│   ├── types/
│   │   └── index.ts                   # TypeScript interfaces

│   ├── utils/
│   │   ├── fileParser.ts              # AI-enhanced file parsing
│   │   ├── validator.ts               # Validation logic
│   │   ├── rulesEngine.ts             # Business rules processing
│   │   └── utils.ts                   # General utility functions

├── .env.local                         # Environment variables
├── .eslintrc.json                     # ESLint configuration
├── next.config.mjs                    # Next.js configuration
├── package.json                       # Project dependencies and scripts
├── tailwind.config.ts                 # Tailwind CSS configuration
├── tsconfig.json                      # TypeScript configuration
└── README.md                          # Project documentation
```
## 📦 Dependencies

- **React** – Frontend UI library  
- **Next.js** – Framework for server-side rendering and routing  
- **Tailwind CSS** – Utility-first CSS framework for styling  
- **TypeScript** – Strongly typed language for improved developer experience  
- **Custom Components**:
  - `FileUpload`
  - `DataGrid`
  - `ValidationPanel`
  - `BusinessRulesPanel`
  - `PriorityPanel`
  - `ExportPanel`
- **Custom Types**:
  - `FileProcessingResult`
  - `ValidationResult`
  - etc.
- **Custom Validator**:
  - `dataValidator`

---

## 🎯 Milestone Completion

### ✅ Milestone 1: Core Features –
- AI-powered data ingestion with header mapping  
- Comprehensive validation engine (12+ rules)  
- Interactive data grids with inline editing  
- Real-time validation feedback  
- Natural language search framework  

### ✅ Milestone 2: Business Logic –
- Business rules interface framework  
- Priority weight management structure  
- Export configuration system  

### ✅ Milestone 3: Advanced AI –
- AI-based error correction suggestions  

## 🤝 Contributing

Contributions are welcome! Follow these steps:

1. **Fork** the repository.
2. Create a **feature branch**:
   ```bash
   git checkout -b feature/new-feature
   ```
3. **Commit** your changes:
   ```bash
   git commit -m "Add new feature"
   ```
4. **Push** to the feature branch:
   ```bash
   git push origin feature/new-feature
   ```
5. Open a **Pull Request** on GitHub.

---

