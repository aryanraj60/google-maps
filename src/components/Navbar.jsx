import React from "react";
import gravitiLogo from "../assets/graviti.png";

const Navbar = () => {
  return (
    <div className="py-2 hidden md:block bg-[#FFFFFF] px-8">
      <img src={gravitiLogo} alt="logo" />
    </div>
  );
};

export default Navbar;
