# Smart Invoice & GST Calculator

A MERN-based web application that enables users to create GST-compliant invoices, calculate taxes automatically, and securely store invoice records using MongoDB Atlas.

## Features

* Create GST-compliant invoices
* Automatic GST calculations
* Real-time subtotal, tax, and grand total calculation
* Store invoices securely in MongoDB Atlas
* View all saved invoices
* Responsive and user-friendly interface
* Dynamic invoice item management

## Tech Stack

### Frontend

* React.js
* Vite
* JavaScript
* CSS

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas
* Mongoose

## Project Highlights

* Built RESTful APIs using Express.js
* Connected frontend and backend using Fetch API
* Implemented MongoDB Atlas for persistent invoice storage
* Used environment variables for secure configuration
* Designed a clean and responsive user interface

## Installation

### Clone the repository

```bash
git clone https://github.com/starshruti2510/smart-invoice-gst-calculator
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Backend Setup

```bash
cd backend
npm install
npm start
```

## Environment Variables

Create a `.env` file inside the backend folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

## Future Improvements

* PDF invoice download
* Search invoices by invoice number
* Invoice filtering and sorting
* Edit and delete invoice functionality
* User authentication and authorization

## Author

**Shruti Sharma**

Built as part of a Digital Heroes Trial Task.
