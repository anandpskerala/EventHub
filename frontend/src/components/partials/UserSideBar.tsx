import React from "react";
import {
  User,
  Calendar,
  LogOut,
} from "lucide-react";
import type { UserSideBarProps } from "@/interfaces/props/sideBarProps";


export const UserSideBar: React.FC<UserSideBarProps> = ({ name, isOpen, onClose }) => {
  const navigation = [
    { name: "Profile", link: "/profile", icon: User, active: name == "profile" },
    { name: "Bookings", link: "/bookings", icon: Calendar, active: name == "bookings" },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`${isOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          <nav className="flex-1 p-4 space-y-1 mt-2">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.link}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${item.active
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </a>
            ))}
          </nav>

          <div className="p-4 border-t">
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};
