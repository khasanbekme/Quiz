import {
	Card,
	CardBody,
	CardFooter,
	Typography,
	Button,
} from "@material-tailwind/react";
import { format } from "date-fns";
import { Quiz } from "./Grid";

type Props = {
	quiz: Quiz;
	now: Date;
	setOpenStart: (open: boolean) => void;
	setSelectedQuiz: (quiz: Quiz) => void;
};

export function formatTime(minutes: number): string {
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;

	const formattedHours = hours === 1 ? "1 hour" : `${hours} hours`;
	const formattedMinutes =
		remainingMinutes === 1 ? "1 minute" : `${remainingMinutes} minutes`;

	if (hours === 0) {
		return formattedMinutes;
	} else if (remainingMinutes === 0) {
		return formattedHours;
	} else {
		return `${formattedHours} ${formattedMinutes}`;
	}
}

const formatDeltaTime = (a: Date, b: Date): string => {
	let seconds = Math.abs(Math.floor((a.getTime() - b.getTime()) / 1000));
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	seconds = seconds % 60;

	const formattedHours = hours.toString().padStart(2, "0");
	const formattedMinutes = minutes.toString().padStart(2, "0");
	const formattedSeconds = seconds.toString().padStart(2, "0");

	return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};

const quizStatus = (quiz: Quiz, now: Date) => {
	if (now < quiz.start_time) {
		return -1;
	} else if (now >= quiz.start_time && now <= quiz.end_time) {
		return 0;
	} else {
		return 1;
	}
};

const QuizCard = ({ quiz, now, setOpenStart, setSelectedQuiz }: Props) => {
	const status = quizStatus(quiz, now);

	const buttonClick = () => {
		setSelectedQuiz(quiz);
		setOpenStart(true);
	};

	return (
		<Card
			className={`${
				status === -1
					? "bg-white"
					: status === 0
					? "bg-green-200"
					: "bg-gray-200"
			} w-80 max-h-96 shadow-xl`}
			key={`quiz-${quiz.id}`}
		>
			<CardBody className="flex-grow">
				<Typography variant="h5" color="blue-gray" className="mb-3">
					{quiz.title}
				</Typography>
				{quiz.description && (
					<Typography variant="paragraph" className="mb-8">
						{quiz.description}
					</Typography>
				)}
				<div className="flex flex-col gap-1">
					<Typography variant="small" color="blue-gray">
						Start: {format(quiz.start_time, "dd/MM/Y, HH:mm")}
					</Typography>
					<Typography variant="small" color="blue-gray">
						Duration: {formatTime(quiz.duration)}
					</Typography>
					<Typography variant="small" color="blue-gray">
						End: {format(quiz.end_time, "dd/MM/Y, HH:mm")}
					</Typography>
				</div>
			</CardBody>
			<CardFooter className="flex w-full justify-center">
				<Button
					fullWidth
					disabled={
						status !== 0 ||
						(quiz.active
							? now > quiz.active.end_time
							: quiz.left_attempts === 0)
					}
					onClick={buttonClick}
					size="lg"
				>
					{status === 1
						? "Finished"
						: status === 0
						? quiz.active
							? now <= quiz.active.end_time
								? "Continue"
								: quiz.left_attempts > 0
								? "Start"
								: "Finished"
							: quiz.left_attempts > 0
							? "Start"
							: "Finished"
						: formatDeltaTime(now, quiz.start_time)}
				</Button>
			</CardFooter>
		</Card>
	);
};

export default QuizCard;
