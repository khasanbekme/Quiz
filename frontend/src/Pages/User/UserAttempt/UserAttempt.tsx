import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../../Hooks/useAxiosPrivate";
import { QuestionGroup, QuizCategory } from "../Quizes/Grid";
import { useNavigate, useParams } from "react-router-dom";
import { useCurrentDateTime } from "../../../Hooks/useDatetime";
import { Button, IconButton, Typography } from "@material-tailwind/react";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { formatDeltaTime } from "../Quizes/QuizCard";
import Static from "../../../Api/static";

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

const QuestionNumber = (props: any) => {
	return (
		<IconButton
			className="w-16 h-16 rounded-full"
			variant={props.selected ? "filled" : "filled"}
			size="sm"
			color={props.active ? "blue" : props.selected ? "green" : "gray"}
			onClick={props.action}
		>
			{props.index}
		</IconButton>
	);
};

const UserAttemptPage = () => {
	const { attemptId } = useParams();
	const now = useCurrentDateTime();
	const [attempt, setAttempt] = useState<UserAttempt | null>(null);
	const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
		null
	);
	const navigate = useNavigate();
	const axiosPrivate = useAxiosPrivate();

	const fetchData = async () => {
		try {
			const response = await axiosPrivate.get(
				`/quiz/user-attempt/${attemptId}/`
			);
			const data = response.data;
			setAttempt({
				...data,
				started_at: new Date(data.start_time),
				end_time: new Date(data.end_time),
			});
			setSelectedQuestion(data.questions[0] || null);
		} catch {
			navigate("/user");
		}
	};

	const optionLetter = (index: number) => {
		return String.fromCharCode(64 + index) + ")";
	};

	const selectOption = async (questionId: number, optionId: number) => {
		if (!selectedQuestion || !attempt) return;
		if (
			selectedQuestion.options.some(
				(option) => option.id === optionId && option.selected
			)
		)
			return;
		const updatedOptions = selectedQuestion.options.map((option) =>
			option.id === optionId
				? { ...option, selected: true }
				: { ...option, selected: false }
		);
		setSelectedQuestion({
			...selectedQuestion,
			options: updatedOptions,
		});
		setAttempt({
			...attempt,
			questions: attempt.questions.map((question) =>
				question.id === questionId
					? { ...question, options: updatedOptions }
					: question
			),
		});
		await axiosPrivate.post("/quiz/select-option/", {
			questionId,
			optionId,
		});
	};

	useEffect(() => {
		fetchData();
	}, []);

	if (!attempt) {
		return <>Loading...</>;
	}

	return (
		<div className="flex flex-grow">
			<div className="flex flex-col max-w-[20vw] shadow-md rounder-md">
				<Typography
					variant="h5"
					className="font-sans text-bold bg-gray-100 text-blue-gray-700 shadow-md rounder-md px-8 py-3"
				>
					{attempt?.quiz.title}
				</Typography>

				<div className="flex flex-col py-4 gap-5">
					{!attempt.quiz.grouped_questions ? (
						<div className="flex flex-wrap gap-2 justify-center">
							{attempt.questions.map((value, index) => (
								<QuestionNumber
									index={index + 1}
									selected={
										value.options.filter(
											(option) => option.selected
										).length !== 0
									}
									active={value.id === selectedQuestion?.id}
									action={() => {
										setSelectedQuestion(value);
									}}
								/>
							))}
						</div>
					) : (
						attempt.quiz.question_groups.map((group) => {
							return (
								<div className="flex flex-col gap-4">
									<Typography
										variant="h6"
										className="flex font-sans bg-blue-50 text-blue-gray-700 shadow-md rounder-md px-8 py-2 justify-center"
									>
										{`${
											group.title
										}   -   ${group.point.toFixed(1)}`}
									</Typography>
									<div className="flex flex-wrap gap-2 items-center justify-center">
										{attempt.questions
											.filter(
												(question) =>
													question.group === group.id
											)
											.map((value, index) => (
												<QuestionNumber
													index={index + 1}
													selected={
														value.options.filter(
															(option) =>
																option.selected
														).length !== 0
													}
													active={
														value.id ===
														selectedQuestion?.id
													}
													action={() => {
														setSelectedQuestion(
															value
														);
													}}
												/>
											))}
									</div>
								</div>
							);
						})
					)}
				</div>
				<div className="flex flex-grow items-end">
					<Button
						variant="gradient"
						color="light-green"
						fullWidth
						className="rounded-none"
					>
						Submit
					</Button>
				</div>
			</div>
			<div className="flex flex-grow flex-col">
				<div className="flex items-center justify-center mt-2">
					<p className="text-2xl">
						{formatDeltaTime(attempt.end_time, now)}
					</p>
				</div>
				{selectedQuestion && (
					<div className="flex flex-col flex-grow items-center mt-20 m-5 gap-6">
						<div className="flex flex-col gap-2">
							<Typography variant="lead">
								{`${selectedQuestion.question_order + 1}. ${
									selectedQuestion.body_text
								}`}
							</Typography>
							{selectedQuestion.body_photo && (
								<img
									className="h-32 w-full object-cover object-center"
									alt="body"
									src={Static(selectedQuestion.body_photo)}
								/>
							)}
						</div>
						<div className="flex flex-wrap gap-16 items-center justify-center">
							{selectedQuestion.options.map((option, index) => (
								<div
									className={`flex flex-row gap-4 shadow-md cursor-pointer rounded-md px-6 py-3 ${
										option.selected
											? "bg-blue-300"
											: "bg-gray-50 active:bg-blue-300 hover:bg-gray-100"
									}`}
									onClick={() =>
										selectOption(
											selectedQuestion.id,
											option.id
										)
									}
								>
									<Typography
										variant="lead"
										className="flex items-center justify-center"
									>
										{optionLetter(index + 1)}
									</Typography>
									<div className="flex flex-col items-center justify-center">
										<Typography variant="parahraph">
											{option.body_text}
										</Typography>
										{option.body_photo && (
											<img
												className="h-32 w-full object-cover object-center"
												alt="body"
												src={Static(option.body_photo)}
											/>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				)}
				<div className="flex flex-wrap justify-between mx-20 gap-5">
					<Button className="flex flex-row items-center">
						<ArrowLeftIcon className="w-5 h-5 mr-2" />
						<Typography>Back</Typography>
					</Button>
					<Button className="flex flex-row items-center">
						<Typography>Next</Typography>
						<ArrowRightIcon className="w-5 h-5 ml-2" />
					</Button>
				</div>
			</div>
		</div>
	);
};

export default UserAttemptPage;
