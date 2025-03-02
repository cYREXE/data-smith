# Data Smith - CSV Enhancer

A powerful tool for enhancing CSV files using AI. This application allows you to upload CSV files and use OpenAI's GPT models to fill in missing values, categorize data, and enhance existing content.

## Features

- Upload CSV files and analyze their structure
- Configure enhancements using natural language descriptions
- Manually configure which columns to process and how
- Process CSV files with AI assistance
- Download enhanced CSV files

## Tech Stack

### Backend
- FastAPI
- Python
- OpenAI API
- Pandas

### Frontend
- React
- Vite
- TailwindCSS
- Axios

## Getting Started

### Prerequisites

- Node.js (v14+)
- Python (v3.8+)
- OpenAI API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/data-smith.git
cd data-smith
```

2. Set up the backend
```bash
# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create a .env file with your OpenAI API key
cp .env.example .env
# Edit the .env file to add your OpenAI API key
```

3. Set up the frontend
```bash
# Install dependencies
npm install
```

### Running the Application

#### Development Mode

For Unix/Linux/macOS:
```bash
./run.sh
```

For Windows:
```bash
run.bat
```

Or manually:
1. Start the backend server
```bash
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

2. In a separate terminal, start the frontend development server
```bash
npm run dev
```

3. Open your browser and navigate to http://localhost:5173

#### Production Mode

For Unix/Linux/macOS:
```bash
./deploy.sh
uvicorn api:app --host 0.0.0.0 --port 8000
```

For Windows:
```bash
deploy.bat
uvicorn api:app --host 0.0.0.0 --port 8000
```

## Usage

1. Upload a CSV file (you can use the included `sample_data.csv` for testing)
2. Describe what you want to enhance in natural language, or manually configure columns
3. Process the file
4. Download the enhanced CSV

### Sample Enhancement Descriptions

Here are some examples of natural language descriptions you can use:

- "Fill in missing descriptions for products based on their titles and categories"
- "Categorize items into Electronics, Clothing, Fitness, or Home based on their titles"
- "Generate detailed product descriptions for all items"

## License

MIT 