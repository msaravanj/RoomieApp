package com.myrestapp.roomie.enums;

public enum LifestyleQuestion {

    IS_SMOKER("Pušiš li cigarete ili druge duhanske proizvode? (DA / NE)"),
    HAS_PETS("Imaš li kućne ljubimce ili planiraš imati ljubimca u stanu? (DA / NE)"),
    HOBBIES("Koji su tvoji hobiji ili aktivnosti u slobodno vrijeme?"),
    BED_TIME("U koliko sati najčešće ideš spavati? (HH:mm)"),
    WAKE_UP_TIME("U koliko sati se najčešće budiš? (HH:mm)"),
    CLEANLINESS("Koliko ti je važna čistoća u stanu? (1–5)"),
    SOCIALITY( "Koliko si društvena osoba u zajedničkom prostoru? (1–5)"),
    WORK_SCHEDULE("Kakav je tvoj radni ili studijski raspored?"),
    NUTRITION("Kako bi opisao/la svoje prehrambene navike?");

    private String questionText;

    LifestyleQuestion(String questionText) {
        this.questionText = questionText;
    }

    public String getQuestionText() {
        return questionText;
    }

}
