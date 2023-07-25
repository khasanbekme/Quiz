/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
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
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import useAxiosPrivate from "../../../../../../Hooks/useAxiosPrivate";

type Props = {
	open: boolean;
	quizId: number;
	setOpen: (open: boolean) => void;
};

type Grade = {
	id: number;
	name: string;
};

type User = {
	selected: boolean;
	id: number;
	username: string;
	grade: Grade | null;
	first_name: string;
	last_name: string;
	picture: string | null;
	is_active: boolean;
	is_staff: boolean;
	is_superuser: boolean;
	last_login: string | null;
};

const TABLE_HEAD = ["ID", "Grade", "Username", "First name", "Last name"];

const AddUser = ({ open, quizId, setOpen }: Props) => {
	const [addedUsers, setAddedUsers] = useState<number[]>([]);
	const [grades, setGrades] = useState<Grade[]>([]);
	const [selectedGrade, setSelectedGrade] = useState(0);
	const [searchKey, setSearchKey] = useState("");
	const [selectAll, setSelectAll] = useState(true);
	const [users, setUsers] = useState<User[]>([]);

	const axiosPrivate = useAxiosPrivate();

	const fetchGrades = async () => {
		const response = await axiosPrivate.get("/account/grades/");
		if (response.status === 200) {
			setGrades(response.data);
		}
	};

	const fetchAddedUsers = async () => {
		const response = await axiosPrivate.get(
			`/quiz/allowed-user-bulk/${quizId}/`
		);
		if (response.status === 200) {
			setAddedUsers(response.data["values"]);
			console.log(response);
			return response.data["values"];
		}
	};

	const fetchUsers = async () => {
		const exclude_ids =
			addedUsers.length === 0 ? await fetchAddedUsers() : addedUsers;

		const response = await axiosPrivate.get("/account/users/", {
			params: {
				per_page: selectedGrade !== 0 ? 10 ** 6 : 30,
				page: 1,
				grade: selectedGrade !== 0 ? selectedGrade : "",
				search: searchKey,
			},
		});
		if (response.status === 200) {
			const users = response.data.results.reduce(
				(acc: any, value: any) => {
					if (!exclude_ids.includes(value.id)) {
						acc.push({ ...value, selected: false });
					}
					return acc;
				},
				[]
			);
			setUsers(users);
		}
	};

	const handleCheckboxChange = (userId: number) => {
		setUsers((prevUsers) =>
			prevUsers.map((user) =>
				user.id === userId
					? { ...user, selected: !user.selected }
					: user
			)
		);
	};

	useEffect(() => {
		if (open) {
			fetchGrades();
		} else {
			setGrades([]);
			setUsers([]);
			setSelectAll(true);
			setSelectedGrade(0);
			setSearchKey("");
			setAddedUsers([]);
		}
	}, [open]);

	useEffect(() => {
		if (open) {
			fetchUsers();
		}
	}, [open, selectedGrade, searchKey]);

	const handleSelectAll = () => {
		setUsers((prevUsers) =>
			prevUsers.map((user) => {
				return { ...user, selected: selectAll };
			})
		);
		setSelectAll((value) => !value);
	};

	const handleAdd = async () => {
		const newUsers = users
			.filter((value) => value.selected)
			.map((value) => value.id);
		const response_created = await axiosPrivate.post(
			`/quiz/allowed-user-bulk/${quizId}/`,
			{
				values: newUsers,
			}
		);
		if (response_created.status === 200) {
			setOpen(false);
		}
	};

	return (
		<Dialog size="xl" open={open} handler={() => setOpen(false)}>
			<div className="flex items-center justify-between">
				<DialogHeader>Add users</DialogHeader>
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
					</div>
					<div className="flex flex-row justify-between gap-8">
						<select
							value={selectedGrade}
							className="w-48 px-1 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:border-2 focus:border-blue-500 text-base font-medium text-gray-700"
							onChange={(e) =>
								setSelectedGrade(Number(e.target.value))
							}
						>
							<option value={0}>All grades</option>
							{grades.map((grade) => (
								<option key={grade.id} value={grade.id}>
									{grade.name}
								</option>
							))}
						</select>
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
							{users.map(
								({
									id,
									selected,
									grade,
									username,
									first_name,
									last_name,
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
													{grade?.name}
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

export default AddUser;
