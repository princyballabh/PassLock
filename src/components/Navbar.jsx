import React from "react";

export default function Navbar({ auth, onSignOut }) {
  return (
    <nav className="bg-opacity-25 bg-violet-900 ">
      <div className="mycontainer text-white px-10 py-4 flex justify-between items-center">
        <div className="logo font-bold">
          <span className="text-blue-200">&lt;</span>
          Pass
          <span className="text-blue-200">/Lock&gt;</span>
        </div>
        <div className="links flex space-x-4">
          {auth && (
            <button
              onClick={onSignOut}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
