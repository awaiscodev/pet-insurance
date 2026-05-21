import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import PetInfo from "./pages/PetInfo";
import PersonalInfo from "./pages/PersonalInfo";
import SelectPlan from "./pages/SelectPlan";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import Login from "./pages/Login";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/quote" element={<PetInfo />} />
      <Route path="/personal-info" element={<PersonalInfo />} />
      <Route path="/select-plan" element={<SelectPlan />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/success" element={<Success />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;