/* eslint-disable react-hooks/exhaustive-deps */
import {
	Typography,
	Button,
	Card,
} from "@material-tailwind/react";
import {
	PlusCircleIcon,
	ChevronUpIcon,
	ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import useAxiosPrivate from "../../../../../../Hooks/useAxiosPrivate";
import DeleteDialog from "./DeleteDialog";
import EditDialog from "./EditDialog";

type Props = {
	quizId: number;
};

type QuestionGroup = {
	id: number;
	quiz: number;
	title: string;
	group: number;
	random_questions: boolean;
	random_options: boolean;
	total_questions: number;
	order_number: number;
	point: number;
};

const TABLE_HEAD = [
	"Order",
	"Name",
	"Questions",
	"Point",
	"Change order",
	"Delete",
];

const GroupedQuestions = ({ quizId }: Props) => {
	const axiosPrivate = useAxiosPrivate();

	const [groups, setGroups] = useState<QuestionGroup[]>([]);
	const [selectedGroup, setSelectedGroup] = useState(0);
	const [openDelete, setOpenDelete] = useState(false);
	const [openEdit, setOpenEdit] = useState(false);

	const fetchGroups = async () => {
		const response = await axiosPrivate.get("/quiz/quiz-question-group/", {
			params: {
				quiz: quizId,
			},
		});
		if (response.status === 200) {
			setGroups(
				response.data.map((value: any) => {
					return { selected: false, ...value };
				})
			);
		}
	};

	useEffect(() => {
		if (!openEdit) {
			fetchGroups();	
		}
	}, [openEdit])

	const handleOrder = async (index: number, up: boolean) => {
		if (index === 0 && up) return;
		const [currentRow] = groups.slice(index, index + 1);
		const [targetRow] = groups.slice(
			index - (up ? 1 : -1),
			index - (up ? 1 : -1) + 1
		);
		if (!currentRow || !targetRow) return;

		const response = await axiosPrivate.put("/quiz/swap-question-groups/", {
			object1: currentRow.id,
			object2: targetRow.id,
		});

		if (response.status === 200) {
			[currentRow.order_number, targetRow.order_number] = [
				targetRow.order_number,
				currentRow.order_number,
			];

			setGroups((prevGroups) => {
				const newQuestions = [...prevGroups];
				newQuestions[index] = targetRow;
				newQuestions[index - (up ? 1 : -1)] = currentRow;
				return newQuestions;
			});
		}
	};

	const deleteAction = async () => {
		await axiosPrivate.delete(
			`/quiz/quiz-question-group/${selectedGroup}/`
		);
		setGroups(groups.filter((group) => group.id !== selectedGroup));
	};

	return (
		<div className="w-full flex flex-col flex-grow">
			<DeleteDialog
				open={openDelete}
				setOpen={setOpenDelete}
				action={deleteAction}
			/>
			<EditDialog
				open={openEdit}
				setOpen={setOpenEdit}
				groupId={selectedGroup}
				quizId={quizId}
			/>
			<div className="flex flex-row justify-between">
				<div className="flex flex-row justify-between gap-10"></div>
				<div className="flex flex-row justify-between gap-10">
					<Button
						size="sm"
						variant="gradient"
						color="light-green"
						className="flex items-center gap-3"
						onClick={() => {
							setSelectedGroup(0);
							setOpenEdit(true);
						}}
					>
						Add group
						<PlusCircleIcon strokeWidth={2} className="h-5 w-5" />
					</Button>
				</div>
			</div>
			<Card className="h-auto w-auto mt-2 mb-1 overflow-scroll max-h-[73vh] rounded-none shadow-none">
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
						{groups.map(
							({ id, title, total_questions, point }, index) => {
								const classes =
									"px-2 py-1 border-b border-gray-300";
								return (
									<tr
										key={`quiz-question-${id}`}
										className="hover:bg-gray-100 cursor-pointer"
										onClick={() => {
											setSelectedGroup(id);
											setOpenEdit(true);
										}}
									>
										<td className={classes}>
											<p
												color="blue-gray"
												className="font-normal"
											>
												{index + 1}
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
												{total_questions}
											</p>
										</td>
										<td className={classes}>
											<p
												color="blue-gray"
												className="font-normal"
											>
												{point}
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
										<td className={classes}>
											<Button
												size="sm"
												color="red"
												onClick={(e: any) => {
													e.stopPropagation();
													setSelectedGroup(id);
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
		</div>
	);
};

export default GroupedQuestions;
