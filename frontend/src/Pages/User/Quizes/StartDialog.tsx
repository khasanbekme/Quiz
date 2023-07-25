import React from "react";
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

type Props = {
	open: boolean;
	setOpen: (open: boolean) => void;
	quiz: Quiz | null;
};

const StartDialog = ({ open, setOpen, quiz }: Props) => {
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
					variant="outlined"
					color="red"
					onClick={() => setOpen(false)}
					className="mr-5"
					size="sm"
				>
					<span>Cancel</span>
				</Button>
				<Button variant="gradient" onClick={() => setOpen(false)}>
					<span>Start</span>
				</Button>
			</DialogFooter>
		</Dialog>
	);
};

export default StartDialog;
