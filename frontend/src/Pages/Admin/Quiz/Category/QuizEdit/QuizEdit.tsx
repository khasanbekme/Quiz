import {
	Tabs,
	TabsHeader,
	TabsBody,
	Tab,
	TabPanel,
} from "@material-tailwind/react";

import {
	AdjustmentsHorizontalIcon,
	Bars3Icon,
	UsersIcon,
} from "@heroicons/react/24/solid";
import { useParams } from "react-router-dom";
import QuizSettings from "./QuizSettings";
import QuizQuestions from "./QuizQuestions/List";
import { useState } from "react";
import GroupedQuestions from "./GroupedQuestions/List";
import Participants from "./Participants/List";

export type Quiz = {
	id?: number;
	title: string;
	description: string | null;
	category: number | null;
	start_time: Date | null;
	duration: number;
	end_time: Date | null;
	access: string;
	has_random_questions: boolean;
	has_random_options: boolean;
	grouped_questions: boolean;
	attempts: number;
	total_questions: number;
};

const QuizEdit = () => {
	const { quizId } = useParams();
	const [quiz, setQuiz] = useState<Quiz | null>(null);

	return (
		<div className="flex flex-grow ml-60 mt-4">
			<Tabs className="w-full" value="settings">
				<TabsHeader>
					<Tab key="settings" value="settings">
						<div className="flex items-center gap-2">
							<AdjustmentsHorizontalIcon className="w-5 h-5" />
							{"Settings"}
						</div>
					</Tab>
					<Tab
						key="questions"
						value="questions"
						disabled={quizId === "0"}
					>
						<div className="flex items-center gap-2">
							<Bars3Icon className="w-5 h-5" />
							{"Questions"}
						</div>
					</Tab>
					<Tab
						key="participants"
						value="participants"
						disabled={
							quiz?.access === "public" || quizId === "0"
						}
					>
						<div className="flex items-center gap-2">
							<UsersIcon className="w-5 h-5" />
							{"Participants"}
						</div>
					</Tab>
				</TabsHeader>
				<TabsBody>
					<TabPanel key="settings" value="settings">
						<QuizSettings
							quizId={Number(quizId)}
							quiz={quiz}
							setQuiz={setQuiz}
						/>
					</TabPanel>
					<TabPanel key="questions" value="questions">
						{quizId !== "0" &&
							(quiz?.grouped_questions ? (
								<GroupedQuestions quizId={Number(quizId)} />
							) : (
								<QuizQuestions quizId={Number(quizId)} />
							))}
					</TabPanel>
					<TabPanel key="participants" value="participants">
						{quizId && <Participants quizId={Number(quizId)} />}
					</TabPanel>
				</TabsBody>
			</Tabs>
		</div>
	);
};

export default QuizEdit;
