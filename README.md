# 🚗 Safisha Hub - Car Wash Management System

A modern, mobile-first car wash management application built with React and Tailwind CSS. Perfect for car wash businesses to track services, customers, and revenue.

## ✨ Features

- **📱 Mobile-First Design** - Optimized for mobile devices and tablets
- **📊 Real-time Analytics** - Track daily revenue, car count, and averages
- **🔄 Multi-Step Form** - Intuitive 3-step data entry process
- **💾 Local Storage** - Data persists between sessions
- **📈 Google Sheets Integration** - Automatic data backup to Google Sheets
- **🎨 Modern UI** - Clean, professional interface with Tailwind CSS
- **⚡ Fast Performance** - Built with React 19 for optimal speed

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd safishahub
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📊 Google Sheets Integration

### Setup Instructions

1. **Create a Google Sheet:**
   - Go to [Google Sheets](https://sheets.google.com)
   - Create a new spreadsheet
   - Name it "Safisha Hub Data" or similar

2. **Create Google Apps Script:**
   - In your Google Sheet, go to `Extensions > Apps Script`
   - Delete the default code and paste the code from `src/utils/googleSheets.js` (see comments at bottom)
   - Save the project with a name like "Safisha Hub API"

3. **Deploy as Web App:**
   - Click `Deploy > New Deployment`
   - Choose type: `Web app`
   - Execute as: `Me`
   - Who has access: `Anyone`
   - Click `Deploy`
   - Copy the Web App URL

4. **Configure Environment:**
   - Copy `.env.example` to `.env`
   - Replace `YOUR_SCRIPT_ID` with your Web App URL
   ```bash
   cp .env.example .env
   ```

5. **Test Integration:**
   - Add a test entry in the app
   - Check your Google Sheet for the data

## 🎯 Usage

### For Car Wash Assistants

1. **Step 1: Vehicle Details**
   - Enter vehicle registration number (required)
   - Add vehicle model
   - Set service priority (Normal/Urgent/VIP)

2. **Step 2: Service Details**
   - Select service type (auto-fills pricing)
   - Choose service man from dropdown
   - Optionally add an assistant

3. **Step 3: Customer & Payment**
   - Enter customer name (required)
   - Add phone number and location
   - Select payment method
   - Confirm amount (auto-filled based on service)
   - Add any notes

### Dashboard Features

- **Real-time Stats**: View total cars, revenue, and averages
- **Recent Entries**: Quick view of last 5 entries
- **Priority Indicators**: Visual tags for VIP/Urgent services
- **Success Notifications**: Confirmation when entries are saved

## 🛠️ Deployment

### Netlify Deployment

1. **Build the project:**
```bash
npm run build
```

2. **Deploy to Netlify:**
   - Drag the `build` folder to [Netlify Drop](https://app.netlify.com/drop)
   - Or connect your GitHub repository for automatic deployments

3. **Configure Environment Variables:**
   - In Netlify dashboard, go to Site Settings > Environment Variables
   - Add `REACT_APP_GOOGLE_SCRIPT_URL` with your Google Apps Script URL

### Manual Deployment

1. Build the project: `npm run build`
2. Upload the `build` folder contents to your web server
3. Configure environment variables on your hosting platform

## 🎨 Customization

### Service Types & Pricing

Edit the `servicePricing` object in `src/App.js`:

```javascript
const servicePricing = {
  "Exterior Wash": 500,
  "Interior Clean": 800,
  "Full Detail": 1500,
  // Add more services...
};
```

### Staff Members

Update the attendant options in the Step 2 form section:

```javascript
<option value="John Kamau">👨‍🔧 John Kamau</option>
// Add more staff members...
```

### Styling

The app uses Tailwind CSS. Modify classes in the JSX or extend the theme in `tailwind.config.js`.

## 📱 Mobile Optimization

- **Touch-friendly**: Large buttons and input fields
- **Responsive**: Works on all screen sizes
- **Fast**: Optimized for mobile networks
- **Offline-capable**: Local storage ensures data isn't lost

## 🔧 Technical Details

- **Frontend**: React 19, Tailwind CSS
- **State Management**: React Hooks (useState, useEffect)
- **Storage**: localStorage + Google Sheets
- **Build Tool**: Create React App
- **Deployment**: Netlify-ready

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support or questions, please contact [your-email@example.com]

---

Built with ❤️ for car wash businesses everywhere!

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
