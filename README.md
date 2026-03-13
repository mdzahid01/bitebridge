<br />
<div align="center">
  <a href="#">
    <img src="https://via.placeholder.com/1000x300/ff7f50/ffffff?text=BiteBridge+-+Smart+Dining+System" alt="BiteBridge Banner" width="100%">
  </a>

  <h3 align="center">BiteBridge 🍔</h3>

  <p align="center">
    A seamless QR-based digital menu and ordering system for modern restaurants and smart customers.
    <br />
    <br />
    <a href="#">View Demo</a>
    ·
    <a href="#">Report Bug</a>
    ·
    <a href="#">Request Feature</a>
  </p>
</div>

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</div>

---

## 📖 About The Project

**BiteBridge** is a comprehensive Full-Stack (MERN) application designed to bridge the gap between hungry customers and busy vendors. It allows restaurant owners to generate dynamic QR codes for their tables, which customers can scan to view a beautiful digital menu, add items to their cart, and place orders instantly—even as a guest!

### ✨ Key Features

#### 🏪 For Vendors (Shop Owners)
* **Secure Authentication:** Role-based access control (Vendor Owner vs. Customer).
* **Profile Management:** Update shop details, cover images, and addresses.
* **Smart QR Generation:** Automatically generates a unique, scannable QR code for the shop menu.
* **Menu Management:** Add, edit, or toggle the availability of menu items and categories.
* **Cloud Storage:** Direct image uploads to **Cloudinary** via Multer.

#### 🛍️ For Customers
* **Instant Menu Access:** Scan the QR code to instantly view the live menu (no app installation required).
* **Smart Cart System:** Real-time quantity updates and price calculations.
* **Guest Checkout:** Place orders seamlessly without creating an account (orders saved in LocalStorage).
* **Live Order Tracking:** View the real-time status of active orders (Created, Preparing, Ready).

---

## 💻 Tech Stack

| Frontend | Backend | Database & Cloud | Tools |
| :--- | :--- | :--- | :--- |
| React.js (Vite) | Node.js | MongoDB Atlas | Axios |
| TypeScript | Express.js | Cloudinary (Images) | Lucide React |
| Tailwind CSS | Mongoose | JSON Web Tokens (JWT) | React Hot Toast |
| React Router | Multer | | QRCode.js |

---

## 📸 Screenshots

*Replace these placeholder links with your actual project screenshots later.*

| Vendor Dashboard | Digital Menu |
| :---: | :---: |
| <img src="https://via.placeholder.com/500x300?text=Vendor+Dashboard" alt="Dashboard" /> | <img src="https://via.placeholder.com/500x300?text=Digital+Menu" alt="Menu" /> |

| Smart Cart | Order Tracking |
| :---: | :---: |
| <img src="https://via.placeholder.com/500x300?text=Cart+System" alt="Cart" /> | <img src="https://via.placeholder.com/500x300?text=Order+Status" alt="Order Tracking" /> |

---

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites
* Node.js (v16 or higher)
* MongoDB (Local or Atlas URI)
* Cloudinary Account (for image uploads)

### Installation

1. **Clone the repository**
   git clone [https://github.com/](https://github.com/)[Your-Username]/bitebridge.git
   cd bitebridge

2. **Setup Backend**
   cd backend_bitebridge
   npm install

3. **Create a .env file in the backend directory:**
   PORT=5400
  MONGO_URI=your_mongodb_connection_string
  JWT_SECRET=your_super_secret_key
  FRONTEND_URL=http://localhost:5173
  CLOUDINARY_CLOUD_NAME=your_cloud_name
  CLOUDINARY_API_KEY=your_api_key
  CLOUDINARY_API_SECRET=your_api_secret

4. **Start the backend server:**
    npm run dev

5. **Setup Frontend**
    # Open a new terminal tab
      cd frontend_bitebridge
      npm install
6.**Create a .env file in the frontend directory:**
  VITE_API_URL=http://localhost:5400/api

7. **Start the frontend application:**
    npm run dev

💡 Lessons Learned & Challenges Overcome
Proxy and CORS: Handled ECONNREFUSED errors by perfectly syncing Vite proxies with the Express server.

Complex Data Binding: Mastered passing FormData containing images and text from React to Node.js using Multer.

Security First: Implemented backend price verification to prevent cart tampering from the frontend.

Optimized UX: Built seamless image preview switches and fallback UI components for missing data.

🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

