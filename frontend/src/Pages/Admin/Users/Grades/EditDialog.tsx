import {
	Button,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	Input,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import useAxiosPrivate from "../../../../Hooks/useAxiosPrivate";

type Props = {
	open: boolean;
	setOpen: (open: boolean) => void;
	gradeId: number;
};

type Grade = {
	id?: number;
	name: string;
};

const EditDialog = ({ open, setOpen, gradeId }: Props) => {
	const [grade, setGrade] = useState<Grade>({ name: "" });

	const axiosPrivate = useAxiosPrivate();

	const fetchGrade = async () => {
		if (gradeId === 0) {
			setGrade({ name: "" });
			return;
		}
		const response = await axiosPrivate.get(`/account/grades/${gradeId}/`);
		if (response.status === 200) {
			setGrade(response.data);
		}
	};

	useEffect(() => {
		if (open) {
			fetchGrade();
		}
	}, [open]);

	const handleSave = async () => {
		let response;
		if (gradeId === 0) {
			response = await axiosPrivate.post("/account/grades/", grade);
		} else {
			response = await axiosPrivate.put(
				`/account/grades/${gradeId}/`,
				grade
			);
		}
		if (response.status === 201 || response.status === 200) {
			setOpen(false);
		}
	};

	return (
		<Dialog size="xs" open={open} handler={() => setOpen(false)}>
			<div className="flex items-center justify-between">
				<DialogHeader>
					{gradeId !== 0 ? "Edit category" : "New category"}
				</DialogHeader>
			</div>
			<DialogBody divider>
				<Input
					label="Name"
					value={grade.name}
					onChange={(e) =>
						setGrade({ ...grade, name: e.target.value })
					}
				/>
			</DialogBody>
			<DialogFooter className="space-x-2">
				<Button
					variant="outlined"
					color="red"
					onClick={() => setOpen(false)}
				>
					Cancel
				</Button>
				<Button
					variant="gradient"
					color="green"
					onClick={handleSave}
					disabled={grade.name.length <= 0}
				>
					Save
				</Button>
			</DialogFooter>
		</Dialog>
	);
};

export default EditDialog;
