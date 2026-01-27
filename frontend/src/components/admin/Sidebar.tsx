import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Candidates", path: "/candidates" }, // You can update paths later
    { name: "Employers", path: "/employers" },
    { name: "Settings", path: "/settings" },
  ];

  return (
    <aside className="w-64 bg-slate-800 text-white hidden md:block flex-shrink-0">
      <div className="p-6 text-xl font-bold border-b border-slate-700">
        VGS Admin
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`block px-6 py-3 transition-colors ${
                isActive
                  ? "bg-slate-700 border-l-4 border-blue-500"
                  : "hover:bg-slate-700 border-l-4 border-transparent"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;