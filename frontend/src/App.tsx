import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Verify from "./pages/Verify";
import Register from "./pages/Register";
import { DeploymentsList, DeploymentDetail } from "./pages/Deployments";
import AuditApprove from "./pages/AuditApprove";
import ArtifactHash from "./pages/ArtifactHash";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="verify" element={<Verify />} />
          <Route path="register" element={<Register />} />
          <Route path="deployments" element={<DeploymentsList />} />
          <Route path="deployments/:address" element={<DeploymentDetail />} />
          <Route path="audit" element={<AuditApprove />} />
          <Route path="artifact" element={<ArtifactHash />} />
          <Route path="*" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
