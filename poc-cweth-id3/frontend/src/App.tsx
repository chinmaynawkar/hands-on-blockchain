import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { IdentityProvider } from "./contexts/IdentityContext";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { IdentitySetup } from "./pages/IdentitySetup";
import { Credentials } from "./pages/Credentials";
import { CWETHWallet } from "./pages/CWETHWallet";
import { ZKProofs } from "./pages/ZKProofs";
import "./demo.css";

function App() {
  return (
    <IdentityProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/identity" element={<IdentitySetup />} />
            <Route path="/credentials" element={<Credentials />} />
            <Route path="/cweth" element={<CWETHWallet />} />
            <Route path="/proofs" element={<ZKProofs />} />
          </Routes>
        </Layout>
      </Router>
    </IdentityProvider>
  );
}

export default App;
