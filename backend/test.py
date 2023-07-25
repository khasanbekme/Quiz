import openpyxl

questions = [
    {
        "question_text": "What is the capital of France?",
        "option_1": "Paris",
        "option_2": "London",
        "option_3": "Rome",
        "option_4": "Berlin",
    },
    {
        "question_text": "Which continent is home to the Sahara Desert?",
        "option_1": "Africa",
        "option_2": "Asia",
        "option_3": "South America",
        "option_4": "Europe",
    },
    {
        "question_text": "What is the longest river in the world?",
        "option_1": "Nile",
        "option_2": "Amazon",
        "option_3": "Yangtze",
        "option_4": "Mississippi",
    },
    {
        "question_text": "Which country is known as the 'Land of the Rising Sun'?",
        "option_1": "Japan",
        "option_2": "China",
        "option_3": "India",
        "option_4": "Thailand",
    },
    {
        "question_text": "Which mountain range is located in South America?",
        "option_1": "Andes",
        "option_2": "Rockies",
        "option_3": "Himalayas",
        "option_4": "Alps",
    },
    {
        "question_text": "What is the largest ocean in the world?",
        "option_1": "Pacific Ocean",
        "option_2": "Atlantic Ocean",
        "option_3": "Indian Ocean",
        "option_4": "Arctic Ocean",
    },
    {
        "question_text": "Which African country is known as the 'Pearl of Africa'?",
        "option_1": "Uganda",
        "option_2": "Kenya",
        "option_3": "Tanzania",
        "option_4": "Egypt",
    },
    {
        "question_text": "Which city is located on the banks of the River Thames?",
        "option_1": "London",
        "option_2": "Paris",
        "option_3": "Rome",
        "option_4": "New York City",
    },
    {
        "question_text": "Which country is famous for the Great Barrier Reef?",
        "option_1": "Australia",
        "option_2": "Brazil",
        "option_3": "Canada",
        "option_4": "Mexico",
    },
    {
        "question_text": "What is the largest country by land area?",
        "option_1": "Russia",
        "option_2": "China",
        "option_3": "United States",
        "option_4": "Brazil",
    },
    {
        "question_text": "Which city is located at the mouth of the Amazon River?",
        "option_1": "Belem",
        "option_2": "Manaus",
        "option_3": "Sao Paulo",
        "option_4": "Rio de Janeiro",
    },
    {
        "question_text": "Which country is known for its tulips, windmills, and wooden shoes?",
        "option_1": "Netherlands",
        "option_2": "Italy",
        "option_3": "Spain",
        "option_4": "Sweden",
    },
    {
        "question_text": "What is the capital of Canada?",
        "option_1": "Ottawa",
        
        "option_2": "Toronto",
        "option_3": "Vancouver",
        "option_4": "Montreal",
    },
    {
        "question_text": "Which country is located on the Iberian Peninsula?",
        "option_1": "Spain",
        "option_2": "Italy",
        "option_3": "Greece",
        "option_4": "Portugal",
    },
    {
        "question_text": "What is the highest mountain in Africa?",
        "option_1": "Mount Kilimanjaro",
        "option_2": "Mount Everest",
        "option_3": "Mount McKinley",
        "option_4": "Mount Fuji",
    },
    {
        "question_text": "Which country is famous for its pyramids?",
        "option_1": "Egypt",
        "option_2": "Mexico",
        "option_3": "Greece",
        "option_4": "China",
    },
    {
        "question_text": "Which city is located in both Europe and Asia?",
        "option_1": "Istanbul",
        "option_2": "Athens",
        "option_3": "Moscow",
        "option_4": "Berlin",
    },
    {
        "question_text": "Which country is known as the 'Land Down Under'?",
        "option_1": "Australia",
        "option_2": "New Zealand",
        "option_3": "South Africa",
        "option_4": "Argentina",
    },
    {
        "question_text": "What is the capital of Brazil?",
        "option_1": "Brasilia",
        "option_2": "Rio de Janeiro",
        "option_3": "Sao Paulo",
        "option_4": "Buenos Aires",
    },
    {
        "question_text": "Which country is the largest producer of oil?",
        "option_1": "Saudi Arabia",
        "option_2": "United States",
        "option_3": "Russia",
        "option_4": "China",
    },
    {
        "question_text": "Which city is known as the 'Eternal City'?",
        "option_1": "Rome",
        "option_2": "Paris",
        "option_3": "Athens",
        "option_4": "Cairo",
    },
]


def export_to_excel(questions, filename):
    workbook = openpyxl.Workbook()
    sheet = workbook.active

    # Write headers
    sheet["A1"] = "Question"
    sheet["B1"] = "Correct Option"
    sheet["C1"] = "Option 2"
    sheet["D1"] = "Option 3"
    sheet["E1"] = "Option 4"

    # Write questions and options
    for index, question in enumerate(questions):
        row = index + 2
        sheet[f"A{row}"] = question["question_text"]
        sheet[f"B{row}"] = question["option_1"]
        sheet[f"C{row}"] = question["option_2"]
        sheet[f"D{row}"] = question["option_3"]
        sheet[f"E{row}"] = question["option_4"]

    # Save the workbook
    workbook.save(filename)

    print(f"Questions exported to {filename} successfully.")


# Export questions to an Excel file
filename = "questions.xlsx"
export_to_excel(questions, filename)