import {
	Typography,
	Button,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	Input,
} from "@material-tailwind/react";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import useAxiosPrivate from "../../../../Hooks/useAxiosPrivate";

const TABLE_HEAD = ["ID", "Name", "Total questions", "Delete"];

type Category = {
	id: number;
	name: string;
	total_questions: number;
};

export default function Example() {
	const [categories, setCategories] = useState<Category[]>([] as Category[]);

	const [openDelete, setOpenDelete] = useState<boolean>(false);
	const [openCreate, setOpenCreate] = useState<boolean>(false);
	const [selectedCategory, setSelectedCategory] = useState<number>(0);
	const [isEditDialog, setIsEditDialog] = useState<boolean>(false);
	const [createDialogInput, setCreateDialogInput] = useState<string>("");

	const axiosPrivate = useAxiosPrivate();

	const fetchCategories = async () => {
		const response = await axiosPrivate.get("/quiz/question-category/");
		if (response.status === 200) {
			setCategories(response.data);
		}
	};

	const deleteCategory = async (id: number) => {
		const response = await axiosPrivate.delete(
			`/quiz/question-category/${id}/`
		);
		if (response.status === 204) {
			setCategories(categories.filter((category) => category.id !== id));
		}
	};

	const handleCreateUpdate = async () => {
		if (isEditDialog) {
			const response = await axiosPrivate.put(
				`/quiz/question-category/${selectedCategory}/`,
				{
					name: createDialogInput,
				}
			);
			if (response.status === 200) {
				await fetchCategories();
				setOpenCreate(false);
			}
		} else {
			const response = await axiosPrivate.post(
				"/quiz/question-category/",
				{
					name: createDialogInput,
				}
			);
			if (response.status === 201) {
				setCategories([response.data, ...categories]);
				setOpenCreate(false);
			}
		}
	};

	useEffect(() => {
		fetchCategories();
	}, []);

	return (
		<div className="flex flex-grow ml-60 mt-4">
			<Dialog
				size="xs"
				open={openDelete}
				handler={() => setOpenDelete(!openDelete)}
			>
				<DialogBody>
					Are you sure you want to delete this question category?
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
							await deleteCategory(selectedCategory);
							setSelectedCategory(0);
							setOpenDelete(!openDelete);
						}}
					>
						<span>Delete</span>
					</Button>
				</DialogFooter>
			</Dialog>
			<Dialog
				size="xs"
				open={openCreate}
				handler={() => setOpenCreate(false)}
			>
				<div className="flex items-center justify-between">
					<DialogHeader>
						{isEditDialog ? "Edit category" : "Create new category"}
					</DialogHeader>
				</div>
				<DialogBody divider>
					<Input
						label="Name"
						value={createDialogInput}
						onChange={(e) => setCreateDialogInput(e.target.value)}
					/>
				</DialogBody>
				<DialogFooter className="space-x-2">
					<Button
						variant="outlined"
						color="red"
						onClick={() => setOpenCreate(false)}
					>
						Cancel
					</Button>
					<Button
						variant="gradient"
						color="green"
						onClick={handleCreateUpdate}
						disabled={!(createDialogInput.length > 0)}
					>
						Save
					</Button>
				</DialogFooter>
			</Dialog>
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
						{categories.map(
							({ id, name, total_questions }, index) => {
								const classes =
									"px-6 py-2 border-b border-gray-300";
								const handleRowClick = () => {
									setOpenCreate(true);
									setSelectedCategory(id);
									setIsEditDialog(true);
									setCreateDialogInput(name);
								};

								const handleDeleteClick = (e: any) => {
									e.stopPropagation(); // Stop the event propagation
									setOpenDelete(true);
									setSelectedCategory(id);
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
											<Typography
												variant="h6"
												color="blue-gray"
												className="font-normal"
											>
												{total_questions}
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
							}
						)}
					</tbody>
				</table>
			</div>
			<div className="absolute right-[calc(3vw)] bottom-6">
				<Button
					onClick={() => {
						setCreateDialogInput("");
						setIsEditDialog(false);
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
