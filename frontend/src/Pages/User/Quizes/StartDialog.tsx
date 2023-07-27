import React, { useEffect, useState } from "react";
import {
	Button,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	Typography,
} from "@material-tailwind/react";
import { Quiz } from "./Grid";
import { formatTime } from "./QuizCard";
import useAxiosPrivate from "../../../Hooks/useAxiosPrivate";

type Props = {
	open: boolean;
	setOpen: (open: boolean) => void;
	quiz: Quiz | null;
};

const StartDialog = ({ open, setOpen, quiz }: Props) => {
	const axiosPrivate = useAxiosPrivate();
	const [loading, setLoading] = useState(true); // New state variable for loading

	useEffect(() => {
		if (open) {
			setLoading(false);
		}
	}, [open]);

	const startQuiz = async () => {
		try {
			setLoading(true); // Set loading to true when starting the quiz
			const response = await axiosPrivate.post(
				`/quiz/start-quiz/${quiz?.id}/`
			);
			if (response.status === 200) {
				console.log(response.data);
				setLoading(false); // Set loading back to false when the request is successful
			}
		} catch (error) {
			setLoading(false); // Set loading back to false in case of an error
			// Handle error (e.g., show an error message)
		}
	};

	if (!quiz) {
		return null;
	}

	return (
		<Dialog size="md" open={open} handler={() => setOpen(false)}>
			<div className="flex items-center justify-between">
				<DialogHeader>{quiz.title}</DialogHeader>
				<Typography className="text-lg font-sans pr-3 text-slate-400">
					{quiz.category?.name}
				</Typography>
			</div>
			<DialogBody divider>
				{quiz.description && (
					<Typography variant="paragraph" className="mb-6">
						{quiz.description}
					</Typography>
				)}
				<div className="mb-6">
					<Typography color="black" className="mb-1 text-xl">
						{"Total questions: " + quiz.questions}
					</Typography>
					{quiz.question_groups &&
						quiz.question_groups.map((group) => (
							<p className="pl-10" key={group.title}>
								{`${group.title} - ${group.total_questions}, ${group.point} point`}
							</p>
						))}
				</div>
				<Typography
					className="flex justify-center text-lg"
					color="black"
				>
					{"Duration: " + formatTime(quiz.duration)}
				</Typography>
			</DialogBody>
			<DialogFooter>
				<Button
					variant="gradient"
					onClick={startQuiz}
					className="h-12 min-h-full min-w-full"
					disabled={loading}
				>
					{loading ? (
						<div className="flex items-center justify-center px-6">
							<div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-900" />
						</div>
					) : (
						<span>Start</span>
					)}
				</Button>
			</DialogFooter>
		</Dialog>
	);
};

export default StartDialog;
