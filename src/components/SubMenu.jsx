import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function SubMenu() {
  const { selectedMenu } = useAuth();

  if (!selectedMenu?.subMenu?.length) {
    return null;
  }

  return (
    <nav className="flex h-full items-center gap-6">
      {selectedMenu.subMenu.map((item) => (
        <NavLink
          key={item.path}
          to={`/dashboard/${item.path}`}
          className={({ isActive }) =>
            `border-b-2 py-4 text-sm font-medium transition ${
              isActive
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default SubMenu;