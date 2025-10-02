# EventBooking Documentation

EventBooking is a full-featured React web application designed for discovering, booking, and managing events. This documentation provides comprehensive guidance on setup, configuration, and usage.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

- Browse a list of upcoming events with detailed information
- Secure user authentication and registration
- Book tickets for events and manage your bookings
- Responsive design for mobile and desktop
- Modular and scalable codebase

Tech Stack
----------
- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
*   **Runtime**: Node.js
*   **Framework**: Express
*   **Language**: TypeScript
*   **Database**: MongoDB with Mongoose
*   **Cloud Storage**: Cloudinary
*   **Environment Management**: dotenv
*   **API Testing**: Postman (recommended for development)

Prerequisites
-------------

*   Node.js (v16 or higher)
*   Pnpm
*   A MongoDB instance (local or cloud-based, e.g., MongoDB Atlas)
*   A Cloudinary account with API credentials

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [pnpm](https://pnpm.io/)
- (Optional) [Git](https://git-scm.com/)

## Backend Installation

1.  **Clone the Repository**:
    
        git clone https://github.com/anandpskerala/EventHub.git
        cd EventHub/backend
    
2.  **Install Dependencies**:
    
        pnpm install
    

    
3.  **Set Up Environment Variables**:
    
    Create a `.env` file in the root directory and add the following:
    
        PORT=5000
        NODE_ENV=development
        MONGO_URI=mongodb+srv://url
        ACCESS_TOKEN_SECRET=supersecret
        REFRESH_TOKEN_SECRET=refreshsupersecret
        FRONTEND_URL=http://localhost:5173
        CLOUD_NAME=ddfdsgsg
        CLOUD_API_KEY=8sdfsdffd
        CLOUD_SECRET=ZVesfdsdsfdsdfsfdSlI_oBsdfsfdsfd
        RPAY_KEY=fsdfssfdsdf
        RPAY_SECRET=fsdsfdsfsfsf


    
    Replace the placeholders with your actual MongoDB connection string, Cloudinary credentials, and JWT secret for authentication.
    
4.  **Run the Development Server**:
    
        pnpm run dev
    

## Frontend Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/anandpskerala/EventHub.git
   cd EventHub/frontend
   ````
2. **Install Dependencies:**

    ```bash
    pnpm install
    ```
3. **Set Up Environment Variables:
Create a .env file in the root directory and add the following:**

    ```
    VITE_API_URL=http://localhost:5000/api
    VITE_RPAY_KEY=fffdfdfddffd
    ```
4. **Run the Development Server:**
    ```bash
    pnpm run dev
    ```


Using HTTPS:

```
/src
    /components
    /pages
    /services
    App.js
    index.js
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes
4. Push to the branch
5. Open a pull request
