import useAxiosPrivate from "../../../Hooks/useAxiosPrivate";
import { useQuery } from "react-query";
import QuizCard from "./QuizCard";
import { useCurrentDateTime } from "../../../Hooks/useDatetime";
import { useEffect, useState } from "react";
import StartDialog from "./StartDialog";
import { Button } from "@material-tailwind/react";
import { queryClient } from "../../../App";

export type QuizCategory = {
	id: number;
	name: string;
};

export type QuestionGroup = {
	id: number;
	title: string;
	total_questions: number;
	point: number;
};

export type Quiz = {
	id: number;
	title: string;
	description: string;
	category: QuizCategory | null;
	start_time: Date;
	duration: number;
	end_time: Date;
	questions: number;
	question_groups: QuestionGroup[] | null;
	past_attempts: number;
	left_attempts: number;
	active: { id: number; end_time: Date } | null;
	status: number;
};

const quizStatus = (start_time: Date, end_time: Date, now: Date) => {
	if (now < start_time) {
		return -1;
	} else if (now >= start_time && now <= end_time) {
		return 0;
	} else {
		return 1;
	}
};

const Index = () => {
	const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
	const [openStart, setOpenStart] = useState(false);

	const axiosPrivate = useAxiosPrivate();
	const now = useCurrentDateTime();

	const fetchApiData = async (): Promise<Quiz[]> => {
		const response = await axiosPrivate.get<Quiz[]>("/quiz/user-quiz/");
		const data = response.data.map(
			({ start_time, end_time, active, ...value }) => {
				return {
					...value,
					start_time: new Date(start_time),
					end_time: new Date(end_time),
					active: active
						? { ...active, end_time: new Date(active.end_time) }
						: null,
					status: quizStatus(
						new Date(start_time),
						new Date(end_time),
						new Date()
					),
				};
			}
		);
		return data;
	};

	const {
		data: quizes,
		isLoading,
		error,
	} = useQuery<Quiz[]>("quiz-grid", fetchApiData, {
		enabled: true,
		refetchOnWindowFocus: false,
	});

	const QuizFilters = {
		ALL: "ALL",
		UPCOMING: "UPCOMING",
		ONGOING: "ONGOING",
		FINISHED: "FINISHED",
	};

	useEffect(() => {
		queryClient.setQueryData(
			"quiz-grid",
			quizes?.map((quiz) => {
				return {
					...quiz,
					status: quizStatus(quiz.start_time, quiz.end_time, now),
				};
			}) || []
		);
	}, [now]);

	const [quizFilter, setQuizFilter] = useState<string>(QuizFilters.ALL);

	const filteredQuizes = (() => {
		switch (quizFilter) {
			case QuizFilters.ALL:
				return quizes || [];
			case QuizFilters.UPCOMING:
				return quizes?.filter((quiz) => quiz.status === -1) || [];
			case QuizFilters.ONGOING:
				return quizes?.filter((quiz) => quiz.status === 0) || [];
			case QuizFilters.FINISHED:
				return quizes?.filter((quiz) => quiz.status === 1) || [];
			default:
				return quizes || [];
		}
	})();

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>Error</div>;
	}

	return (
		<div className="flex flex-col w-full m-10">
			<div className="flex flex-row">
				<div className="flex flex-col gap-5 sm:flex-row">
					<Button
						color="white"
						className="rounded-full"
						onClick={() => setQuizFilter(QuizFilters.ALL)}
					>
						All
					</Button>
					<Button
						color="yellow"
						className="rounded-full"
						onClick={() => setQuizFilter(QuizFilters.UPCOMING)}
					>
						Upcoming
					</Button>
					<Button
						color="light-green"
						className="rounded-full"
						onClick={() => setQuizFilter(QuizFilters.ONGOING)}
					>
						Ongoing
					</Button>
					<Button
						color="gray"
						className="rounded-full"
						onClick={() => setQuizFilter(QuizFilters.FINISHED)}
					>
						Finished
					</Button>
				</div>
			</div>
			<div className="flex flex-wrap gap-5 mt-5">
				<StartDialog
					open={openStart}
					setOpen={setOpenStart}
					quiz={selectedQuiz}
				/>
				{filteredQuizes.map((quiz) => (
					<QuizCard
						quiz={quiz}
						now={now}
						setOpenStart={setOpenStart}
						setSelectedQuiz={setSelectedQuiz}
					/>
				))}
			</div>
		</div>
	);
};

export default Index;
