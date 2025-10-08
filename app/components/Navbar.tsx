import type { JSX } from "react";
import { Link } from "react-router";

function Navbar(): JSX.Element {
  return (
    <nav
      className="
        navbar 
        max-sm:overflow-x-scroll
        scrollbar-hide
      "
    >
      <div className="flex items-center gap-4 w-full max-w-screen-xl mx-auto">
        {/* Brand */}
        <Link to={"/"}>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-gradient whitespace-nowrap">
            RESUMIND
          </p>
        </Link> 

        {/* Buttons */}
        <div className="flex  gap-2 items-center w-full justify-end">
          <Link
            to={"/upload"}
            className="
              primary-button text-center 
              text-sm sm:text-base 
              px-3 py-1 sm:px-4 sm:py-2 
              flex justify-center items-center whitespace-nowrap shrink-0 w-fit
            "
          >
            Upload Resume
          </Link>
          <Link
            to={"/wipe"}
            className="
              primary-button text-center 
              text-sm sm:text-base 
              px-3 py-1 sm:px-4 sm:py-2 
              flex justify-center items-center whitespace-nowrap shrink-0 w-fit
            "
          >
            Delete Resume
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;