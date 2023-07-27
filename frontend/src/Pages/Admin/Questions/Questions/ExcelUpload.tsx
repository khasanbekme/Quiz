/* eslint-disable react-hooks/exhaustive-deps */
import { ChangeEvent, useEffect, useState } from "react";
import {
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	Button,
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import useAxiosPrivate from "../../../../Hooks/useAxiosPrivate";

type Props = {
	open: boolean;
	setExcelUplaoad: (open: boolean) => void;
};

type Category = {
	id: number;
	name: string;
	total_questions: number;
};

const ExcelUpload = ({ open, setExcelUplaoad }: Props) => {
	const [categories, setCategories] = useState<Category[]>([]);
	const [excelFile, setExcelFile] = useState<File | null>(null);
	const [category, setCategory] = useState(0);
	const [options, setOptions] = useState(4);
	const [isLoading, setLoading] = useState(false);
	const is_valid = excelFile !== null;

	const axiosPrivate = useAxiosPrivate();

	const fetchCategories = async () => {
		const response = await axiosPrivate.get("/quiz/question-category/");
		if (response.status === 200) {
			setCategories(response.data);
			setCategory(response.data[0].id);
		}
	};

	const clearStates = () => {
		setExcelFile(null);
		setCategory(0);
		setOptions(4);
	};

	useEffect(() => {
		if (open === true) {
			fetchCategories();
		} else {
			clearStates();
		}
	}, [open]);

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.target.files && event.target.files[0];
		if (selectedFile) {
			setExcelFile(selectedFile);
		}
	};

	const handleUpload = async () => {
		if (!excelFile) return;
		const formData = new FormData();
		formData.append("excel_file", excelFile);
		formData.append("category", category.toString());
		formData.append("options", options.toString());
		setLoading(true);
		const response = await axiosPrivate.post(
			"/quiz/excel-upload/",
			formData,
			{
				headers: {
					"Content-type": "multipart/form-data",
				},
			}
		);
		setLoading(false);
		if (response.status === 201) {
			setExcelUplaoad(false);
		}
	};

	return (
		<Dialog size="sm" open={open} handler={() => setExcelUplaoad(false)}>
			<div className="flex items-center justify-between">
				<DialogHeader>Upload questions from Excel</DialogHeader>
				<XMarkIcon
					className="mr-3 h-5 w-5 cursor-pointer"
					onClick={() => setExcelUplaoad(false)}
				/>
			</div>
			{isLoading ? (
				<div className="flex items-center justify-center py-6">
					<div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
				</div>
			) : (
				<>
					<DialogBody divider className="flex flex-col gap-6">
						<div className="flex flex-row items-center justify-between space-x-20">
							<input
								type="number"
								placeholder="Options"
								className="border rounder-md border-2 border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:border-2 focus:border-blue-500"
								defaultValue={options}
								onChange={(event) =>
									setOptions(Number(event.target.value))
								}
							/>
							<select
								value={category}
								className="w-full px-1 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:border-2 focus:border-blue-500 text-base font-medium text-gray-700"
								onChange={(event) =>
									setCategory(Number(event.target.value))
								}
							>
								{categories.map((category) => (
									<option
										key={category.id}
										value={category.id}
									>
										{category.name}
									</option>
								))}
							</select>
						</div>
						<div className="flex items-center justify-center w-full py-10">
							<input
								type="file"
								accept=".xlsx, .xls"
								className="ml-16"
								onChange={handleFileChange}
							/>
						</div>
					</DialogBody>
					<DialogFooter className="space-x-2">
						<Button
							variant="outlined"
							color="red"
							onClick={() => {
								setExcelUplaoad(false);
							}}
						>
							Cancel
						</Button>
						<Button
							variant="gradient"
							color="green"
							onClick={handleUpload}
							disabled={!is_valid}
						>
							Upload
						</Button>
					</DialogFooter>
				</>
			)}
		</Dialog>
	);
};

export default ExcelUpload;
