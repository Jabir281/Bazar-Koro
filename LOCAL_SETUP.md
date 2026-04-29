# How to Start the Bazar Koro Website Locally

This guide will walk you through the steps to get the full-stack application running on your local machine.

## 1. Prerequisites
- **Node.js** (v20 or higher is recommended)
- **Git** (to manage version control)

## 2. Install Packages
Open your terminal, navigate to the root folder of the project (e.g., `D:\Bazar Koro`), and run the built-in setup script:

```bash
npm run setup
```
*(This command automatically installs all the necessary dependencies for the frontend, backend, and shared folders.)*

## 3. Configure Environment Variables
Ensure you have an environment file created in the server folder (`server/.env`). It must contain the connection string to your active MongoDB database.

Your `server/.env` file should look similar to this:
```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/Bazar_Koro?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
# Add your other API keys (Stripe, Cloudinary, Google Maps, etc.) as needed.
```

## 4. Start the Development Server
Once dependencies are installed and your `.env` is configured, start the application by running:

```bash
npm run dev
```

This single command will boot up both the backend and frontend at the same time:
- **Client (Frontend)**: Accessible at [http://localhost:5173](http://localhost:5173)
- **Server (Backend)**: Running at [http://localhost:3000](http://localhost:3000)

Any edits you make in the `client/` or `server/` code will automatically hot-reload!