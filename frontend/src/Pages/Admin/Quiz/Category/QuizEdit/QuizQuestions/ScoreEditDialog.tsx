import {
	Button,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	Input,
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

type Props = {
	open: boolean;
	setOpen: (open: boolean) => void;
	action: (score: number) => void;
};

const EditDialog = ({ open, setOpen, action }: Props) => {
	const [newScore, setNewScore] = useState(1);

	useEffect(() => {
		open && setNewScore(1);
	}, [open]);

	return (
		<Dialog size="xs" open={open} handler={() => setOpen(false)}>
			<div className="flex items-center justify-between">
				<DialogHeader>Add questions</DialogHeader>
				<XMarkIcon
					className="mr-3 h-5 w-5 cursor-pointer"
					onClick={() => setOpen(false)}
				/>
			</div>
			<DialogBody divider>
				<Input
					label="Score"
					type="number"
					value={newScore}
					onChange={(e) => setNewScore(Number(e.target.value))}
				/>
			</DialogBody>
			<DialogFooter>
				<Button
					variant="outlined"
					color="red"
					onClick={() => setOpen(false)}
					className="mr-5"
				>
					<span>Cancel</span>
				</Button>
				<Button
					variant="gradient"
					onClick={() => {
						action(newScore);
						setOpen(false);
					}}
				>
					<span>Change</span>
				</Button>
			</DialogFooter>
		</Dialog>
	);
};

export default EditDialog;
