/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import {
	ArrowRightIcon,
	ChevronDownIcon,
	UserGroupIcon,
	Bars3Icon,
	ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import useAxiosPrivate from "../../../../../../Hooks/useAxiosPrivate";
import {
	Button,
	Card,
	Checkbox,
	IconButton,
	Input,
	Menu,
	MenuHandler,
	MenuItem,
	MenuList,
	Typography,
} from "@material-tailwind/react";
import DeleteDialog from "./DeleteDialog";
import AddUser from "./AddUser";
import ManageGroup from "./ManageGroup";

type Props = {
	quizId: number;
};

type Grade = {
	id: number;
	name: string;
};

type User = {
	id: number;
	username: string;
	first_name: string;
	last_name: string;
	grade: Grade | null;
};

type AllowedUser = {
	selected: boolean;
	id: number;
	user: User;
};

const TABLE_HEAD = ["Grade", "Username", "First name", "Last name"];

const Participants = ({ quizId }: Props) => {
	const axiosPrivate = useAxiosPrivate();
	const [perPage, setPerPage] = useState<number>(20);
	const [active, setActive] = useState(1);
	const [pages, setPages] = useState(0);
	const [allowedUsers, setAllowedUsers] = useState<AllowedUser[]>([]);
	const [selectedGrade, setSelectedGrade] = useState(0);
	const [grades, setGrades] = useState<Grade[]>([]);
	const [openGroups, setOpenGroups] = useState(false);
	const [openAdd, setOpenAdd] = useState(false);
	const [openDelete, setOpenDelete] = useState(false);
	const [selectAll, setSelectAll] = useState(true);

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

	const fetchGrades = async () => {
		const response = await axiosPrivate.get("/account/grades/");
		if (response.status === 200) {
			setGrades(response.data);
		}
	};

	const fetchAllowedUsers = async () => {
		try {
			const response = await axiosPrivate.get("/quiz/allowed-user/", {
				params: {
					quiz: quizId,
					per_page: perPage,
					page: active,
					user__grade_id: selectedGrade !== 0 ? selectedGrade : "",
				},
			});
			if (response.status === 200) {
				setAllowedUsers(
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
		fetchGrades();
	}, []);

	useEffect(() => {
		if (!openAdd && !openGroups) {
			fetchAllowedUsers();
		}
	}, [active, openAdd, openGroups, selectedGrade]);

	const deleteBulk = async () => {
		const toDelete = allowedUsers
			.filter((value) => value.selected)
			.map(({ selected, ...value }) => value.user.id);
		const response_deleted = await axiosPrivate.delete(
			`/quiz/allowed-user-bulk/${quizId}/`,
			{
				data: {
					values: toDelete,
				},
			}
		);
		if (response_deleted.status === 200) {
			fetchAllowedUsers();
			setSelectAll(true);
		}
	};

	const handleSelectAll = () => {
		setAllowedUsers((prevData) =>
			prevData.map((value) => {
				return { ...value, selected: selectAll };
			})
		);
		setSelectAll((value) => !value);
	};

	const handleCheckboxChange = (userId: number) => {
		setAllowedUsers((prevData) =>
			prevData.map((value) =>
				value.id === userId
					? { ...value, selected: !value.selected }
					: value
			)
		);
	};

	return (
		<div className="w-full flex flex-col flex-grow">
			<DeleteDialog
				open={openDelete}
				setOpen={setOpenDelete}
				action={deleteBulk}
			/>
			<AddUser open={openAdd} setOpen={setOpenAdd} quizId={quizId} />
			<ManageGroup
				open={openGroups}
				setOpen={setOpenGroups}
				quizId={quizId}
			/>
			<div className="flex flex-row justify-between gap-16">
				<div className="flex flex-row justify-between gap-8">
					<Input
						type="number"
						label="Per page"
						value={perPage}
						onChange={(e) => setPerPage(Number(e.target.value))}
					/>
					<select
						value={selectedGrade}
						className="h-10 px-1 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:border-2 focus:border-blue-500 text-base font-medium text-gray-700"
						onChange={(e) =>
							setSelectedGrade(Number(e.target.value))
						}
					>
						<option key="grade-0" value={0}>
							All grades
						</option>
						{grades.map((grade) => (
							<option key={`grade-${grade.id}`} value={grade.id}>
								{grade.name}
							</option>
						))}
					</select>
				</div>
				<div className="flex flex-row justify-between gap-10">
					<Button
						size="sm"
						variant="gradient"
						color="cyan"
						className="flex items-center gap-3"
						onClick={() => setOpenGroups(true)}
					>
						Add Groups
						<Bars3Icon strokeWidth={2} className="h-5 w-5" />
					</Button>
					<Button
						size="sm"
						variant="gradient"
						color="light-green"
						className="flex items-center gap-3"
						onClick={() => setOpenAdd(true)}
					>
						Add users
						<UserGroupIcon strokeWidth={2} className="h-5 w-5" />
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
									allowedUsers.filter(
										(value) => value.selected
									).length > 0 && setOpenDelete(true)
								}
								className="text-red-500 focus:text-red-600"
							>
								Remove
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
								className="border-b border-blue-gray-100 bg-blue-gray-50 px-3 py-2"
							>
								<div className="flex flex-row">
									<input
										key="select_all"
										type="checkbox"
										className="form-checkbox text-indigo-600 h-5 w-5 rounded border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
										checked={!selectAll}
										onChange={handleSelectAll}
									/>
									<Typography
										variant="small"
										color="blue-gray"
										className="font-normal leading-none opacity-70 ml-8 mt-1"
									>
										{"ID"}
									</Typography>
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
						{allowedUsers.map(({ selected, id, user }) => {
							const classes =
								"px-2 py-1 border-b border-gray-300";
							return (
								<tr
									key={`quiz-question-${id}`}
									className="hover:bg-gray-100 cursor-pointer"
									onClick={() => handleCheckboxChange(id)}
								>
									<td className="py-1 border-b border-gray-300">
										<div className="flex flex-row">
											<Checkbox
												checked={selected}
												onClick={(e: any) => {
													e.stopPropagation();
												}}
												onChange={() => {
													handleCheckboxChange(id);
												}}
											/>
											<p
												color="blue-gray"
												className="font-normal mt-2 ml-5"
											>
												{id}
											</p>
										</div>
									</td>
									<td className={classes}>
										<p
											color="blue-gray"
											className="font-normal"
										>
											{user.grade?.name}
										</p>
									</td>
									<td className={classes}>
										<p
											color="blue-gray"
											className="font-normal"
										>
											{user.username}
										</p>
									</td>
									<td className={classes}>
										<p
											color="blue-gray"
											className="font-normal"
										>
											{user.first_name}
										</p>
									</td>
									<td className={classes}>
										<p
											color="blue-gray"
											className="font-normal"
										>
											{user.last_name}
										</p>
									</td>
								</tr>
							);
						})}
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

export default Participants;
