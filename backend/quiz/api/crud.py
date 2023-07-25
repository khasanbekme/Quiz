from random import sample, shuffle
from datetime import timedelta
from django.utils import timezone
from quiz.models import UserAttempt, QuizInstanceQuestion, QuizInstanceOption


def create_user_attempt(user, quiz):
    # Calculate the end time based on the quiz duration
    end_time = timezone.now() + timedelta(minutes=quiz.duration)

    # Create the user attempt instance
    user_attempt = UserAttempt.objects.create(
        quiz=quiz,
        user=user,
        started_at=timezone.now(),
        end_time=end_time,
    )

    bulk_question_list = []

    if quiz.grouped_questions:
        # Quiz has grouped questions, get question instances from QuizQuestionGroup
        question_groups = quiz.question_groups.all()

        for group in question_groups:
            # Get questions based on group settings
            questions = group.group.questions.all()

            if group.random_questions:
                questions = sample(list(questions), group.total_questions)
            random_orders = shuffle(list(range(len(questions))))

            for index, question in enumerate(questions):
                bulk_question_list.append(
                    QuizInstanceQuestion(
                        user_attempt=user_attempt,
                        group=group,
                        question=question,
                        question_order=random_orders[index]
                        if group.random_questions
                        else question.order,
                        score=group.point,
                    )
                )

    else:
        # Quiz does not have grouped questions
        quiz_questions = quiz.quiz_questions.all()

        if quiz.has_random_questions:
            quiz_questions = sample(list(quiz_questions), quiz.total_questions)

        random_orders = shuffle(list(range(quiz.total_questions)))

        for index, quiz_question in enumerate(quiz_questions):
            # Create QuizInstanceQuestion instance for each quiz question
            bulk_question_list.append(
                QuizInstanceQuestion(
                    user_attempt=user_attempt,
                    question=quiz_question.question,
                    question_order=random_orders[index]
                    if quiz.has_random_questions
                    else quiz_question.order_number,
                    score=quiz_question.score,
                )
            )

    created_questions = QuizInstanceQuestion.objects.bulk_create(bulk_question_list)
    # prefetch the question options in created question instances
    bulk_options_list = []

    if quiz.grouped_questions:
        for new_question in created_questions:
            if new_question.group.random_options:
                options = new_question.question.options.order_by("?")
            else:
                options = new_question.question.options.all()
            
            for index, option in enumerate(options):
                bulk_options_list.append(
                    QuizInstanceOption(
                        question_instance=new_question,
                        option=option,
                        option_order=index,
                    )
                )
    else:
        for new_question in created_questions:
            if quiz.has_random_options:
                options = new_question.question.options.order_by("?")

    # Create QuizInstanceOption instances based on the question instances
    # question_instances = user_attempt.instance_questions.all()

    # for question_instance in question_instances:
    #     question = question_instance.question

    #     if quiz.has_random_options:
    #         options = question.options.order_by("?")
    #     else:
    #         options = question.options.all()

    #     for option_order, option in enumerate(options, start=1):
    #         # Create QuizInstanceOption instance for each option
    #         QuizInstanceOption.objects.create(
    #             question_instance=question_instance,
    #             option=option,
    #             option_order=option_order,
    #         )

    return user_attempt
