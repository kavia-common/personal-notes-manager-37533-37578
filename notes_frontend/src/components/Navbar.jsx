import React from "react";

/**
 * Navbar with app title and optional right-side actions.
 */
export default function Navbar({ right }) {
  return (
    <header className="navbar">
      <div className="navbar__brand">
        <span className="navbar__logo">📝</span>
        <span className="navbar__title">Ocean Notes</span>
      </div>
      <div className="navbar__right">{right}</div>
    </header>
  );
}
