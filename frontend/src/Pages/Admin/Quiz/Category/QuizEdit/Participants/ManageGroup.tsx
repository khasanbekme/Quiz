/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import {
	Button,
	DialogBody,
	DialogFooter,
	Dialog,
	DialogHeader,
	Typography,
	Checkbox,
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import useAxiosPrivate from "../../../../../../Hooks/useAxiosPrivate";
import axios from "../../../../../../Api/axios";

type Props = {
	open: boolean;
	quizId: number;
	setOpen: (open: boolean) => void;
};

type Grade = {
	selected: boolean;
	id: number;
	name: string;
};

const ManageGroup = ({ open, quizId, setOpen }: Props) => {
	const [addedGroups, setAddedGroups] = useState<number[]>([]);
	const [grades, setGrades] = useState<Grade[]>([]);

	const axiosPrivate = useAxiosPrivate();

	const fetchAllowedGroups = async () => {
		const response = await axiosPrivate.get(
			`/quiz/allowed-grade/${quizId}/`
		);
		if (response.status === 200) {
			return response.data["values"];
		}
	};

	const fetchGrades = async () => {
		const selectedIds = await fetchAllowedGroups();
		setAddedGroups(selectedIds);
		const response = await axiosPrivate.get("/account/grades/");
		if (response.status === 200) {
			setGrades(
				response.data.map((value: any) => {
					return {
						...value,
						selected: selectedIds.includes(value.id),
					};
				})
			);
		}
	};

	const handleCheckboxChange = (gradeId: number) => {
		setGrades((prevGrades) =>
			prevGrades.map((grade) =>
				grade.id === gradeId
					? { ...grade, selected: !grade.selected }
					: grade
			)
		);
	};

	useEffect(() => {
		if (open) {
			fetchGrades();
		} else {
			setGrades([]);
		}
	}, [open]);

	const handleSave = async () => {
		const toAdd = grades.filter(
			(value) => value.selected && !addedGroups.includes(value.id)
		);
		const toRemove = grades.filter(
			(value) => !value.selected && addedGroups.includes(value.id)
		);
		const respone1 = await axiosPrivate.post(
			`/quiz/allowed-grade/${quizId}/`,
			{
				values: toAdd.map((value) => value.id),
			}
		);
		const respone2 = await axiosPrivate.delete(
			`/quiz/allowed-grade/${quizId}/`,
			{
				data: { values: toRemove.map((value) => value.id) },
			}
		);
		if (respone1.status === 200 && respone2.status === 200) {
			setOpen(false);
		}
	};

	return (
		<Dialog size="sm" open={open} handler={() => setOpen(false)}>
			<div className="flex items-center justify-between">
				<DialogHeader>Manage groups</DialogHeader>
				<XMarkIcon
					className="mr-3 h-5 w-5 cursor-pointer"
					onClick={() => setOpen(false)}
				/>
			</div>
			<DialogBody divider>
				<div className="flex flex-col justify-center">
					<ul className="w-full">
						{grades.map((grade) => (
							<li
								key={grade.id}
								value={grade.id}
								className="flex flex-row items-center gap-4 cursor-pointer hover:bg-gray-100 hover:text-gray-800 px-14 rounded-lg"
								onClick={(e: any) => {
									handleCheckboxChange(grade.id);
								}}
							>
								<Checkbox
									checked={grade.selected}
									onChange={() => {}}
								/>
								<Typography
									variant="paragraph"
									className="font-normal leading-none opacity-70"
								>
									{grade.name}
								</Typography>
							</li>
						))}
					</ul>
				</div>
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
				<Button variant="gradient" color="green" onClick={handleSave}>
					Save
				</Button>
			</DialogFooter>
		</Dialog>
	);
};

export default ManageGroup;
