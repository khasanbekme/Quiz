import { useEffect, useState } from "react";
import {
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	Button,
	Input,
	Textarea,
	Radio,
} from "@material-tailwind/react";
import { XMarkIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import useAxiosPrivate from "../../../../Hooks/useAxiosPrivate";

type Props = {
	open: boolean;
	setOpenCreateDG: (open: boolean) => void;
};

type Option = {
	question: number;
	body_text: string;
	body_photo: string | null;
	order_number: number;
	is_correct: boolean;
	[key: string]: any;
};

type Category = {
	id: number;
	name: string;
	total_questions: number;
};

const CreateDialog = ({ open, setOpenCreateDG }: Props) => {
	const [questionText, setQuestionText] = useState("");
	const [questionPhoto, setQuestionPhoto] = useState<string | null>(null);
	const [options, setOptions] = useState<Option[]>([]);
	const [point, setPoint] = useState(1);
	const [category, setCategory] = useState(0);
	const [categories, setCategories] = useState<Category[]>([]);

	const axiosPrivate = useAxiosPrivate();

	const fetchCategories = async () => {
		const response = await axiosPrivate.get("/quiz/question-category/");
		if (response.status === 200) {
			setCategories(response.data);
			setCategory(response.data[0]?.id);
		}
	};

	const clearStates = () => {
		setQuestionText("");
		setQuestionPhoto(null);
		setOptions([] as Option[]);
		setPoint(1);
		setCategory(0);
		setCategories([]);
	};

	useEffect(() => {
		if (open === true) {
			fetchCategories();
		} else {
			clearStates();
		}
	}, [open]);

	const validateQuestion = (): boolean => {
		// Check if at least one option is_correct set to true
		const isCorrectOptionExists = options.some(
			(option) => option.is_correct
		);
		const hasEnoughOptions = options.length > 1;

		// Check if at least body_text or body_photo or both exist in the question body and options body
		const isQuestionBodyValid =
			questionText !== "" || questionPhoto !== null;
		const areOptionsBodiesValid = options.every(
			(option) => option.body_text !== "" || option.body_photo !== null
		);

		return (
			isCorrectOptionExists &&
			isQuestionBodyValid &&
			areOptionsBodiesValid &&
			category !== 0 &&
			hasEnoughOptions
		);
	};

	const is_valid = validateQuestion();

	const createOptionApi = async (option: Option) => {
		await axiosPrivate.post("/quiz/question-options/", { ...option });
	};

	const handleSave = async () => {
		const response = await axiosPrivate.post("/quiz/question/", {
			category_id: category,
			body_text: questionText,
			body_photo: questionPhoto,
			score: point,
		});
		if (response.status === 201) {
			const new_quesiton = response.data;
			options.map((value, index) => {
				value.order_number = index + 1;
				value.question = new_quesiton.id;
				return value;
			});
			options.forEach((option) => createOptionApi(option));
			setOpenCreateDG(false);
		}
	};

	const handleQuestionPhotoChange = (file: File | null) => {
		if (file === null) {
			setQuestionPhoto(null);
			return;
		}
		const reader = new FileReader();
		reader.onload = (event) => {
			if (event.target) {
				setQuestionPhoto(event.target.result as string);
			}
		};
		reader.readAsDataURL(file);
	};

	const handleOptionChange = (
		index: number,
		field: string,
		value: string | boolean
	) => {
		const updatedOptions = [...options];
		updatedOptions[index][field] = value;
		setOptions(updatedOptions);
	};

	const handleOptionPhotoChange = (index: number, file: File | null) => {
		const updatedOptions = [...options];
		if (file === null) {
			updatedOptions[index].body_photo = null;
			setOptions(updatedOptions);
			return;
		}
		const reader = new FileReader();
		reader.onload = (event) => {
			if (event.target) {
				updatedOptions[index].body_photo = event.target
					.result as string;
				setOptions(updatedOptions);
			}
		};
		reader.readAsDataURL(file);
	};

	async function getClipboardImage(): Promise<string | null> {
		try {
			const clipboardItems = await navigator.clipboard.read();
			for (const clipboardItem of clipboardItems) {
				for (const type of clipboardItem.types) {
					if (type.startsWith("image/")) {
						const blob = await clipboardItem.getType(type);
						const fileReader = new FileReader();
						return new Promise((resolve) => {
							fileReader.onload = () => {
								const base64Data = fileReader.result as string;
								resolve(base64Data);
							};
							fileReader.readAsDataURL(blob);
						});
					}
				}
			}
		} catch (error) {
			console.error("Failed to read clipboard data:", error);
		}
		return null;
	}

	const handleClipboardButton = async (index: number) => {
		const data = await getClipboardImage();
		if (data === null) {
			return;
		}
		const updatedOptions = [...options];
		updatedOptions[index].body_photo = data as string;
		setOptions(updatedOptions);
	};

	const handleAddOption = () => {
		const order_number = options.length + 1;
		setOptions([
			...options,
			{
				question: 0,
				body_text: "",
				body_photo: null,
				order_number,
				is_correct: false,
			},
		]);
	};

	const handleRemoveOption = (index: number) => {
		const updatedOptions = options.filter((_, i) => i !== index);
		setOptions(updatedOptions);
	};

	return (
		<Dialog size="xl" open={open} handler={() => setOpenCreateDG(false)}>
			<div className="flex items-center justify-between">
				<DialogHeader>Add new question</DialogHeader>
				<XMarkIcon
					className="mr-3 h-5 w-5 cursor-pointer"
					onClick={() => setOpenCreateDG(false)}
				/>
			</div>
			<DialogBody divider className="overflow-scroll h-[70vh]">
				<div className="flex items-center justify-between w-full space-x-2 mb-3">
					<div>
						<Input
							type="number"
							label="Point"
							value={point.toString()}
							onChange={(e) => setPoint(Number(e.target.value))}
						/>
					</div>
					<div>
						<select
							value={category}
							className="w-full px-1 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:border-2 focus:border-blue-500 text-base font-medium text-gray-700"
							onChange={(e) =>
								setCategory(Number(e.target.value))
							}
						>
							{categories.map((category) => (
								<option key={category.id} value={category.id}>
									{category.name}
								</option>
							))}
						</select>
					</div>
				</div>
				<div className="grid gap-4">
					<Textarea
						label="Question text"
						value={questionText}
						onChange={(e) => setQuestionText(e.target.value)}
					/>
					<div className="flex flex-row">
						<span className="mr-3">Question photo: </span>

						{questionPhoto ? (
							<div className="flex flex-row items-center">
								<img
									src={questionPhoto}
									alt="Question"
									className="w-auto h-20 object-cover"
								/>
								<XMarkIcon
									color="red"
									className="h-6 w-6 cursor-pointer"
									onClick={() =>
										handleQuestionPhotoChange(null)
									}
								/>
							</div>
						) : (
							<div className="flex flex-row gap-2">
								<button
									className="flex items-center px-1 justify-center bg-gray-200 rounded-md hover:bg-gray-300"
									onClick={async () => {
										const data = await getClipboardImage();
										if (data === null) {
											return;
										}
										setQuestionPhoto(data as string);
									}}
								>
									<ClipboardIcon className="w-5 h-5" />
								</button>
								<input
									type="file"
									accept="image/*"
									onChange={(e) =>
										handleQuestionPhotoChange(
											e.target.files![0]
										)
									}
								/>
							</div>
						)}
					</div>
					{options.map((option, index) => (
						<div
							key={index}
							className={
								"flex items-center justify-between space-x-2"
							}
						>
							<div className="flex flex-row space-x-2 items-center">
								<Radio
									name="correctOption"
									checked={option.is_correct}
									onChange={() =>
										handleOptionChange(
											index,
											"is_correct",
											true
										)
									}
								/>
								<input
									placeholder={`Option ${index + 1} text`}
									value={option.body_text}
									className="border border-blue-500 rounded-md px-2 py-1 h-10"
									onChange={(e) =>
										handleOptionChange(
											index,
											"body_text",
											e.target.value
										)
									}
								/>
								{option.body_photo ? (
									<div className="flex flex-row items-center">
										<img
											src={option?.body_photo}
											alt={`Option ${index + 1}`}
											className="w-auto h-16 object-cover"
										/>
										<XMarkIcon
											color="red"
											className="h-6 w-6 cursor-pointer"
											onClick={() =>
												handleOptionPhotoChange(
													index,
													null
												)
											}
										/>
									</div>
								) : (
									<div className="flex flex-row gap-2">
										<button
											className="flex items-center px-1 justify-center bg-gray-200 rounded-md hover:bg-gray-300"
											onClick={() => {
												handleClipboardButton(index);
											}}
										>
											<ClipboardIcon className="w-5 h-5" />
										</button>
										<input
											type="file"
											accept="image/*"
											onChange={(e) =>
												handleOptionPhotoChange(
													index,
													e.target.files![0]
												)
											}
										/>
									</div>
								)}
							</div>
							<Button
								size="sm"
								color="red"
								className="width-16"
								onClick={() => handleRemoveOption(index)}
							>
								Remove
							</Button>
						</div>
					))}
					<Button size="sm" onClick={handleAddOption}>
						Add Option
					</Button>
				</div>
			</DialogBody>
			<DialogFooter className="space-x-2">
				<Button
					variant="outlined"
					color="red"
					onClick={() => {
						setOpenCreateDG(false);
					}}
				>
					Cancel
				</Button>
				<Button
					variant="gradient"
					color="green"
					onClick={handleSave}
					disabled={!is_valid}
				>
					Add
				</Button>
			</DialogFooter>
		</Dialog>
	);
};

export default CreateDialog;
