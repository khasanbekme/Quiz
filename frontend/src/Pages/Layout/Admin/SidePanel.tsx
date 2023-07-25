import { useState } from "react";
import {
	Typography,
	List,
	ListItem,
	ListItemPrefix,
	Accordion,
	AccordionHeader,
	AccordionBody,
} from "@material-tailwind/react";
import {
	PresentationChartBarIcon,
	PencilSquareIcon,
	CircleStackIcon,
	UsersIcon,
} from "@heroicons/react/24/solid";
import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export default function Example() {
	const [open, setOpen] = useState([0, 0, 0, 0, 0, 0, 0]);
	const navigate = useNavigate();

	const handleOpen = (index: number) => {
		const newOpen = [...open];
		newOpen[index] = newOpen[index] === 0 ? 1 : 0;
		setOpen(newOpen);
	};

	return (
		<div className="fixed h-[calc(100vh-2rem)] max-w-[15rem] shadow-md rounder-md">
			<List>
				<Accordion
					open={open[1] === 1}
					icon={
						<ChevronDownIcon
							strokeWidth={2.5}
							className={`mx-auto h-4 w-4 transition-transform ${
								open[1] === 1 ? "rotate-180" : ""
							}`}
						/>
					}
				>
					<ListItem className="p-0" selected={open[1] === 1}>
						<AccordionHeader
							onClick={() => handleOpen(1)}
							className="border-b-0 p-3"
						>
							<ListItemPrefix>
								<PresentationChartBarIcon className="h-5 w-5" />
							</ListItemPrefix>
							<Typography
								color="blue-gray"
								className="mr-auto font-normal"
							>
								Dashboard
							</Typography>
						</AccordionHeader>
					</ListItem>
					<AccordionBody className="py-1">
						<List className="p-0">
							<ListItem>
								<ListItemPrefix>
									<ChevronRightIcon
										strokeWidth={3}
										className="h-3 w-5"
									/>
								</ListItemPrefix>
								Analytics
							</ListItem>
							<ListItem>
								<ListItemPrefix>
									<ChevronRightIcon
										strokeWidth={3}
										className="h-3 w-5"
									/>
								</ListItemPrefix>
								Reporting
							</ListItem>
							<ListItem>
								<ListItemPrefix>
									<ChevronRightIcon
										strokeWidth={3}
										className="h-3 w-5"
									/>
								</ListItemPrefix>
								Projects
							</ListItem>
						</List>
					</AccordionBody>
				</Accordion>
				<Accordion
					open={open[4] === 1}
					icon={
						<ChevronDownIcon
							strokeWidth={2.5}
							className={`mx-auto h-4 w-4 transition-transform ${
								open[4] === 1 ? "rotate-180" : ""
							}`}
						/>
					}
				>
					<ListItem className="p-0" selected={open[4] === 1}>
						<AccordionHeader
							onClick={() => handleOpen(4)}
							className="border-b-0 p-3"
						>
							<ListItemPrefix>
								<UsersIcon className="h-5 w-5" />
							</ListItemPrefix>
							<Typography
								color="blue-gray"
								className="mr-auto font-normal"
							>
								Users
							</Typography>
						</AccordionHeader>
					</ListItem>
					<AccordionBody className="py-1">
						<List className="p-0">
							<ListItem onClick={() => navigate("/admin/grades")}>
								<ListItemPrefix>
									<ChevronRightIcon
										strokeWidth={3}
										className="h-3 w-5"
									/>
								</ListItemPrefix>
								Grades
							</ListItem>
							<ListItem onClick={() => navigate("/admin/users")}>
								<ListItemPrefix>
									<ChevronRightIcon
										strokeWidth={3}
										className="h-3 w-5"
									/>
								</ListItemPrefix>
								Users
							</ListItem>
						</List>
					</AccordionBody>
				</Accordion>
				<Accordion
					open={open[2] === 1}
					icon={
						<ChevronDownIcon
							strokeWidth={2.5}
							className={`mx-auto h-4 w-4 transition-transform ${
								open[2] === 1 ? "rotate-180" : ""
							}`}
						/>
					}
				>
					<ListItem className="p-0" selected={open[2] === 1}>
						<AccordionHeader
							onClick={() => handleOpen(2)}
							className="border-b-0 p-3"
						>
							<ListItemPrefix>
								<CircleStackIcon className="h-5 w-5" />
							</ListItemPrefix>
							<Typography
								color="blue-gray"
								className="mr-auto font-normal"
							>
								Questions
							</Typography>
						</AccordionHeader>
					</ListItem>
					<AccordionBody className="py-1">
						<List className="p-0">
							<ListItem
								onClick={() =>
									navigate("/admin/question-categories")
								}
							>
								<ListItemPrefix>
									<ChevronRightIcon
										strokeWidth={3}
										className="h-3 w-5"
									/>
								</ListItemPrefix>
								Categories
							</ListItem>
							<ListItem
								onClick={() => navigate("/admin/questions")}
							>
								<ListItemPrefix>
									<ChevronRightIcon
										strokeWidth={3}
										className="h-3 w-5"
									/>
								</ListItemPrefix>
								Questions
							</ListItem>
						</List>
					</AccordionBody>
				</Accordion>
				<Accordion
					open={open[3] === 1}
					icon={
						<ChevronDownIcon
							strokeWidth={2.5}
							className={`mx-auto h-4 w-4 transition-transform ${
								open[3] === 1 ? "rotate-180" : ""
							}`}
						/>
					}
				>
					<ListItem className="p-0" selected={open[3] === 1}>
						<AccordionHeader
							onClick={() => handleOpen(3)}
							className="border-b-0 p-3"
						>
							<ListItemPrefix>
								<PencilSquareIcon className="h-5 w-5" />
							</ListItemPrefix>
							<Typography
								color="blue-gray"
								className="mr-auto font-normal"
							>
								Quiz
							</Typography>
						</AccordionHeader>
					</ListItem>
					<AccordionBody className="py-1">
						<List className="p-0">
							<ListItem
								onClick={() =>
									navigate("/admin/quiz-categories")
								}
							>
								<ListItemPrefix>
									<ChevronRightIcon
										strokeWidth={3}
										className="h-3 w-5"
									/>
								</ListItemPrefix>
								Categories
							</ListItem>
							<ListItem
								onClick={() => navigate("/admin/quiz-list")}
							>
								<ListItemPrefix>
									<ChevronRightIcon
										strokeWidth={3}
										className="h-3 w-5"
									/>
								</ListItemPrefix>
								Quizes
							</ListItem>
						</List>
					</AccordionBody>
				</Accordion>
			</List>
		</div>
	);
}
