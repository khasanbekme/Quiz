import openpyxl

questions = [
    {
        "question_text": "What is the atomic number of an element that has 8 protons, 8 neutrons, and 8 electrons?",
        "option_1": "14",
        "option_2": "16",
        "option_3": "8",
        "option_4": "12",
        "option_5": "20",
    },
    {
        "question_text": "Which of the following elements is a noble gas?",
        "option_1": "Oxygen",
        "option_2": "Chlorine",
        "option_3": "Helium",
        "option_4": "Sulfur",
        "option_5": "Nitrogen",
    },
    {
        "question_text": "The process of converting a gas into a liquid is called:",
        "option_1": "Condensation",
        "option_2": "Evaporation",
        "option_3": "Sublimation",
        "option_4": "Deposition",
        "option_5": "Vaporization",
    },
    {
        "question_text": "Which type of bond involves the sharing of electrons between atoms?",
        "option_1": "Ionic bond",
        "option_2": "Covalent bond",
        "option_3": "Metallic bond",
        "option_4": "Hydrogen bond",
        "option_5": "Dipole-dipole bond",
    },
    {
        "question_text": "What is the molar mass of water (H2O)?",
        "option_1": "16 g/mol",
        "option_2": "18 g/mol",
        "option_3": "20 g/mol",
        "option_4": "22 g/mol",
        "option_5": "24 g/mol",
    },
    {
        "question_text": "Which of the following is NOT a type of radioactivity?",
        "option_1": "Alpha decay",
        "option_2": "Beta decay",
        "option_3": "Gamma decay",
        "option_4": "Delta decay",
        "option_5": "Positron decay",
    },
    {
        "question_text": "What is the pH of a solution with a hydrogen ion concentration of 1 x 10^-4 M?",
        "option_1": "1",
        "option_2": "4",
        "option_3": "7",
        "option_4": "10",
        "option_5": "14",
    },
    {
        "question_text": "The process of a substance changing directly from a solid to a gas is called:",
        "option_1": "Condensation",
        "option_2": "Evaporation",
        "option_3": "Sublimation",
        "option_4": "Deposition",
        "option_5": "Vaporization",
    },
    {
        "question_text": "Which element has the electron configuration 1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d¹⁰ 4p⁶ 5s² 4d¹⁰?",
        "option_1": "Iron (Fe)",
        "option_2": "Copper (Cu)",
        "option_3": "Chromium (Cr)",
        "option_4": "Zinc (Zn)",
        "option_5": "Nickel (Ni)",
    },
    {
        "question_text": "What is the oxidation state of oxygen in hydrogen peroxide (H2O2)?",
        "option_1": "+1",
        "option_2": "-1",
        "option_3": "+2",
        "option_4": "-2",
        "option_5": "0",
    },
    {
        "question_text": "Which of the following is NOT a colligative property of a solution?",
        "option_1": "Vapor pressure lowering",
        "option_2": "Boiling point elevation",
        "option_3": "Freezing point depression",
        "option_4": "Osmotic pressure",
        "option_5": "Surface tension",
    },
    {
        "question_text": "What is the empirical formula of a compound that contains 40% carbon, 6.7% hydrogen, and 53.3% oxygen by mass?",
        "option_1": "CH2O",
        "option_2": "C2H4O2",
        "option_3": "C3H6O3",
        "option_4": "C4H8O4",
        "option_5": "C5H10O5",
    },
    {
        "question_text": "Which type of reaction involves the combination of two or more substances to form a single product?",
        "option_1": "Decomposition",
        "option_2": "Combustion",
        "option_3": "Synthesis",
        "option_4": "Single replacement",
        "option_5": "Double replacement",
    },
    {
        "question_text": "What is the name of the process that produces ATP in the mitochondria of cells?",
        "option_1": "Glycolysis",
        "option_2": "Fermentation",
        "option_3": "Krebs cycle",
        "option_4": "Electron transport chain",
        "option_5": "Photosynthesis",
    },
    {
        "question_text": "Which of the following substances has the highest boiling point?",
        "option_1": "Methane (CH4)",
        "option_2": "Ethanol (C2H5OH)",
        "option_3": "Propane (C3H8)",
        "option_4": "Butane (C4H10)",
        "option_5": "Pentane (C5H12)",
    },
    {
        "question_text": "The process of a gas changing directly to a solid is called:",
        "option_1": "Condensation",
        "option_2": "Evaporation",
        "option_3": "Sublimation",
        "option_4": "Deposition",
        "option_5": "Vaporization",
    },
    {
        "question_text": "Which of the following elements is a halogen?",
        "option_1": "Sodium",
        "option_2": "Calcium",
        "option_3": "Potassium",
        "option_4": "Fluorine",
        "option_5": "Magnesium",
    },
    {
        "question_text": "How many sigma (σ) and pi (π) bonds are present in the molecule H2C=CH2?",
        "option_1": "2 σ-bonds, 1 π-bond",
        "option_2": "3 σ-bonds, 0 π-bonds",
        "option_3": "1 σ-bond, 2 π-bonds",
        "option_4": "2 σ-bonds, 2 π-bonds",
        "option_5": "1 σ-bond, 1 π-bond",
    },
    {
        "question_text": "Which of the following is a strong acid?",
        "option_1": "Acetic acid (CH3COOH)",
        "option_2": "Hydrochloric acid (HCl)",
        "option_3": "Phosphoric acid (H3PO4)",
        "option_4": "Carbonic acid (H2CO3)",
        "option_5": "Sulfurous acid (H2SO3)",
    },
    {
        "question_text": "Which of the following is a redox reaction?",
        "option_1": "2H2O2 → 2H2O + O2",
        "option_2": "NaCl + AgNO3 → NaNO3 + AgCl",
        "option_3": "2Na + Cl2 → 2NaCl",
        "option_4": "NH3 + HCl → NH4Cl",
        "option_5": "H2O → H2O + H2",
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
    sheet["F1"] = "Option 5"
    sheet["G1"] = "Option 6"
    sheet["H1"] = "Option 7"
    sheet["I1"] = "Option 8"

    # Write questions and options
    for index, question in enumerate(questions):
        row = index + 2
        sheet[f"A{row}"] = question["question_text"]
        sheet[f"B{row}"] = question["option_1"]
        sheet[f"C{row}"] = question["option_2"]
        if question.get("option_3", None):
            sheet[f"D{row}"] = question["option_3"]
        if question.get("option_4", None):
            sheet[f"E{row}"] = question["option_4"]
        if question.get("option_5", None):
            sheet[f"F{row}"] = question["option_5"]
        if question.get("option_6", None):
            sheet[f"G{row}"] = question["option_6"]
        if question.get("option_7", None):
            sheet[f"H{row}"] = question["option_7"]
        if question.get("option_8", None):
            sheet[f"I{row}"] = question["option_8"]

    # Save the workbook
    workbook.save(filename)

    print(f"Questions exported to {filename} successfully.")


# Export questions to an Excel file
filename = "questions.xlsx"
export_to_excel(questions, filename)