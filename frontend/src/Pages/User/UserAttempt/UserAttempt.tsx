import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../../Hooks/useAxiosPrivate";
import { QuestionGroup, QuizCategory } from "../Quizes/Grid";
import { useNavigate, useParams } from "react-router-dom";

type Option = {
	id: number;
	body_text: string | null;
	body_photo: string | null;
	option_order: number;
	selected: boolean;
};

type Question = {
	id: number;
	body_text: string | null;
	body_photo: string | null;
	group: number | null;
	question_order: number;
	options: Option[];
};

type Quiz = {
	id: number;
	title: string;
	description: string | null;
	category: QuizCategory | null;
    grouped_questions: boolean;
	question_groups: QuestionGroup[];
};

type UserAttempt = {
	id: number;
	quiz: Quiz;
	started_at: Date;
	end_time: Date;
	is_completed: boolean;
	completed_at: Date | null;
	questions: Question[];
};

const UserAttemptPage = () => {
	const { attemptId } = useParams();
	const [attempt, setAttempt] = useState<UserAttempt | null>(null);
	const navigate = useNavigate();
	const axiosPrivate = useAxiosPrivate();

	const fetchData = async () => {
		const response = await axiosPrivate.get(
			`/quiz/user-attempt/${attemptId}/`
		);
		if (response.status === 200) {
			const data = response.data;
			setAttempt({
				...data,
				started_at: new Date(data.start_time),
				end_time: new Date(data.end_time),
			});
		} else {
			navigate("/user");
		}
	};

	useEffect(() => {
        fetchData();
        console.log(attempt);
    }, []);

	return <div>UserAttempt</div>;
};

export default UserAttemptPage;
