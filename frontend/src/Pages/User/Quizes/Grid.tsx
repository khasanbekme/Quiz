import useAxiosPrivate from "../../../Hooks/useAxiosPrivate";
import { useQuery } from "react-query";
import QuizCard from "./QuizCard";
import { useCurrentDateTime } from "../../../Hooks/useDatetime";
import { useState } from "react";
import StartDialog from "./StartDialog";

type QuizCategory = {
	id: number;
	name: string;
};

type QuestionGroup = {
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
	left_attempts: number;
	active: { id: number; end_time: Date } | null;
};

const Index = () => {
	const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
	const [openStart, setOpenStart] = useState(false);

	const axiosPrivate = useAxiosPrivate();
	const now = useCurrentDateTime();

	const fetchApiData = async (): Promise<Quiz[]> => {
		const response = await axiosPrivate.get<Quiz[]>("/quiz/user-quiz/");
		const data = response.data.map(({ start_time, end_time, ...value }) => {
			return {
				...value,
				start_time: new Date(start_time),
				end_time: new Date(end_time),
			};
		});
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

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>Error</div>;
	}

	return (
		<div className="flex flex-wrap gap-10 m-10">
			<StartDialog
				open={openStart}
				setOpen={setOpenStart}
				quiz={selectedQuiz}
			/>
			{quizes?.map((quiz) => (
				<QuizCard
					quiz={quiz}
					now={now}
					setOpenStart={setOpenStart}
					setSelectedQuiz={setSelectedQuiz}
				/>
			))}
		</div>
	);
};

export default Index;
