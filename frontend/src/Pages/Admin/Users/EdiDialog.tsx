import { useEffect, useState } from "react";

import {
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	Button,
	Input,
	Switch,
	Avatar,
} from "@material-tailwind/react";

import { XMarkIcon } from "@heroicons/react/24/outline";
import useAxiosPrivate from "../../../Hooks/useAxiosPrivate";

type Props = {
	open: boolean;
	setOpen: (open: boolean) => void;
	userId: number;
};

type User = {
	id: number;
	username: string;
	first_name: string;
	last_name: string;
	grade: number | null;
	picture: string | null;
	is_active: boolean;
	is_staff: boolean;
	is_superuser: boolean;
};

type Grade = {
	id: number;
	name: string;
};

const EditDialog = ({ open, setOpen, userId }: Props) => {
	const [grades, setGrades] = useState<Grade[]>([]);
	const [user, setUser] = useState<User | null>(null);
	const axiosPrivate = useAxiosPrivate();

	const fetchGrades = async () => {
		const response = await axiosPrivate.get("/account/grades/");
		if (response.status === 200) {
			setGrades(response.data);
		}
	};

	const fetchUser = async () => {
		const response = await axiosPrivate.get(`/account/users/${userId}/`);
		if (response.status === 200) {
			setUser(response.data);
		}
	};

	const clearStates = () => {
		setUser(null);
		setGrades([]);
	};

	const validToSave = user !== null && user.username.length > 0 && user.first_name.length > 0 && user.last_name.length > 0 && user.grade !== 0;;

	useEffect(() => {
		if (userId !== 0 && open) {
			fetchGrades();
			fetchUser();
		} else {
			clearStates();
		}
	}, [open]);

	const handleSave = async () => {
		if (!user) return;
		const {picture, ...payload} = user;
		const respone = await axiosPrivate.put(
			`/account/users/${userId}/`,
			payload,
		);
		if (respone.status === 200) {
			setOpen(false);
		}
	};

	if (!user) return null;

	return (
		<Dialog size="sm" open={open} handler={() => setOpen(false)}>
			<div className="flex items-center justify-between">
				<DialogHeader>{`Edit user: ID-${user.id}`}</DialogHeader>
				<XMarkIcon
					className="mr-3 h-5 w-5 cursor-pointer"
					onClick={() => setOpen(false)}
				/>
			</div>
			<DialogBody divider className="flex flex-col gap-3">
				<div className="flex items-center justify-center">
					{user.picture && (
						<Avatar src={user.picture} size="xl" />
					)}
				</div>
				<Input
					label="Username"
					defaultValue={user.username}
					onChange={(e) =>
						setUser({
							...user,
							username: e.target.value,
						})
					}
				/>
				<Input
					label="First name"
					defaultValue={user.first_name}
					onChange={(e) =>
						setUser({
							...user,
							first_name: e.target.value,
						})
					}
				/>
				<Input
					label="Last name"
					defaultValue={user.last_name}
					onChange={(e) =>
						setUser({
							...user,
							last_name: e.target.value,
						})
					}
				/>
				<select
					defaultValue={user.grade || 0}
					className="w-full px-1 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:border-2 focus:border-blue-500 text-base font-medium text-gray-700"
					onChange={(e) =>
						setUser({
							...user,
							grade: Number(e.target.value),
						})
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
				<Switch
					id="is_active"
					label="Is Active"
					defaultChecked={user.is_active}
					onChange={() => {
						setUser({ ...user, is_active: !user.is_active });
					}}
				/>
				<Switch
					id="is_staff"
					label="Is Staff"
					defaultChecked={user.is_staff}
					onChange={() => {
						setUser({ ...user, is_staff: !user.is_staff });
					}}
				/>
				<Switch
					id="is_superuser"
					label="Is Superuser"
					defaultChecked={user.is_superuser}
					onChange={() => {
						setUser({ ...user, is_superuser: !user.is_superuser });
					}}
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
				<Button variant="gradient" color="green" onClick={handleSave} disabled={!validToSave}>
					Save
				</Button>
			</DialogFooter>
		</Dialog>
	);
};

export default EditDialog;
