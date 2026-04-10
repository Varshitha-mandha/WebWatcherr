import { useState } from "react";
import LandingPage from "@/components/LandingPage";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  const [started, setStarted] = useState(false);

  if (started) {
    return <Dashboard />;
  }

  return <LandingPage onGetStarted={() => setStarted(true)} />;
};

export default Index;
