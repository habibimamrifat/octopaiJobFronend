import { useAuth } from "../hooks/useAuth";
import { MENU } from "../const/menu";
import { useNavigate } from "react-router-dom";

function Menu() {
  const { user, selectedMenu, selectMenu } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const menuItems = MENU[user.role] || [];

  const handleMenuClick = (menu) => {
    selectMenu(menu);

    // If menu has submenu,
    // automatically open the first submenu.
    if (menu.subMenu?.length > 0) {
      navigate(`/dashboard/${menu.subMenu[0].path}`);
      return;
    }

    navigate(`/dashboard/${menu.path}`);
  };

  return (
    <nav className="space-y-2">
      {menuItems.map((menu) => {
        const isActive =
          selectedMenu?.path === menu.path;

        return (
          <button
            key={menu.path}
            type="button"
            onClick={() => handleMenuClick(menu)}
            className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {menu.label}
          </button>
        );
      })}
    </nav>
  );
}

export default Menu;