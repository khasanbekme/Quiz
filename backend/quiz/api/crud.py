from random import sample, shuffle
from datetime import timedelta
from django.utils import timezone
from quiz.models import UserAttempt, QuizInstanceQuestion, QuizInstanceOption, Quiz
from django.db import transaction
import logging


def create_user_attempt(user, quiz: Quiz) -> UserAttempt | None:
    with transaction.atomic():
        try:
            # Create the user attempt instance
            user_attempt = UserAttempt.objects.create(
                quiz=quiz,
                user=user,
            )

            bulk_question_list = []

            if quiz.grouped_questions:
                for group in quiz.question_groups.prefetch_related("group__questions"):
                    # Get questions based on group settings
                    questions = group.group.questions.all()

                    if group.random_questions:
                        questions = sample(list(questions), group.total_questions)
                        question_orders = sample(
                            list(range(group.total_questions)),
                            group.total_questions,
                        )
                    else:
                        question_orders = list(range(len(questions)))

                    for index, question in enumerate(questions):
                        bulk_question_list.append(
                            QuizInstanceQuestion(
                                user_attempt=user_attempt,
                                group=group,
                                question=question,
                                question_order=question_orders[index],
                                score=group.point,
                            )
                        )
            else:
                # Quiz does not have grouped questions
                quiz_questions = quiz.quiz_questions.all()

                if quiz.has_random_questions:
                    quiz_questions = sample(list(quiz_questions), quiz.total_questions)
                    question_orders = sample(list(range(quiz.total_questions)), quiz.total_questions)
                else:
                    quiz_questions = list(quiz_questions)
                    question_orders = list(range(len(quiz_questions)))

                for index, quiz_question in enumerate(quiz_questions):
                    bulk_question_list.append(
                        QuizInstanceQuestion(
                            user_attempt=user_attempt,
                            question=quiz_question.question,
                            question_order=question_orders[index],
                            score=quiz_question.score,
                        )
                    )

            QuizInstanceQuestion.objects.bulk_create(bulk_question_list)

            created_questions = user_attempt.instance_questions.select_related(
                "group"
            ).prefetch_related("question__options")
            bulk_options_list = []

            for new_question in created_questions:
                options = list(new_question.question.options.all())

                if (
                    quiz.grouped_questions
                    and new_question.group.random_options
                    or quiz.has_random_options
                ):
                    shuffle(options)

                for index, option in enumerate(options):
                    bulk_options_list.append(
                        QuizInstanceOption(
                            question_instance=new_question,
                            option=option,
                            option_order=index,
                        )
                    )
            QuizInstanceOption.objects.bulk_create(bulk_options_list)

            # Calculate the end time based on the quiz duration
            start_time = timezone.localtime()
            user_attempt.started_at = start_time
            user_attempt.end_time = min(start_time + timedelta(minutes=quiz.duration), quiz.end_time)
            user_attempt.save()

            return user_attempt
        except Exception as e:
            logging.exception(e)
            return None
