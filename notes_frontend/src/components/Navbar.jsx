import React from "react";

/**
 * PUBLIC_INTERFACE
 * Navbar
 * Navbar with app title and optional right-side actions.
 * Props:
 * - onCreate: function to trigger creating a new note
 * - right: optional React node to render on the right side (e.g., theme toggle)
 */
export default function Navbar({ onCreate, right }) {
  return (
    <header className="navbar">
      <div className="navbar__brand">
        <span className="navbar__logo">📝</span>
        <span className="navbar__title">Ocean Notes</span>
      </div>
      <div className="navbar__right" style={{ display: "flex", gap: 8 }}>
        {typeof onCreate === "function" && (
          <button className="btn btn-primary" onClick={onCreate} title="Create a new note">
            + New Note
          </button>
        )}
        {right}
      </div>
    </header>
  );
}
