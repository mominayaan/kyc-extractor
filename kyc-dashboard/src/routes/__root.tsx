import { createRootRoute, Outlet, Link } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: () => (
    <div className="font-primary">
      <div className="relative text-3xl font-bold flex justify-center mt-5">
        <div>Know-Your-Customer Dashboard</div>
      </div>

      <div className="w-3/4 mx-auto mt-5">
        <div className="flex gap-4 z-10">
          <Link
            to="/"
            activeProps={{
              className:
                "px-6 py-3 rounded-t-lg bg-white border-t-2 border-x-2 border-b-2 border-black border-b-white !important -mb-[2px] relative z-10",
            }}
            inactiveProps={{
              className:
                "px-6 py-2 rounded-t-lg bg-gray-200 hover:bg-gray-300 relative z-10",
            }}
          >
            Upload
          </Link>
          <Link
            to="/analyze"
            activeProps={{
              className:
                "px-6 py-3 rounded-t-lg bg-white border-t-2 border-x-2 border-b-2 border-black border-b-white !important -mb-[2px] relative z-10",
            }}
            inactiveProps={{
              className:
                "px-6 py-2 rounded-t-lg bg-gray-200 hover:bg-gray-300 relative z-10",
            }}
          >
            Analyze
          </Link>
        </div>
        <div
          className='min-h-[700px] border-2 border-black rounded-lg rounded-tl-none bg-white relative
          before:absolute before:content-[""] before:left-2 before:right-2 before:bottom-[-8px] before:h-full before:bg-gray-200 before:-z-10
          after:absolute after:content-[""] after:left-4 after:right-4 after:bottom-[-16px] after:h-full after:bg-gray-100 after:-z-20'
        >
          <Outlet />
          <TanStackRouterDevtools />
        </div>
      </div>
    </div>
  ),
});
