import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export default function DashboardLayout({ title, links }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-2xl text-forest-900">{title}</h1>
      <div className="mt-6 grid gap-6 sm:grid-cols-[180px_1fr]">
        <nav className="flex gap-2 overflow-x-auto sm:flex-col">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-forest-700 text-white' : 'text-forest-700 hover:bg-forest-100'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
