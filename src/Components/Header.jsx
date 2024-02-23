import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";

function Header({ title }) {
  return (
    <div>
      <h2 className="text-center mb-3 p-3 text-bg-dark">{title}</h2>
    </div>
  );
}

export default Header;
