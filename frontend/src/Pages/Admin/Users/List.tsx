/* eslint-disable react-hooks/exhaustive-deps */
import {
	Card,
	Typography,
	Button,
	IconButton,
	Input,
} from "@material-tailwind/react";

import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";

import { useEffect, useState } from "react";

import useAxiosPrivate from "../../../Hooks/useAxiosPrivate";
import DeleteDialog from "./DeleteDialog";
import EditDialog from "./EdiDialog";

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
	picture: string | null;
	is_active: boolean;
	is_staff: boolean;
	is_superuser: boolean;
	last_login: string | null;
};

const TABLE_HEAD = [
	"ID",
	"Username",
	"First name",
	"Last name",
	"Grade",
	"Delete",
];

const UserList = () => {
	const [perPage, setPerPage] = useState<number>(20);
	const [pages, setPages] = useState(0);
	const [active, setActive] = useState(1);
	const [searchKey, setSearchKey] = useState("");
	const [openEditDG, setOpenEditDG] = useState(false);
	const [openDelete, setOpenDelete] = useState(false);
	const [grades, setGrades] = useState<Grade[]>([]);
	const [selectedGrade, setSelectedGrade] = useState(0);
	const [users, setUsers] = useState<User[]>([]);
	const [selectedUser, setSelectedUser] = useState(0);

	const axiosPrivate = useAxiosPrivate();

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

	const fetchUsers = async () => {
		const response = await axiosPrivate.get("/account/users/", {
			params: {
				per_page: perPage,
				grade: selectedGrade !== 0 ? selectedGrade : "",
				page: active,
				search: searchKey,
			},
		});
		if (response.status === 200) {
			setUsers(response.data.results);
			setPages(Math.ceil(response.data.count / perPage));
		}
	};

	useEffect(() => {
		fetchGrades();
	}, []);

	useEffect(() => {
		setActive(1);
	}, [selectedGrade]);

	useEffect(() => {
		if (!openEditDG) fetchUsers();
	}, [openEditDG, active]);

	const deleteUser = async () => {
		if (selectedUser === 0) return;
		await axiosPrivate.delete(`/account/users/${selectedUser}/`);
		setUsers(users.filter((user) => user.id !== selectedUser));
		setSelectedUser(0);
	};

	return (
		<div className="flex flex-grow ml-60 mt-4">
			<DeleteDialog
				open={openDelete}
				setOpen={setOpenDelete}
				action={deleteUser}
			/>
			<EditDialog
				open={openEditDG}
				setOpen={setOpenEditDG}
				userId={selectedUser}
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
							value={selectedGrade}
							className="w-full px-1 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:border-2 focus:border-blue-500 text-base font-medium text-gray-700"
							onChange={(e) =>
								setSelectedGrade(Number(e.target.value))
							}
						>
							<option key="grade-0" value={0}>
								All grades
							</option>
							{grades.map((grade) => (
								<option
									key={`grade-${grade.id}`}
									value={grade.id}
								>
									{grade.name}
								</option>
							))}
						</select>
						<Button
							size="sm"
							variant="gradient"
							color="light-blue"
							className="w-52"
							onClick={fetchUsers}
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
							{users.map(
								({
									id,
									username,
									first_name,
									last_name,
									grade,
								}) => {
									const classes =
										"px-2 py-1 border-b border-gray-300";
									return (
										<tr
											key={`user-${id}`}
											className="hover:bg-gray-100 cursor-pointer"
											onClick={() => {
												setSelectedUser(id);
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
													{username}
												</p>
											</td>
											<td className={classes}>
												<p
													color="blue-gray"
													className="font-normal"
												>
													{first_name}
												</p>
											</td>
											<td className={classes}>
												<p
													color="blue-gray"
													className="font-normal"
												>
													{last_name}
												</p>
											</td>
											<td className={classes}>
												<p
													color="blue-gray"
													className="font-normal"
												>
													{grade?.name}
												</p>
											</td>
											<td className={classes}>
												<Button
													size="sm"
													color="red"
													onClick={(e: any) => {
														e.stopPropagation();
														setSelectedUser(id);
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
		</div>
	);
};

export default UserList;
