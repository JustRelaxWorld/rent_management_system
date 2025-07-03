# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

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

# Rent Management System - Client

This is the frontend client for the Rent Management System, built with React.

## Payment System Improvements

### Recent Improvements

The payment system has been enhanced to address several key issues:

#### 1. Fixed Payment Status Not Reflecting on First Attempt

- Implemented a more robust React Query-based polling system that provides immediate feedback
- Improved backend responses to send status updates faster
- Added appropriate state management for payment status with automatic updates

#### 2. Synced Payment Data to Frontend Immediately

- Implemented React Query for better data fetching with automatic cache invalidation
- Added query invalidation after payments to refresh related data
- Created a reusable `usePayment` hook for better payment logic abstraction

#### 3. Fixed Payment Section Updating After Payment

- Ensured payment history and invoice details are updated automatically
- Added backend optimizations to process payment status updates more quickly
- Improved the M-PESA callback handler to update payment status immediately

#### 4. Improved Page-to-Page Transitions

- Enhanced `PageTransition` component with multiple transition types (fade, slide, scale)
- Added additional transition components:
  - `ContentTransition`: For content area transitions
  - `StaggerItem`: For staggered list animations
- Improved application layouts with smoother transitions

### Usage

To use the enhanced payment system, import the custom hook:

```tsx
import { usePayment } from '../hooks/usePayment';

const MyComponent = () => {
  const { 
    initiatePayment, 
    paymentStatus, 
    loading, 
    error 
  } = usePayment({
    invoiceId: '123',
    onPaymentComplete: () => {
      // Handle successful payment
    }
  });

  const handlePayment = async () => {
    await initiatePayment({
      phone: '254712345678',
      amount: 1000
    });
  };

  return (
    <button onClick={handlePayment} disabled={loading}>
      Pay Now
    </button>
  );
};
```
