/* eslint-disable react-hooks/exhaustive-deps */
import {
	Card,
	Typography,
	Button,
	IconButton,
	Input,
} from "@material-tailwind/react";
import moment from "moment";
import {
	ArrowRightIcon,
	ArrowLeftIcon,
	PlusCircleIcon,
} from "@heroicons/react/24/solid";

import { useEffect, useState } from "react";

import useAxiosPrivate from "../../../../../Hooks/useAxiosPrivate";
import DeleteDialog from "./DeleteDialog";
import { useNavigate } from "react-router-dom";

type Quiz = {
	id: number;
	title: string;
	description: string;
	category: number | null;
	start_time: string;
	duration: number;
	access: string;
	total_questions: number;
	total_participants: number;
	questions: number;
};

type Category = {
	id: number;
	name: string;
};

const TABLE_HEAD = [
	"ID",
	"Title",
	"Category",
	"Start time",
	"Duration",
	"Access",
	"Questions",
	"Participants",
	"Delete",
];

const QuizList = () => {
	const [perPage, setPerPage] = useState(20);
	const [pages, setPages] = useState(0);
	const [active, setActive] = useState(1);
	const [searchKey, setSearchKey] = useState("");
	const [openDelete, setOpenDelete] = useState(false);
	const [categories, setCategories] = useState<Category[]>([]);
	const [selectedCategory, setSelectedCategory] = useState(0);
	const [quizes, setQuizes] = useState<Quiz[]>([]);
	const [selectedQuiz, setSelectedQuiz] = useState(0);

	const axiosPrivate = useAxiosPrivate();
	const navigate = useNavigate();

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

	const fetchCategories = async () => {
		const response = await axiosPrivate.get("/quiz/quiz-category/");
		if (response.status === 200) {
			setCategories(response.data);
		}
	};

	const fetchQuizes = async () => {
		const response = await axiosPrivate.get("/quiz/quiz/", {
			params: {
				per_page: perPage,
				category: selectedCategory !== 0 ? selectedCategory : "",
				page: active,
				search: searchKey,
			},
		});
		if (response.status === 200) {
			setQuizes(response.data.results);
			setPages(Math.ceil(response.data.count / perPage));
		}
	};

	useEffect(() => {
		fetchCategories();
	}, []);

	useEffect(() => {
		setActive(1);
	}, [selectedCategory]);

	useEffect(() => {
		fetchQuizes();
	}, [active]);

	const deleteQuiz = async () => {
		if (selectedQuiz === 0) return;
		await axiosPrivate.delete(`/quiz/quiz/${selectedQuiz}/`);
		setQuizes(quizes.filter((quiz) => quiz.id !== selectedQuiz));
		setSelectedQuiz(0);
	};

	return (
		<div className="flex flex-grow ml-60 mt-4">
			<DeleteDialog
				open={openDelete}
				setOpen={setOpenDelete}
				action={deleteQuiz}
			/>
			<div className="flex flex-col w-full">
				<div className="flex flex-row justify-between px-5">
					<div>
						<Input
							label="Per page"
							type="number"
							value={perPage}
							onChange={(e) => setPerPage(Number(e.target.value))}
						/>
					</div>
					<div className="flex flex-row justify-between gap-3">
						<Input
							label="Search"
							defaultValue={searchKey}
							onChange={(event) => {
								setActive(1);
								setSearchKey(event.target.value);
							}}
						/>
						<select
							value={selectedCategory}
							className="w-full px-1 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:border-2 focus:border-blue-500 text-base font-medium text-gray-700"
							onChange={(e) =>
								setSelectedCategory(Number(e.target.value))
							}
						>
							<option key="grade-0" value={0}>
								All categories
							</option>
							{categories.map((category) => (
								<option
									key={`grade-${category.id}`}
									value={category.id}
								>
									{category.name}
								</option>
							))}
						</select>
						<Button
							size="sm"
							variant="gradient"
							color="light-blue"
							className="w-52"
							onClick={fetchQuizes}
						>
							Filter
						</Button>
					</div>
				</div>
				<Card className="h-auto w-auto mt-2 mb-3 overflow-scroll max-h-[80vh] rounded-none shadow-none">
					<table className="w-full min-w-max table-auto text-left">
						<thead className="sticky top-0 z-50">
							<tr>
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
							{quizes.map(
								({
									id,
									title,
									category,
									start_time,
									duration,
									access,
									questions,
									total_participants,
								}) => {
									const classes =
										"px-2 py-1 border-b border-gray-300";
									return (
										<tr
											key={`user-${id}`}
											className="hover:bg-gray-100 cursor-pointer"
											onClick={() =>
												navigate(
													`/admin/quiz-edit/${id}`
												)
											}
										>
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
													{title}
												</p>
											</td>
											<td className={classes}>
												<p
													color="blue-gray"
													className="font-normal"
												>
													{category &&
														categories.find(
															(obj) =>
																obj.id ===
																category
														)?.name}
												</p>
											</td>
											<td className={classes}>
												<p
													color="blue-gray"
													className="font-normal"
												>
													{moment(start_time).format(
														"DD/MM/YYYY, HH:mm"
													)}
												</p>
											</td>
											<td className={classes}>
												<p
													color="blue-gray"
													className="font-normal"
												>
													{duration}
												</p>
											</td>
											<td className={classes}>
												<p
													color="blue-gray"
													className="font-normal"
												>
													{access}
												</p>
											</td>
											<td className={classes}>
												<p
													color="blue-gray"
													className="font-normal"
												>
													{questions}
												</p>
											</td>
											<td className={classes}>
												<p
													color="blue-gray"
													className="font-normal"
												>
													{access === "public"
														? "All"
														: total_participants}
												</p>
											</td>
											<td className={classes}>
												<Button
													size="sm"
													color="red"
													onClick={(e: any) => {
														e.stopPropagation();
														setSelectedQuiz(id);
														setOpenDelete(true);
													}}
												>
													Delete
												</Button>
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
						<ArrowLeftIcon strokeWidth={2} className="h-4 w-4" />{" "}
						Previous
					</Button>
					<div className="flex items-center gap-2">
						{Array.from({ length: pages }, (_, index) => (
							<IconButton
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
						<ArrowRightIcon strokeWidth={2} className="h-4 w-4" />
					</Button>
				</div>
			</div>
			<div className="absolute right-[calc(2vw)] bottom-6">
				<div className="flex flex-row gap-2">
					<Button
						onClick={() => {
							navigate("/admin/quiz-edit/0");
						}}
						className="h-16 w-16 bg-blue-500 p-2 rounded-full"
					>
						<PlusCircleIcon />
					</Button>
				</div>
			</div>
		</div>
	);
};

export default QuizList;
