import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { AuthProvider } from "./Context/AuthProvider";
import { Login } from "./Pages/Login/Login";
import {
	ProtectedRotueAdmin,
	ProtectedRotueUser,
} from "./Context/ProtectedRoute";
import SignUp from "./Pages/SignUp/SignUp";
import useAuth from "./Hooks/useAuth";
import { useEffect } from "react";
import UserIndex from "./Pages/User/Quizes/Grid";
import AdminIndex from "./Pages/Admin/Index";
import ProfileAdmin from "./Pages/Admin/Profile";
import ProfileUser from "./Pages/User/Profile";
import UserContent from "./Pages/Layout/User/Content";
import AdminContent from "./Pages/Layout/Admin/Content";
import UserList from "./Pages/Admin/Users/List";
import QuestionCategoryList from "./Pages/Admin/Questions/Categories/CategoryList";
import QuestionList from "./Pages/Admin/Questions/Questions/List";
import QuizCategoryList from "./Pages/Admin/Quiz/Category/CategoryList";
import QuizList from "./Pages/Admin/Quiz/Category/QuizList/QuizList";
import QuizEdit from "./Pages/Admin/Quiz/Category/QuizEdit/QuizEdit";
import GradeList from "./Pages/Admin/Users/Grades/List";

const queryClient = new QueryClient();

const LogOut = () => {
	const { logoutUser } = useAuth();

	useEffect(() => {
		logoutUser();
	}, [logoutUser]);

	return <Navigate to="/login" replace={true} />;
};

function App() {
	return (
		<Router>
			<AuthProvider>
				<QueryClientProvider client={queryClient}>
					<Routes>
						<Route
							path="/"
							element={<Navigate to="/user" replace={true} />}
						/>
						<Route path="/logout" element={<LogOut />} />
						<Route path="/login" element={<Login />} />
						<Route path="/signup" element={<SignUp />} />
						<Route path="/admin" element={<ProtectedRotueAdmin />}>
							<Route index element={<AdminIndex />} />
							<Route
								path="profile"
								element={
									<AdminContent>
										<ProfileAdmin />
									</AdminContent>
								}
							/>

							<Route path="users" element={<UserList />} />
							<Route path="grades" element={<GradeList />} />

							<Route
								path="question-categories"
								element={<QuestionCategoryList />}
							/>
							<Route
								path="questions"
								element={<QuestionList />}
							/>

							<Route
								path="quiz-categories"
								element={<QuizCategoryList />}
							/>

							<Route path="quiz-list" element={<QuizList />} />
							<Route
								path="quiz-edit/:quizId"
								element={<QuizEdit />}
							/>
						</Route>

						<Route path="/user" element={<ProtectedRotueUser />}>
							<Route index element={<UserIndex />} />
							<Route
								path="profile"
								element={
									<UserContent>
										<ProfileUser />
									</UserContent>
								}
							/>
						</Route>
					</Routes>
				</QueryClientProvider>
			</AuthProvider>
		</Router>
	);
}

export default App;
