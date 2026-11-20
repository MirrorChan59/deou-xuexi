import React from "react";
import { Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import RequireSession from "./components/RequireSession";
import { SessionProvider } from "./session/SessionContext";
import HomePage from "./pages/HomePage/HomePage";
import InterviewPage from "./pages/InterviewPage/InterviewPage";
import RecruitmentPage from "./pages/RecruitmentPage/RecruitmentPage";
import SqlTrainingPage from "./pages/SqlTrainingPage/SqlTrainingPage";
import AdminUsersPage from "./pages/AdminUsersPage/AdminUsersPage";
import AdminAccountsPage from "./pages/AdminAccountsPage/AdminAccountsPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import NotFound from "./pages/NotFound/NotFound";

const RoutesComponent = () => {
  return (
    <SessionProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route
          element={
            <RequireSession>
              <Layout />
            </RequireSession>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="interview" element={<InterviewPage />} />
          <Route path="recruitment" element={<RecruitmentPage />} />
          <Route path="sql-training" element={<SqlTrainingPage />} />
          <Route path="admin/users" element={<AdminUsersPage />} />
          <Route path="admin/accounts" element={<AdminAccountsPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </SessionProvider>
  );
};

export default RoutesComponent;
