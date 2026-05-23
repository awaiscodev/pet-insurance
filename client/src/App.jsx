import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import PetInfo from "./pages/PetInfo";
import PersonalInfo from "./pages/PersonalInfo";
import SelectPlan from "./pages/SelectPlan";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/quote" element={<PetInfo />} />
      <Route path="/personal-info" element={<PersonalInfo />} />
      <Route path="/select-plan" element={<SelectPlan />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/success" element={<Success />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;