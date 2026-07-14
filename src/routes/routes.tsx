// import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Dashboard from "../pages/dashboard/Dashboard";
import Login from "../pages/login/Login";
import Expenses from "../pages/expenses/Expenses";
import Categories from "../pages/categories/Categories";
import Profile from "../pages/profile/Profile";
import AddExpenses from "../pages/Addexpenses/AddExpenses";
import ProfileSettings from "../pages/profile-settings/ProfileSettings";
import EditMonthlyBill from "../pages/profile-settings/EditMonthlyBill";
import { createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Login />,
    },
    {
      path: "/Layout",
      element: <Layout />,
      children: [
        {
          index: true,
          element: <Dashboard />,
        },
        {
          path: "Dashboard",
          element: <Dashboard />,
        },
        {
          path: "Expenses",
          element: <Expenses />,
        },
        {
          path: "Categories",
          element: <Categories />,
        },
        {
          path: "Profile",
          element: <Profile />,
        },
        {
          path: "ProfileSettings",
          element: <ProfileSettings />,
        },
        {
          path: "EditMonthlyBill/:id",
          element: <EditMonthlyBill />,
        },
        {
          path: "AddExpenses",
          element: <AddExpenses />,
        },
      ],
    },
  ],
  {
    basename: "/Expense-Tracker",
  }
);

export default router;