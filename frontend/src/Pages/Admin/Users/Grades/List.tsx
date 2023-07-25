import { Typography, Button } from "@material-tailwind/react";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import useAxiosPrivate from "../../../../Hooks/useAxiosPrivate";
import DeleteDialog from "../DeleteDialog";
import EditDialog from "./EditDialog";

const TABLE_HEAD = ["ID", "Name", "Delete"];

type Grade = {
	id: number;
	name: string;
};

export default function GradeList() {
	const [grades, setGrades] = useState<Grade[]>([] as Grade[]);

	const [openDelete, setOpenDelete] = useState<boolean>(false);
	const [openCreate, setOpenCreate] = useState<boolean>(false);
	const [selectedGrade, setSelectedGrade] = useState<number>(0);

	const axiosPrivate = useAxiosPrivate();

	const fetchGrades = async () => {
		const response = await axiosPrivate.get("/account/grades/");
		if (response.status === 200) {
			setGrades(response.data);
		}
	};

	const deleteGrade = async () => {
		const response = await axiosPrivate.delete(
			`/account/grades/${selectedGrade}/`
		);
		if (response.status === 204) {
			setGrades(grades.filter((grade) => grade.id !== selectedGrade));
		}
	};

	useEffect(() => {
		if (!openCreate) {
			fetchGrades();
		}
	}, [openCreate]);

	return (
		<div className="flex flex-grow ml-60 mt-4">
			<DeleteDialog
				open={openDelete}
				setOpen={setOpenDelete}
				action={deleteGrade}
			/>
			<EditDialog
				open={openCreate}
				setOpen={setOpenCreate}
				gradeId={selectedGrade}
			/>
			<div className="w-full mb-3 overflow-scroll max-h-[80vh] rounded-none shadow-none">
				<table className="w-full min-w-max table-auto text-left">
					<thead className="sticky top-0 z-50">
						<tr>
							{TABLE_HEAD.map((head) => (
								<th
									key={head}
									className="border-b border-blue-gray-100 bg-blue-gray-50 px-6 py-2"
								>
									<Typography
										variant="h5"
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
						{grades.map(({ id, name }, index) => {
							const classes =
								"px-6 py-2 border-b border-gray-300";
							const handleRowClick = () => {
								setSelectedGrade(id);
								setOpenCreate(true);
							};

							const handleDeleteClick = (e: any) => {
								e.stopPropagation(); // Stop the event propagation
								setSelectedGrade(id);
								setOpenDelete(true);
							};

							return (
								<tr
									key={id}
									className="hover:bg-gray-100 cursor-pointer"
									onClick={handleRowClick}
								>
									<td className={classes}>
										<Typography
											variant="h6"
											color="blue-gray"
											className="font-normal"
										>
											{id}
										</Typography>
									</td>
									<td className={classes}>
										<Typography
											variant="h6"
											color="blue-gray"
											className="font-normal"
										>
											{name}
										</Typography>
									</td>
									<td className={classes}>
										<Button
											size="sm"
											color="red"
											onClick={handleDeleteClick}
										>
											Delete
										</Button>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
			<div className="absolute right-[calc(3vw)] bottom-6">
				<Button
					onClick={() => {
						setSelectedGrade(0);
						setOpenCreate(true);
					}}
					className="h-16 w-16 bg-blue-500 p-2 rounded-full"
				>
					<PlusCircleIcon />
				</Button>
			</div>
		</div>
	);
}
