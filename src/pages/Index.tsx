import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  navigate("/");
  return null;
};

export default Index;
