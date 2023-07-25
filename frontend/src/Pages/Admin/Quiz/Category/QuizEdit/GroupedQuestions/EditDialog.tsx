import { useEffect, useState } from "react";

import {
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	Button,
	Input,
	Switch,
} from "@material-tailwind/react";

import { XMarkIcon } from "@heroicons/react/24/outline";
import useAxiosPrivate from "../../../../../../Hooks/useAxiosPrivate";

type Props = {
	open: boolean;
	setOpen: (open: boolean) => void;
	groupId: number;
	quizId: number;
};

type Category = {
	id: number;
	name: string;
	total_questions: number;
};

type Group = {
	id?: number;
	quiz: number;
	title: string;
	group: number;
	random_questions: boolean;
	random_options: boolean;
	total_questions: number;
	order_number: number;
	point: number;
};

const BlankGroup: Group = {
	quiz: 0,
	title: "",
	group: 0,
	random_questions: false,
	random_options: false,
	total_questions: 0,
	order_number: 1,
	point: 1,
};

const EditDialog = ({ open, setOpen, groupId, quizId }: Props) => {
	const [categories, setCategories] = useState<Category[]>([]);
	const [group, setGroup] = useState<Group>(BlankGroup);
	const [questionLimit, setQuestionLimit] = useState(0);
	const axiosPrivate = useAxiosPrivate();

	const fetchCategories = async () => {
		const response = await axiosPrivate.get("/quiz/question-category/");
		if (response.status === 200) {
			setCategories(response.data);
			return response.data;
		}
	};

	const fetchData = async () => {
		const data = await fetchCategories();
		if (groupId !== 0) {
			const response = await axiosPrivate.get(
				`/quiz/quiz-question-group/${groupId}/`
			);
			if (response.status === 200) {
				setGroup(response.data);
				setQuestionLimit(
					data.find((value: any) => value.id === response.data.group)
						.total_questions
				);
			}
		} else {
			const limit = data[0]?.total_questions;
			setQuestionLimit(limit);
			setGroup({
				...BlankGroup,
				quiz: quizId,
				group: data[0]?.id,
				total_questions: limit,
			});
		}
	};

	useEffect(() => {
		if (open) {
			fetchData();
		} else {
			setGroup(BlankGroup);
		}
	}, [open]);

	const validToSave =
		group.title.length > 2 &&
		group.group !== 0 &&
		group.total_questions > 0 &&
		(group.random_questions
			? questionLimit >= group.total_questions
			: true) &&
		group.point > 0;

	const handleSave = async () => {
		let response: any;
		if (groupId === 0) {
			response = await axiosPrivate.post(
				"/quiz/quiz-question-group/",
				group
			);
		} else {
			response = await axiosPrivate.put(
				`/quiz/quiz-question-group/${groupId}/`,
				group
			);
		}
		if (response.status === 201 || response.status === 200) {
			setOpen(false);
		}
	};

	return (
		<Dialog size="sm" open={open} handler={() => setOpen(false)}>
			<div className="flex items-center justify-between">
				<DialogHeader>
					{groupId === 0
						? "Add new group"
						: `Edit group: ID-${groupId}`}
				</DialogHeader>
				<XMarkIcon
					className="mr-3 h-5 w-5 cursor-pointer"
					onClick={() => setOpen(false)}
				/>
			</div>
			<DialogBody divider className="flex flex-col gap-3">
				<Input
					label="Title"
					defaultValue={group.title}
					onChange={(e) =>
						setGroup({
							...group,
							title: e.target.value,
						})
					}
				/>
				<Input
					label="Point"
					type="number"
					value={group.point}
					onChange={(e) =>
						setGroup({
							...group,
							point: Number(e.target.value),
						})
					}
				/>
				<select
					value={group.group}
					className="w-full px-1 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:border-2 focus:border-blue-500 text-base font-medium text-gray-700"
					onChange={(e) => {
						const newLimit =
							categories.find(
								(value) => value.id === Number(e.target.value)
							)?.total_questions || 0;
						setGroup({
							...group,
							group: Number(e.target.value),
							total_questions: group.random_questions
								? 0
								: newLimit,
						});
						setQuestionLimit(newLimit);
					}}
				>
					{categories.map((category) => (
						<option
							key={`grade-${category.id}`}
							value={category.id}
						>
							{`${category.name} - ${category.total_questions}`}
						</option>
					))}
				</select>
				<Switch
					id="random_questions"
					label="Random questions"
					checked={group.random_questions}
					onChange={() => {
						setGroup({
							...group,
							total_questions: group.random_questions
								? questionLimit
								: group.total_questions,
							random_questions: !group.random_questions,
						});
					}}
				/>
				<Switch
					id="random_options"
					label="Random options"
					checked={group.random_options}
					onChange={() => {
						setGroup({
							...group,
							random_options: !group.random_options,
						});
					}}
				/>
				<Input
					label="Total questions"
					type="number"
					disabled={!group.random_questions}
					value={group.total_questions}
					onChange={(e) =>
						setGroup({
							...group,
							total_questions: Number(e.target.value),
						})
					}
				/>
			</DialogBody>
			<DialogFooter className="space-x-2">
				<Button
					variant="outlined"
					color="red"
					onClick={() => {
						setOpen(false);
					}}
				>
					Cancel
				</Button>
				<Button
					variant="gradient"
					color="green"
					onClick={handleSave}
					disabled={!validToSave}
				>
					Save
				</Button>
			</DialogFooter>
		</Dialog>
	);
};

export default EditDialog;
