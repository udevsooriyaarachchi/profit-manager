Partner Profit Manager 🚀

A specialized financial dashboard designed for e-commerce partnerships. This application automates the complex task of calculating net profit from courier CSV reports, handling tiered product costs, managing operational expenses, and determining precise profit shares for partners.

🌟 Features

CSV Data Import: Drag-and-drop support for standard courier service CSV files.

Automated Financials: Instantly calculates Total Revenue, Cost of Goods Sold (COGS), and Gross Profit.

Tiered Cost Logic: Supports complex buying price structures (e.g., "First 300 units @ 300 LKR, remaining units @ 100 LKR").

Expense Management: Real-time adjustment for Advertising, Return Charges, and other operational costs.

Profit Distribution Engine: Automatically splits Net Profit according to your specific partnership agreement:

Investor Share: 50%

Working Partners: 50% (Split equally among 3 partners).

Interactive Dashboard: Visual cards for KPIs and detailed tables for product performance.

Configurable: Edit selling prices and cost tiers directly within the app without touching code.

🛠️ Tech Stack

Frontend: React (Vite)

Styling: Tailwind CSS

Icons: Lucide React

Data Parsing: PapaParse

⚡ Quick Start Guide

Follow these steps to get the project running on your local machine.

Prerequisites

Node.js (Version 16 or higher recommended)

Installation

Clone the repository

git clone [https://github.com/YOUR_USERNAME/profit-manager.git](https://github.com/YOUR_USERNAME/profit-manager.git)
cd profit-manager


Install Dependencies

npm install


Mac User Note: If you encounter permission errors (EACCES), run sudo chown -R $(whoami) ~/.npm and try again.

Run the App

npm run dev


Open in Browser
Click the link shown in your terminal (usually http://localhost:5173).

📖 How to Use

Upload Data: Click the "Upload Sales Data" box and select your courier's CSV file (e.g., 2026-01-18...csv).

Review Config: If your buying prices have changed, click the Config button in the top right to update your cost tiers.

Add Expenses: Enter your total Advertising Cost and any Return Charges in the input fields.

View Results: Scroll down to see the "Profit Distribution" card. This tells you exactly how much to pay Samila, yourself, Sandun, and Krishan.

📂 Project Structure

profit-manager/
├── src/
│   ├── App.jsx        # Main application logic
│   ├── index.css      # Tailwind imports
│   └── main.jsx       # React entry point
├── public/            # Static assets
├── index.html         # HTML entry point
├── package.json       # Project dependencies
└── README.md          # Project documentation


🤝 Contributing

Fork the repository

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License

Distributed under the MIT License. See LICENSE for more information.
