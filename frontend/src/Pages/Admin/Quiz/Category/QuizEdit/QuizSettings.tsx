/* eslint-disable react-hooks/exhaustive-deps */
import {
	Input,
	Textarea,
	Checkbox,
	Typography,
	Button,
	Alert,
} from "@material-tailwind/react";
import useAxiosPrivate from "../../../../../Hooks/useAxiosPrivate";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { color } from "@material-tailwind/react/types/components/alert";
import { Quiz } from "./QuizEdit";
import { useNavigate } from "react-router-dom";

type Props = {
	quizId: number;
	quiz: Quiz | null;
	setQuiz: (value: Quiz | null) => void;
};

type Category = {
	id: number;
	name: string;
};

type AlertType = {
	show: boolean;
	message: string;
	color: color;
};

const BlankQuiz = {
	title: "",
	description: "",
	category: null,
	start_time: null,
	duration: 60,
	end_time: null,
	access: "public",
	has_random_questions: false,
	has_random_options: false,
	grouped_questions: false,
	attempts: 1,
	total_questions: 1,
};

const QuizSettings = ({ quizId, quiz, setQuiz }: Props) => {
	const [categories, setCategories] = useState<Category[]>([]);
	const [title, setTitle] = useState("");
	const [alert, setAlert] = useState<AlertType>({ show: false } as AlertType);
	const navigate = useNavigate();

	const axiosPrivate = useAxiosPrivate();

	const fetchCategories = async () => {
		const response = await axiosPrivate.get(`/quiz/quiz-category/`);
		if (response.status === 200) {
			setCategories(response.data);
		}
	};

	const fetchQuiz = async () => {
		if (quizId === 0) {
			setTitle("New Quiz");
			setQuiz(BlankQuiz);
			return;
		}
		const response = await axiosPrivate.get(`/quiz/quiz/${quizId}/`);
		if (response.status === 200) {
			setQuiz({
				...response.data,
				start_time: new Date(response.data.start_time),
				end_time: new Date(response.data.end_time),
			});
			setTitle(response.data.title);
		}
	};

	useEffect(() => {
		fetchCategories();
		fetchQuiz();
	}, []);

	const handleSave = async () => {
		if (!quiz) {
			return;
		}
		let response;
		if (quizId !== 0) {
			response = await axiosPrivate.put(`/quiz/quiz/${quizId}/`, {
				...quiz,
				category: quiz.category === 0 ? null : quiz.category,
			});
		} else {
			response = await axiosPrivate.post("/quiz/quiz/", {
				...quiz,
				category: quiz.category === 0 ? null : quiz.category,
			});
		}
		if (response.status === 200 || response.status === 201) {
			if (quizId === 0) {
				navigate(`/admin/quiz-edit/${response.data.id}`);
			}
			setTitle(quiz.title);
			setAlert({
				show: true,
				message: "Quiz saved succesfully.",
				color: "green",
			});
		}
	};

	if (!quiz) {
		return null;
	}
	return (
		<div className="w-full flex justify-center">
			<div className="flex flex-col justify-center gap-4 mt-6 max-w-[50vw] w-full">
				<Alert
					variant="outlined"
					open={alert.show}
					color={alert.color}
					action={
						<Button
							variant="text"
							size="sm"
							color="gray"
							className="!absolute top-1 right-1"
							onClick={() => setAlert({ ...alert, show: false })}
						>
							x
						</Button>
					}
					className="text-sm h-10 p-2"
				>
					{alert.message || " "}
				</Alert>
				<Typography variant="h4">{title}</Typography>
				<Input
					label="Title"
					value={quiz.title}
					onChange={(e) => {
						setQuiz({ ...quiz, title: e.target.value });
					}}
				/>
				<Textarea
					label="Description"
					value={quiz.description || ""}
					onChange={(e) => {
						setQuiz({ ...quiz, description: e.target.value });
					}}
				/>
				<select
					value={quiz.category || 0}
					className="w-full px-1 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:border-2 focus:border-blue-500 text-base font-medium text-gray-700"
					onChange={(e) => {
						setQuiz({ ...quiz, category: Number(e.target.value) });
					}}
				>
					<option key={0} value={0}>
						Category
					</option>
					{categories.map((category) => (
						<option key={category.id} value={category.id}>
							{category.name}
						</option>
					))}
				</select>
				<div className="flex flex-row items-center gap-3">
					<label htmlFor="start_time">Start time:</label>
					<DatePicker
						id="start_time"
						selected={quiz.start_time}
						onChange={(date: Date) =>
							setQuiz({ ...quiz, start_time: date })
						}
						timeInputLabel="Time:"
						dateFormat="MM/dd/yyyy HH:mm"
						showTimeInput
						className="w-full px-1 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:border-2 focus:border-blue-500 text-base font-medium text-gray-700"
					/>
				</div>
				<Input
					type="number"
					label="Duration (minute)"
					value={quiz.duration}
					onChange={(e) => {
						setQuiz({ ...quiz, duration: Number(e.target.value) });
					}}
				/>
				<div className="flex flex-row items-center gap-3">
					<label htmlFor="end_time">End time:</label>
					<DatePicker
						id="end_time"
						selected={quiz.end_time}
						onChange={(date: Date) =>
							setQuiz({ ...quiz, end_time: date })
						}
						timeInputLabel="Time:"
						dateFormat="MM/dd/yyyy HH:mm"
						showTimeInput
						className="w-full px-1 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:border-2 focus:border-blue-500 text-base font-medium text-gray-700"
					/>
				</div>
				<select
					value={quiz.access}
					className="w-full px-1 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:border-2 focus:border-blue-500 text-base font-medium text-gray-700"
					onChange={(e) => {
						setQuiz({ ...quiz, access: e.target.value });
					}}
				>
					<option key="public" value="public">
						Public
					</option>
					<option key="private" value="private">
						Private
					</option>
				</select>
				<Checkbox
					label="Grouped questions"
					checked={quiz.grouped_questions}
					onChange={() =>
						setQuiz({
							...quiz,
							grouped_questions: !quiz.grouped_questions,
						})
					}
				/>
				<Checkbox
					label="Random questions"
					checked={quiz.has_random_questions}
					disabled={quiz.grouped_questions}
					onChange={() =>
						setQuiz({
							...quiz,
							has_random_questions: !quiz.has_random_questions,
						})
					}
				/>
				<Checkbox
					label="Random options"
					checked={quiz.has_random_options}
					disabled={quiz.grouped_questions}
					onChange={() =>
						setQuiz({
							...quiz,
							has_random_options: !quiz.has_random_options,
						})
					}
				/>
				<Input
					label="Attempts"
					type="number"
					value={quiz.attempts}
					onChange={(e) =>
						setQuiz({
							...quiz,
							attempts: Number(e.target.value),
						})
					}
				/>
				<Input
					label="Total questions"
					disabled={!quiz.has_random_questions}
					value={quiz.total_questions}
					onChange={(e) =>
						setQuiz({
							...quiz,
							total_questions: Number(e.target.value),
						})
					}
				/>
				<div className="flex felx-row justify-between">
					<Button
						color="red"
						onClick={() => {
							quizId !== 0
								? fetchQuiz()
								: navigate("/admin/quiz-list");
						}}
					>
						Cancel
					</Button>
					<Button onClick={handleSave}>Save</Button>
				</div>
			</div>
		</div>
	);
};

export default QuizSettings;
