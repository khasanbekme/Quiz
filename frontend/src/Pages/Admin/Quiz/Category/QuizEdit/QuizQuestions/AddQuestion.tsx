/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import {
	Button,
	DialogBody,
	DialogFooter,
	Dialog,
	DialogHeader,
	Input,
	Card,
	Typography,
	Checkbox,
	Select,
	Option,
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import useAxiosPrivate from "../../../../../../Hooks/useAxiosPrivate";

type Props = {
	open: boolean;
	quizId: number;
	setOpen: (open: boolean) => void;
};

type Category = {
	id: number;
	name: string;
	total_questions: number;
};

type Question = {
	selected: boolean;
	id: number;
	body_text: string | null;
	body_photo: string | null;
	category: Category | null;
	score: number;
};

const TABLE_HEAD = ["ID", "Category", "Body", "Score"];

const AddQuestion = ({ open, quizId, setOpen }: Props) => {
	const [searchKey, setSearchKey] = useState("");
	const [categories, setCategories] = useState<Category[]>([]);
	const [selectedCategory, setSelectedCategory] = useState(0);
	const [addedQuestions, setAddedQuestions] = useState<number[]>([]);
	const [lastOrder, setLastOrder] = useState(1);
	const [questions, setQuestions] = useState<Question[]>([]);
	const [selectAll, setSelectAll] = useState(true);
	const [defualtScoring, setDefaultScoring] = useState(true);
	const [customScore, setCustomScore] = useState(1);

	const axiosPrivate = useAxiosPrivate();

	const fetchAddedQuestions = async () => {
		const response = await axiosPrivate.get("/quiz/quiz-questions-ids/", {
			params: {
				quiz_id: quizId,
			},
		});
		if (response.status === 200) {
			setAddedQuestions(response.data.numbers);
			setLastOrder(response.data.max_order_number);
			return response.data.numbers;
		}
	};

	const fetchCategories = async () => {
		const response = await axiosPrivate.get("/quiz/question-category/");
		if (response.status === 200) {
			setCategories(response.data);
		}
	};

	const fetchQuestions = async () => {
		const exclude_ids =
			addedQuestions.length === 0
				? await fetchAddedQuestions()
				: addedQuestions;
		const response = await axiosPrivate.get("/quiz/question/", {
			params: {
				per_page: selectedCategory !== 0 ? 10 ** 6 : 30,
				category: selectedCategory !== 0 ? selectedCategory : "",
				page: 1,
				search: searchKey,
			},
		});
		if (response.status === 200) {
			const newQuestions = response.data.results.reduce(
				(acc: any, value: any) => {
					if (!exclude_ids.includes(value.id)) {
						acc.push({ ...value, selected: false });
					}
					return acc;
				},
				[]
			);
			setQuestions(newQuestions);
		}
	};

	const handleCheckboxChange = (questionId: number) => {
		setQuestions((prevQuestions) =>
			prevQuestions.map((question) =>
				question.id === questionId
					? { ...question, selected: !question.selected }
					: question
			)
		);
	};

	useEffect(() => {
		if (open) {
			fetchCategories();
		} else {
			setCategories([]);
			setAddedQuestions([]);
			setQuestions([]);
			setDefaultScoring(true);
			setCustomScore(1);
			setSelectAll(true);
			setSelectedCategory(0);
			setSearchKey("");
		}
	}, [open]);

	useEffect(() => {
		if (open) {
			fetchQuestions();
		}
	}, [open, selectedCategory, searchKey]);

	const handleSelectAll = () => {
		setQuestions((prevQuestions) =>
			prevQuestions.map((question) => {
				return { ...question, selected: selectAll };
			})
		);
		setSelectAll((value) => !value);
	};

	const handleAdd = async () => {
		const added_data = questions
			.filter((question) => question.selected)
			.map((value, index) => {
				return {
					quiz: quizId,
					question: value.id,
					order_number: lastOrder + index,
					score: defualtScoring ? value.score : customScore,
				};
			});
		const response_created = await axiosPrivate.post(
			"/quiz/quiz-question-bulk/",
			added_data
		);

		if (response_created.status === 201) {
			setOpen(false);
		}
	};

	return (
		<Dialog size="xl" open={open} handler={() => setOpen(false)}>
			<div className="flex items-center justify-between">
				<DialogHeader>Add questions</DialogHeader>
				<XMarkIcon
					className="mr-3 h-5 w-5 cursor-pointer"
					onClick={() => setOpen(false)}
				/>
			</div>
			<DialogBody divider>
				<div className="flex flex-row justify-between gap-16">
					<div className="flex flex-row justify-between gap-6">
						<Input
							placeholder="Search ID, Keyword"
							className="focus:!border-blue-500"
							labelProps={{
								className: "hidden",
							}}
							value={searchKey}
							onChange={(e) => setSearchKey(e.target.value)}
						/>
						<select
							value={selectedCategory}
							className="w-48 px-1 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:border-2 focus:border-blue-500 text-base font-medium text-gray-700"
							onChange={(e) =>
								setSelectedCategory(Number(e.target.value))
							}
						>
							<option value={0}>All categories</option>
							{categories.map((category) => (
								<option key={category.id} value={category.id}>
									{`${category.name} - ${category.total_questions}`}
								</option>
							))}
						</select>
					</div>
					<div className="flex flex-row justify-between gap-8">
						<Select
							label="Score by"
							value="default"
							onChange={(value: any) => {
								setDefaultScoring(value === "default");
							}}
						>
							<Option key="default" value="default">
								Default
							</Option>
							<Option key="custom" value="custom">
								Custom score:
							</Option>
						</Select>
						<Input
							label="Score"
							type="number"
							value={customScore}
							onChange={(e) =>
								setCustomScore(Number(e.target.value))
							}
							disabled={defualtScoring}
						/>
					</div>
				</div>
				<Card className="h-auto w-auto mt-2 mb-3 overflow-scroll max-h-[70vh] rounded-none shadow-none">
					<table className="w-full min-w-max table-auto text-left">
						<thead className="sticky top-0 z-50">
							<tr>
								<th
									key="select-all"
									className="border-b border-blue-gray-100 bg-blue-gray-50 px-2 py-2"
								>
									<input
										key="select_all"
										type="checkbox"
										className="ml-1 py-2 form-checkbox text-indigo-600 h-5 w-5 rounded border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
										checked={!selectAll}
										onChange={handleSelectAll}
									/>
								</th>
								{TABLE_HEAD.map((head) => (
									<th
										key={head}
										className="border-b border-blue-gray-100 bg-blue-gray-50 px-2 py-2"
									>
										<Typography
											variant="small"
											color="blue-gray"
											className="font-normal leading-none opacity-70"
										>
											{head}
										</Typography>
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{questions.map(
								({
									id,
									selected,
									body_text,
									body_photo,
									category,
									score,
								}) => {
									const classes =
										"px-2 py-1 border-b border-gray-300";

									return (
										<tr
											key={id}
											className="hover:bg-gray-100 cursor-pointer"
											onClick={() =>
												handleCheckboxChange(id)
											}
										>
											<td className="py-1 border-b border-gray-300">
												<Checkbox
													checked={selected}
													onClick={(e: any) => {
														e.stopPropagation();
													}}
													onChange={(e: any) => {
														handleCheckboxChange(
															id
														);
													}}
												/>
											</td>
											<td className={classes}>
												<p
													color="blue-gray"
													className="font-normal"
												>
													{id}
												</p>
											</td>
											<td className={classes}>
												<p
													color="blue-gray"
													className="font-normal"
												>
													{category?.name}
												</p>
											</td>
											<td className={classes}>
												{body_text
													? body_text.length > 70
														? `${body_text.substring(
																0,
																70
														  )}...`
														: body_text
													: body_photo && (
															<img
																className="h-10 w-auto"
																src={body_photo}
																alt="Question body"
															/>
													  )}
											</td>
											<td className={classes}>
												<p
													color="blue-gray"
													className="font-normal"
												>
													{score}
												</p>
											</td>
										</tr>
									);
								}
							)}
						</tbody>
					</table>
				</Card>
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
				<Button variant="gradient" color="green" onClick={handleAdd}>
					Import
				</Button>
			</DialogFooter>
		</Dialog>
	);
};

export default AddQuestion;
