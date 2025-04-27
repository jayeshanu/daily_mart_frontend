# Inventory Management Frontend

A React-based frontend for the Inventory Management System.

## Features

- Modern, responsive UI built with Material-UI
- Real-time inventory tracking
- Item management (add, edit, delete)
- Move items between locations
- Search and filter functionality
- Pagination for large datasets
- Mobile-friendly design

## Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd inventory-management-frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   - Create a `.env` file based on the example provided
   - Update the API endpoint if needed

## Running the Application

### Development Mode

```
npm run dev
```

The application will be available at `http://localhost:5173`.

### Production Build

```
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

- `src/components`: Reusable UI components
- `src/pages`: Page components
- `src/services`: API service functions
- `src/types`: TypeScript type definitions
- `src/utils`: Utility functions

## API Integration

The frontend connects to the backend API at `http://localhost:8080` by default.

## Technologies Used

- React
- TypeScript
- Material-UI
- Vite
- Axios

## License

MIT
