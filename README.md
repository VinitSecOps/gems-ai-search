# GEMS AI Search 🔍

A powerful AI-powered natural language search interface for the GEMS database system. Transform plain English queries into SQL and get instant results from your business data.

## 🌟 Features

- 🤖 **AI-Powered**: Uses OpenAI GPT-4 to convert natural language to SQL
- 🔒 **Secure**: Validates queries, prevents SQL injection, rate limiting
- ⚡ **Fast**: Optimized with database indexes and connection pooling  
- 📱 **Responsive**: Works on desktop and mobile devices
- 🔍 **Smart Suggestions**: Context-aware query suggestions with synonym support
- 📊 **Rich Results**: Paginated tables with formatted data
- 🛡️ **Smart Error Handling**: Detailed error messages with actionable suggestions
- 📝 **Comprehensive Logging**: Full audit trail for debugging and monitoring
- 🏷️ **Status Mapping**: Automatic mapping of enum values to human-readable status
- 📚 **Search History**: Tracks and learns from previous searches

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **OpenAI GPT-4** - Natural language processing
- **SQL Server (mssql)** - Database connectivity
- **Winston** - Logging framework
- **Express Rate Limit** - API rate limiting
- **Helmet** - Security middleware

### Database
- **Microsoft SQL Server** - Primary database
- **Connection pooling** - Optimized database connections
- **Transaction isolation** - Safe read operations

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **SQL Server** (2019 or higher) or **SQL Server Express**
- **OpenAI API Key** - [Get your API key](https://platform.openai.com/api-keys)
- **Git** - [Download here](https://git-scm.com/)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/gems-ai-search.git
cd gems-ai-search
```

### 2. Environment Setup

Create environment files for both frontend and backend:

#### Backend Environment (`backend/.env`)
```env
# Database Configuration
DB_HOST=your-sql-server-host
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_PORT=1433

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# Server Configuration
NODE_ENV=development
PORT=3001

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=60
```

#### Frontend Environment (`frontend/.env`)
```env
# Disable host checking for development
DANGEROUSLY_DISABLE_HOST_CHECK=true
```

### 3. Install Dependencies

#### Backend Dependencies
```bash
cd backend
npm install
```

#### Frontend Dependencies
```bash
cd frontend
npm install
```

### 4. Database Setup

Ensure your SQL Server is running and accessible. The application expects tables for:
- Companies/Agencies (`Company` table)
- Clients (`Clients` table)
- Sites (`Sites` table)
- Bookings (`Bookings` or `SimpleBookings` table)
- Requirements (`Requirements` table)
- Candidates (`Candidates` table)
- Timesheets (`Timesheets` table)
- Cost Centres (`CostCentres` table)

### 5. Start the Application

#### Option A: Start Both Servers Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

#### Option B: Using Docker (if available)
```bash
docker-compose up
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 📁 Project Structure

```
gems-ai-search/
├── README.md
├── SEARCH_ENHANCEMENTS_DEPLOYMENT.md
├── docker/
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf
├── database/
│   ├── schema/
│   │   ├── enum_mappings.sql
│   │   ├── GEMS-UAT.sql
│   │   └── search_enhancements.sql
│   ├── utils/
│   │   └── import_enums.ps1
│   ├── verify.bat
│   └── verify_enhancements.sql
├── backend/
│   ├── package.json
│   ├── ENHANCEMENTS_SUMMARY.md
│   ├── src/
│   │   ├── server.js
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── middleware/
│   │   │   └── security.js
│   │   ├── routes/
│   │   │   └── search.js
│   │   └── services/
│   │       ├── enumMappingService.js
│   │       ├── nlpToSql.js
│   │       ├── queryEnhancementService.js
│   │       └── statusMappingService.js
│   └── logs/
│       ├── database.log
│       ├── nlp.log
│       ├── search.log
│       └── server.log
└── frontend/
    ├── package.json
    ├── tailwind.config.js
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js
        ├── index.js
        ├── index.css
        └── components/
            └── GEMSAISearch.jsx
```

## 🔍 Search Enhancements

The latest update includes several search enhancements to improve the search experience:

### Status Mapping
The system now automatically maps numeric enum values to human-readable text. For example, instead of showing "StatusId: 1", it will show "Status: Incomplete" for timesheets.

### Search Synonyms
Common abbreviations and synonyms are now supported. For example:
- "TS" is automatically expanded to "Timesheet"
- "CC" is recognized as "Cost Centre"
- "Workers" is understood as "Candidates"

### Search History
The system now tracks search history to provide better suggestions and improve performance over time.

For detailed information on these enhancements and how to deploy them, see [SEARCH_ENHANCEMENTS_DEPLOYMENT.md](SEARCH_ENHANCEMENTS_DEPLOYMENT.md).

## 🔍 Usage Examples

Try these natural language queries:

### Basic Queries
- "Show all active companies"
- "List recent candidates"
- "Find timesheets awaiting approval"

### Filtered Queries
- "Find candidates named John"
- "Show clients from London"
- "Timesheets submitted this month"

### Complex Queries
- "Show bookings starting this year"
- "Find candidates with timesheet data"
- "List clients by company type"

## 🛡️ Security Features

- **SQL Injection Protection**: All queries are validated and sanitized
- **Rate Limiting**: Prevents API abuse (60 requests per minute by default)
- **Input Validation**: All user inputs are validated and escaped
- **Read-Only Operations**: Only SELECT statements are allowed
- **CORS Protection**: Configured for secure cross-origin requests

## 🐛 Troubleshooting

### Common Issues

1. **"allowedHosts" Error**
   - Ensure `DANGEROUSLY_DISABLE_HOST_CHECK=true` is in `frontend/.env`

2. **Database Connection Failed**
   - Check SQL Server is running
   - Verify connection string in `backend/.env`
   - Ensure firewall allows connections

3. **OpenAI API Errors**
   - Verify your API key is valid
   - Check your OpenAI account has credits
   - Ensure rate limits aren't exceeded

4. **Port Already in Use**
   ```bash
   # Kill processes on ports 3000/3001
   npx kill-port 3000
   npx kill-port 3001
   ```

### Logs Location
- Backend logs: `backend/logs/`
- Check `search.log` for search-related issues
- Check `database.log` for database connection issues
- Check `nlp.log` for OpenAI API issues

## 📊 API Endpoints

### Search
- **POST** `/api/search`
  - Body: `{ "query": "your natural language query" }`
  - Returns: SQL, results, and metadata

### Health Check
- **GET** `/api/health`
  - Returns: Server status and uptime

## 🚦 Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Build frontend
cd frontend
npm run build

# Start backend in production
cd backend
NODE_ENV=production npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [troubleshooting section](#🐛-troubleshooting)
2. Review the logs in `backend/logs/`
3. Open an issue on GitHub
4. Contact the development team

## 🙏 Acknowledgments

- OpenAI for providing the GPT-4 API
- The React and Node.js communities
- Tailwind CSS for the beautiful styling
- All contributors who helped build this project

---

**Made with ❤️ for efficient data searching**

Natural language search interface for the GEMS database system. Ask questions in plain English and get SQL results.

## Features

- 🤖 **AI-Powered**: Uses OpenAI GPT-4 to convert natural language to SQL
- 🔒 **Secure**: Validates queries, prevents SQL injection, rate limiting
- ⚡ **Fast**: Optimized with database indexes and connection pooling  
- 📱 **Responsive**: Works on desktop and mobile devices
- 🔍 **Smart Suggestions**: Context-aware query suggestions
- 📊 **Rich Results**: Paginated tables with formatted data

## Quick Start

### Prerequisites
- Node.js 18+
- OpenAI API Key
- Access to GEMS SQL Server database

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd gems-ai-search