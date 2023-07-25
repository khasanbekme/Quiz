import { Outlet, Navigate } from "react-router-dom";
import useAuth from "../Hooks/useAuth";
import AdminNavbar from "../Pages/Layout/Admin/Navbar";
import UserNavbar from "../Pages/Layout/User/Navbar";
import SidePanel from "../Pages/Layout/Admin/SidePanel";

export const ProtectedRotueAdmin = () => {
	let { user } = useAuth();

	if (!user) {
		return <Navigate to="/login" replace={true} />;
	}

	if (!user.is_staff) {
		return <Navigate to="/user" replace={true} />;
	}
	return (
		<div className="mx-auto h-screen flex flex-col">
			<AdminNavbar />
			<div className="flex flex-grow">
				<SidePanel />
				<Outlet />
			</div>
		</div>
	);
};

export const ProtectedRotueUser = () => {
	let { user } = useAuth();

	if (!user) {
		return <Navigate to="/login" replace={true} />;
	}

	if (user.is_staff) {
		return <Navigate to="/admin" replace={true} />;
	}

	return (
		<div className="mx-auto h-screen">
			<UserNavbar />
			<div className="flex h-[calc(100vh-6rem)]">
				<Outlet />
			</div>
		</div>
	);
};
