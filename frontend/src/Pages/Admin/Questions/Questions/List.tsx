/* eslint-disable react-hooks/exhaustive-deps */
import {
	Card,
	Typography,
	Button,
	IconButton,
	Input,
	Dialog,
	DialogBody,
	DialogFooter,
} from "@material-tailwind/react";
import {
	PlusCircleIcon,
	ArrowRightIcon,
	ArrowLeftIcon,
	ArrowUpCircleIcon,
} from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import useAxiosPrivate from "../../../../Hooks/useAxiosPrivate";
import CreateDialog from "./CreateDialog";
import EditDialog from "./EditDialog";
import ExcelUpload from "./ExcelUpload";

const TABLE_HEAD = ["ID", "Category", "Body", "Score", "Delete"];

export type Question = {
	id: number;
	body_text: string | null;
	body_photo: string | null;
	category: Category;
	score: number;
};

export type Category = {
	id: number;
	name: string;
	total_questions: number;
};

export default function QuestionList() {
	const [active, setActive] = useState(1);
	const [searchKey, setSearchKey] = useState("");
	const [openCreateDG, setOpenCreateDG] = useState(false);
	const [openEditDG, setOpenEditDG] = useState(false);
	const [openDelete, setOpenDelete] = useState(false);
	const [openExcelUpload, setExcelUpload] = useState(false);
	const [pages, setPages] = useState(0);
	const [categories, setCategories] = useState<Category[]>([] as Category[]);
	const [questions, setQuestions] = useState<Question[]>([] as Question[]);
	const [selectedQuestion, setSelectedQuestion] = useState<number>(0);
	const [perPage, setPerPage] = useState<number>(20);
	const [selectedCategory, setSelectedCategory] = useState<number>(0);

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

	const axiosPrivate = useAxiosPrivate();

	const fetchCategories = async () => {
		const response = await axiosPrivate.get("/quiz/question-category/");
		if (response.status === 200) {
			setCategories(response.data);
		}
	};

	const fetchQuestions = async () => {
		const response = await axiosPrivate.get("/quiz/question/", {
			params: {
				per_page: perPage,
				category: selectedCategory !== 0 ? selectedCategory : "",
				page: active,
				search: searchKey,
			},
		});
		if (response.status === 200) {
			setQuestions(response.data.results);
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
		if (openCreateDG === false && openEditDG === false) fetchQuestions();
	}, [openCreateDG, openEditDG, openExcelUpload, active, selectedCategory]);

	const deleteQuestion = async () => {
		if (selectedQuestion === 0) return;
		await axiosPrivate.delete(`/quiz/question/${selectedQuestion}/`);
		fetchQuestions();
		setSelectedQuestion(0);
	};

	return (
		<div className="flex flex-grow ml-60 mt-4">
			<CreateDialog
				open={openCreateDG}
				setOpenCreateDG={setOpenCreateDG}
			/>
			<EditDialog
				open={openEditDG}
				setOpenEditDG={setOpenEditDG}
				questionId={selectedQuestion}
			/>
			<ExcelUpload
				open={openExcelUpload}
				setExcelUplaoad={setExcelUpload}
			/>
			<Dialog
				size="xs"
				open={openDelete}
				handler={() => setOpenDelete(!openDelete)}
			>
				<DialogBody>
					Are you sure you want to delete this question?
				</DialogBody>
				<DialogFooter>
					<Button
						variant="text"
						color="blue"
						onClick={() => setOpenDelete(!openDelete)}
						className="mr-5"
					>
						<span>Cancel</span>
					</Button>
					<Button
						variant="gradient"
						color="red"
						onClick={async () => {
							await deleteQuestion();
							setOpenDelete(!openDelete);
						}}
					>
						<span>Delete</span>
					</Button>
				</DialogFooter>
			</Dialog>
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
							<option value={0}>All categories</option>
							{categories.map((category) => (
								<option key={category.id} value={category.id}>
									{`${category.name} - ${category.total_questions}`}
								</option>
							))}
						</select>
						<Button
							size="sm"
							variant="gradient"
							color="light-blue"
							className="w-52"
							onClick={fetchQuestions}
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
							{questions.map(
								({
									id,
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
											onClick={() => {
												setSelectedQuestion(id);
												setOpenEditDG(true);
											}}
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
													{category && category.name}
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
											<td className={classes}>
												<Button
													size="sm"
													color="red"
													onClick={(e: any) => {
														e.stopPropagation();
														setSelectedQuestion(id);
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
				<div className="absolute right-[calc(2vw)] bottom-6">
					<div className="flex flex-row gap-2">
						<Button
							onClick={() => {
								setOpenCreateDG(true);
							}}
							className="h-16 w-16 bg-blue-500 p-2 rounded-full"
						>
							<PlusCircleIcon />
						</Button>
						<Button
							onClick={() => {
								setExcelUpload(true);
							}}
							className="h-16 w-16 bg-green-500 p-2 rounded-full"
						>
							<ArrowUpCircleIcon />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
