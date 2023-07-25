/* eslint-disable react-hooks/exhaustive-deps */
import {
	Input,
	Checkbox,
	Typography,
	Button,
	IconButton,
	Menu,
	MenuHandler,
	MenuList,
	MenuItem,
	Card,
} from "@material-tailwind/react";
import {
	ArrowDownTrayIcon,
	ChevronUpIcon,
	ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";
import useAxiosPrivate from "../../../../../../Hooks/useAxiosPrivate";
import { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import DeleteDialog from "./DeleteBulk";
import AddQuestion from "./AddQuestion";
import EditDialog from "./ScoreEditDialog";

type Props = {
	quizId: number;
};

type Category = {
	id: number;
	name: string;
};

type QuestionType = {
	id: number;
	category: null | Category;
	body_text: string | null;
	body_photo: string | null;
};

export type QuizQuestion = {
	selected: boolean;
	id: number;
	quiz: number;
	question: QuestionType;
	order_number: number;
	score: number;
};

const TABLE_HEAD = [
	"Order",
	"Category",
	"Question body",
	"Score",
	"Change order",
];

const QuizQuestions = ({ quizId }: Props) => {
	const axiosPrivate = useAxiosPrivate();

	const [perPage, setPerPage] = useState<number>(20);
	const [active, setActive] = useState(1);
	const [pages, setPages] = useState(0);
	const [questions, setQuestions] = useState<QuizQuestion[]>([]);
	const [openDelete, setOpenDelete] = useState(false);
	const [openScoreEdit, setOpenScoreEdit] = useState(false);
	const [openAdd, setOpenAdd] = useState(false);
	const [selectAll, setSelectAll] = useState(true);
	const selectedQuestions = questions.filter((question) => question.selected);

	const getItemProps = (index: number) =>
		({
			variant: active === index ? "filled" : "text",
			color: active === index ? "blue" : "blue-gray",
			onClick: () => setActive(index),
			className: "rounded-full",
		} as any);

	const next = () => {
		if (active === pages) return;

		setActive(active + 1);
	};

	const prev = () => {
		if (active === 1) return;

		setActive(active - 1);
	};

	const fetchQuestions = async () => {
		try {
			const response = await axiosPrivate.get("/quiz/quiz-question/", {
				params: {
					quiz: quizId,
					per_page: perPage,
					page: active,
				},
			});
			if (response.status === 200) {
				setQuestions(
					response.data.results.map((value: any) => {
						return { selected: false, ...value };
					})
				);
				setPages(Math.ceil(response.data.count / perPage));
			}
		} catch (error) {
			console.log(error);
			setActive(1);
		}
	};

	useEffect(() => {
		setActive(1);
	}, []);

	useEffect(() => {
		if (!openAdd) {
			fetchQuestions();
		}
	}, [active, openAdd]);

	const deleteBulk = async () => {
		const toDelete = selectedQuestions.map(({ selected, ...value }) => {
			return { id: value.question.id };
		});
		const response_deleted = await axiosPrivate.delete(
			"/quiz/quiz-question-bulk/",
			{
				data: toDelete,
			}
		);
		if (response_deleted.status === 204) {
			fetchQuestions();
			setSelectAll(true);
		}
	};

	const scorEditBulk = async (newScore: number) => {
		const objects = selectedQuestions.map((value) => value.id);

		const toEdit = {
			objects,
			score: newScore,
		};

		const response_updated = await axiosPrivate.put(
			"/quiz/quiz-question-bulk/",
			toEdit
		);
		if (response_updated.status === 200) {
			setQuestions(
				questions.map((value) => {
					return value.selected
						? { ...value, score: newScore, selected: false }
						: value;
				})
			);
			setSelectAll(true);
		}
	};

	const handleSelectAll = () => {
		setQuestions((prevQuestions) =>
			prevQuestions.map((question) => {
				return { ...question, selected: selectAll };
			})
		);
		setSelectAll((value) => !value);
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

	const handleOrder = async (index: number, up: boolean) => {
		if (index === 0 && up) return;
		const [currentRow] = questions.slice(index, index + 1);
		const [targetRow] = questions.slice(
			index - (up ? 1 : -1),
			index - (up ? 1 : -1) + 1
		);
		if (!currentRow || !targetRow) return;

		const response = await axiosPrivate.put("/quiz/swap-questions/", {
			object1: currentRow.id,
			object2: targetRow.id,
		});

		if (response.status === 200) {
			[currentRow.order_number, targetRow.order_number] = [
				targetRow.order_number,
				currentRow.order_number,
			];

			setQuestions((prevQuestions) => {
				const newQuestions = [...prevQuestions];
				newQuestions[index] = targetRow;
				newQuestions[index - (up ? 1 : -1)] = currentRow;
				return newQuestions;
			});
		}
	};

	return (
		<div className="w-full flex flex-col flex-grow">
			<DeleteDialog
				open={openDelete}
				setOpen={setOpenDelete}
				action={deleteBulk}
			/>
			<EditDialog
				open={openScoreEdit}
				setOpen={setOpenScoreEdit}
				action={scorEditBulk}
			/>
			<AddQuestion open={openAdd} setOpen={setOpenAdd} quizId={quizId} />
			<div className="flex flex-row justify-between">
				<div className="flex flex-row justify-between gap-16">
					<div className="relative flex w-full max-w-[24rem]">
						<Input
							type="number"
							label="Per page"
							value={perPage}
							onChange={(e) => setPerPage(Number(e.target.value))}
							className="pr-20"
							containerProps={{
								className: "min-w-0",
							}}
						/>
						<Button
							size="sm"
							color="blue"
							disabled={perPage <= 0}
							onClick={() => {
								fetchQuestions();
								setSelectAll(true);
							}}
							className="!absolute right-1 top-1 rounded"
						>
							Filter
						</Button>
					</div>
				</div>
				<div className="flex flex-row justify-between gap-10">
					<Button
						size="sm"
						variant="gradient"
						color="light-green"
						className="flex items-center gap-3"
						onClick={() => setOpenAdd(true)}
					>
						Import Questions
						<ArrowDownTrayIcon
							strokeWidth={2}
							className="h-5 w-5"
						/>
					</Button>
					<Menu>
						<MenuHandler>
							<Button className="flex items-center gap-3">
								Actions
								<ChevronDownIcon
									strokeWidth={2}
									className="h-5 w-5"
								/>
							</Button>
						</MenuHandler>
						<MenuList>
							<MenuItem
								onClick={() =>
									selectedQuestions.length &&
									setOpenDelete(true)
								}
								className="text-red-500 focus:text-red-600"
							>
								Remove question
							</MenuItem>
							<MenuItem
								onClick={() =>
									selectedQuestions.length &&
									setOpenScoreEdit(true)
								}
							>
								Change score
							</MenuItem>
						</MenuList>
					</Menu>
				</div>
			</div>
			<Card className="h-auto w-auto mt-2 mb-1 overflow-scroll max-h-[73vh] rounded-none shadow-none">
				<table className="w-full min-w-max table-auto text-left">
					<thead className="sticky top-0 z-50">
						<tr>
							<th
								key="select-all"
								className="border-b border-blue-gray-100 bg-blue-gray-50 px-4 py-2"
							>
								<div className="flex">
									<input
										key="select_all"
										type="checkbox"
										className="px-2 py-2 form-checkbox text-indigo-600 h-5 w-5 rounded border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
										checked={!selectAll}
										onChange={handleSelectAll}
									/>
								</div>
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
							({ selected, id, question, score }, index) => {
								const classes =
									"px-2 py-1 border-b border-gray-300";
								return (
									<tr
										key={`quiz-question-${id}`}
										className="hover:bg-gray-100 cursor-pointer"
										onClick={() => handleCheckboxChange(id)}
									>
										<td className="px-1 py-1 border-b border-gray-300">
											<Checkbox
												checked={selected}
												onClick={(e: any) => {
													e.stopPropagation();
												}}
												onChange={() => {
													handleCheckboxChange(id);
												}}
											/>
										</td>
										<td className={classes}>
											<p
												color="blue-gray"
												className="font-normal"
											>
												{index + 1}
											</p>
										</td>
										<td className={classes}>
											{question.category &&
												question.category.name}
										</td>
										<td className={classes}>
											<p
												color="blue-gray"
												className="font-normal"
											>
												{question.body_text
													? question.body_text
															.length > 70
														? `${question.body_text.substring(
																0,
																70
														  )}...`
														: question.body_text
													: question.body_photo && (
															<img
																className="h-10 w-auto"
																src={
																	question.body_photo
																}
																alt="Question body"
															/>
													  )}
											</p>
										</td>
										<td className={classes}>
											<p
												color="blue-gray"
												className="font-normal"
											>
												{score}
											</p>
										</td>
										<td className={classes}>
											<div>
												<Button
													className="border-r-0 rounded-r-none bg-blue-400"
													onClick={(e) => {
														e.stopPropagation();
														handleOrder(
															index,
															true
														);
													}}
												>
													<ChevronUpIcon
														strokeWidth={3}
														className="h-3 w-3"
													/>
												</Button>
												<Button
													className="border-l-0 rounded-l-none bg-gray-600"
													onClick={(e) => {
														e.stopPropagation();
														handleOrder(
															index,
															false
														);
													}}
												>
													<ChevronDownIcon
														strokeWidth={3}
														className="h-3 w-3"
													/>
												</Button>
											</div>
										</td>
									</tr>
								);
							}
						)}
					</tbody>
				</table>
			</Card>
			<div className="flex items-center gap-4">
				<Button
					variant="text"
					color="blue-gray"
					className="flex items-center gap-2"
					onClick={prev}
					disabled={active === 1}
				>
					<ArrowLeftIcon strokeWidth={2} className="h-3 w-3" />{" "}
					Previous
				</Button>
				<div className="flex items-center gap-2">
					{Array.from({ length: pages }, (_, index) => (
						<IconButton
							className="w-2 h-2"
							size="sm"
							key={`page-${index}`}
							{...getItemProps(index + 1)}
						>
							{index + 1}
						</IconButton>
					))}
				</div>
				<Button
					variant="text"
					color="blue-gray"
					className="flex items-center gap-2 rounded-full"
					onClick={next}
					disabled={active === pages}
				>
					Next
					<ArrowRightIcon strokeWidth={2} className="h-3 w-3" />
				</Button>
			</div>
		</div>
	);
};

export default QuizQuestions;
