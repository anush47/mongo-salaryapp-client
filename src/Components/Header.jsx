import "bootstrap/dist/css/bootstrap.min.css";

function Header({ title }) {
  return (
    <div>
      <h2 className="text-center mb-3 p-3 text-bg-dark rounded shadow">
        {title}
      </h2>
    </div>
  );
}

export default Header;
