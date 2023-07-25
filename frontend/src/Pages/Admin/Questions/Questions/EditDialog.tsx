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
	setOpenEditDG: (open: boolean) => void;
	questionId: number;
};

type Category = {
	id: number;
	name: string;
	total_questions: number;
};

type Option = {
	id: number;
	question: number;
	body_text: string | null;
	body_photo: string | null;
	order_number: number;
	is_correct: boolean;
	[key: string]: any;
};

type Question = {
	id: number;
	category: number | null;
	score: number;
	body_text: string | null;
	body_photo: string | null;
};

const EditDialog = ({ open, setOpenEditDG, questionId }: Props) => {
	const [categories, setCategories] = useState<Category[]>([]);
	const [options, setOptions] = useState<Option[]>([]);
	const [optionsToDelete, setOptionsToDelete] = useState<Option[]>([]);
	const [question, setQuestion] = useState<Question | null>(null);

	const axiosPrivate = useAxiosPrivate();

	const fetchCategories = async () => {
		const response = await axiosPrivate.get("/quiz/question-category/");
		if (response.status === 200) {
			setCategories(response.data);
		}
	};

	const fetchQuestion = async () => {
		const response = await axiosPrivate.get(
			`/quiz/question/${questionId}/`
		);
		if (response.status === 200) {
			const { updated, category, ...data } = response.data;
			setQuestion({ ...data, category: category ? category.id : null });
		}
	};

	const fetchOptions = async () => {
		const response = await axiosPrivate.get("/quiz/question-options/", {
			params: {
				question: questionId,
			},
		});
		if (response.status === 200) setOptions(response.data);
	};

	const clearStates = () => {
		setQuestion(null);
		setOptions([]);
		setCategories([]);
		setOptionsToDelete([]);
	};

	useEffect(() => {
		if (questionId !== 0 && open === true) {
			fetchCategories();
			fetchQuestion();
			fetchOptions();
		} else {
			clearStates();
		}
	}, [open]);

	const createOptionApi = async (data: any) => {
		await axiosPrivate.post("/quiz/question-options/", data);
	};

	const updateOptionApi = async (id: number, data: any) => {
		if (data?.body_photo && data.body_photo.startsWith("http")) {
			delete data.body_photo;
		}
		await axiosPrivate.put(`/quiz/question-options/${id}/`, data);
	};

	const deleteOptionApi = async (option: Option) => {
		await axiosPrivate.delete(`/quiz/question-options/${option.id}/`);
	};

	const handleSave = async () => {
		const requestPayload = {
			...question,
			category_id: question?.category === 0 ? null : question?.category,
		};
		delete requestPayload.category;

		if (question?.body_photo && question.body_photo.startsWith("http")) {
			delete requestPayload.body_photo;
		}

		const response = await axiosPrivate.put(
			`/quiz/question/${questionId}/`,
			requestPayload
		);
		if (response.status === 200) {
			const new_quesiton = response.data;
			options.map((value, index) => {
				value.order_number = index + 1;
				value.question = new_quesiton.id;
				return value;
			});
			options.forEach((option) => {
				const { id, ...optionData } = option;
				if (id === 0) {
					createOptionApi(optionData);
				} else {
					updateOptionApi(id, optionData);
				}
			});
			optionsToDelete.forEach((option) => {
				deleteOptionApi(option);
			});
			setOpenEditDG(false);
		}
	};

	const validateQuestion = (): boolean => {
		if (!question) return false;
		// Check if at least one option is_correct set to true
		const isCorrectOptionExists = options.some(
			(option) => option.is_correct
		);
		const hasEnoughOptions = options.length > 1;

		// Check if at least body_text or body_photo or both exist in the question body and options body
		const isQuestionBodyValid =
			question?.body_text !== "" || question?.body_photo !== null;
		const areOptionsBodiesValid = options.every(
			(option) => option.body_text !== "" || option.body_photo !== null
		);

		return (
			isCorrectOptionExists &&
			isQuestionBodyValid &&
			areOptionsBodiesValid &&
			hasEnoughOptions
		);
	};
	const is_valid = validateQuestion();

	const handleQuestionPhotoChange = (file: File | null) => {
		if (question === null) return;
		if (file === null) {
			setQuestion({ ...question, body_photo: null });
			return;
		}
		const reader = new FileReader();
		reader.onload = (event) => {
			if (event.target) {
				setQuestion({
					...question,
					body_photo: event.target.result as string,
				});
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
				id: 0,
				question: questionId,
				body_text: "",
				body_photo: null,
				order_number,
				is_correct: false,
			},
		]);
	};

	const handleRemoveOption = (index: number) => {
		if (options[index].id !== 0) {
			setOptionsToDelete([...optionsToDelete, options[index]]);
		}
		setOptions(options.filter((_, i) => i !== index));
	};

	return (
		<Dialog size="xl" open={open} handler={() => setOpenEditDG(false)}>
			<div className="flex items-center justify-between">
				<DialogHeader>Edit question</DialogHeader>
				<XMarkIcon
					className="mr-3 h-5 w-5 cursor-pointer"
					onClick={() => setOpenEditDG(false)}
				/>
			</div>
			<DialogBody divider className="overflow-scroll h-[70vh]">
				<div className="flex items-center justify-between w-full space-x-2 mb-3">
					<div>
						<Input
							type="number"
							label="Point"
							value={question?.score.toString()}
							onChange={(e) => {
								question &&
									setQuestion({
										...question,
										score: Number(e.target.value),
									});
							}}
						/>
					</div>
					<div>
						<select
							value={question?.category || 0}
							className="w-full px-1 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:border-2 focus:border-blue-500 text-base font-medium text-gray-700"
							onChange={(e) => {
								question &&
									setQuestion({
										...question,
										category: Number(e.target.value),
									});
							}}
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
						value={question?.body_text || ""}
						onChange={(e) => {
							question &&
								setQuestion({
									...question,
									body_text: e.target.value,
								});
						}}
					/>
					<div className="flex flex-row">
						<span className="mr-3">Question photo: </span>

						{question?.body_photo ? (
							<div className="flex flex-row items-center">
								<img
									src={question.body_photo}
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
										if (
											data === null ||
											question === null
										) {
											return;
										}
										setQuestion({
											...question,
											body_photo: data as string,
										});
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
									value={option.body_text || ""}
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
						setOpenEditDG(false);
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
					Save
				</Button>
			</DialogFooter>
		</Dialog>
	);
};

export default EditDialog;
