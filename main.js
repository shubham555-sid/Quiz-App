const progressBar = document.querySelector(".progress-bar");
const progressText = document.querySelector(".progress-text");

const progress = (value) => {
    const percentage = (value / time) * 100;
    progressBar.style.width = `${percentage}%`;
    progressText.innerHTML = `${value}`;
};

let questions = [],
    time = 30,
    score = 0,
    currentQuestion,
    timer;

const startBtn = document.querySelector(".start");
const numQuestions = document.querySelector("#num-questions");
const category = document.querySelector("#category");
const difficulty = document.querySelector("#difficulty");
const timePerQuestion = document.querySelector("#time");
const quiz = document.querySelector(".quiz");
const startScreen = document.querySelector(".start-screen");

const fetchWithRetry = (url, retries = 3, delay = 1000) => {
    return fetch(url).then((res) => {
        if (!res.ok) {
            if (res.status === 429 && retries > 0) {
                return new Promise((resolve) =>
                    setTimeout(() => resolve(fetchWithRetry(url, retries - 1, delay)), delay)
                );
            }
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
    });
};

const startQuiz = () => {
    const num = numQuestions.value;
    const cat = category.value;
    const diff = difficulty.value;
    // API URL
    const url = `https://opentdb.com/api.php?amount=${num}&category=${cat}&difficulty=${diff}&type=multiple`;

    fetch(url)
        .then((res) => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then((data) => {
            if (data.results && data.results.length > 0) { // Changed data.result.length to data.results.length
                questions = data.results;
                startScreen.classList.add("hide");
                quiz.classList.remove("hide");
                currentQuestion = 1;
                showQuestion(questions[0]);
            } else {
                throw new Error("No questions available. Please try again later.");
            }
        })
        .catch((error) => { // Correctly chained catch block
            console.error("Error fetching quiz data:", error);
            alert("Failed to load quiz. Please try again later.");
        });
};

startBtn.addEventListener("click", startQuiz);

const submitBtn = document.querySelector(".submit");
const nextBtn = document.querySelector(".next");


const showQuestion = (question) => {
    const questionText = document.querySelector(`.question`);
    const answerWrapper = document.querySelector(`.answer-wrapper`);
    const questionNumber = document.querySelector(`.number`);

    questionText.innerHTML = question.question;

    //correct an wrong answers are seperate lets mix them

    const answers = [...question.incorrect_answers, question.correct_answer.toString(),
    ];
    // correct answer will be always as least 
    // lets shuffle the array

    answers.sort(() => Math.random() - 0.5);
    answerWrapper.innerHTML = "";
    answers.forEach((answer) => {
        answerWrapper.innerHTML += `
    <div class="answer ">
                        <span class="text">${answer}</span>
                        <span class="checkbox">
                            <span class="icon">
                                <i class="fas fa-check"></i>
                            </span>
                        </span>
                    </div>`;
    });

    questionNumber.innerHTML = `
  Question <span class="current">${questions.indexOf(question) + 1
        }</span>
        <span class="total">/${questions.length}</span>`;

    // lets add event listener on answer

    const answersDiv = document.querySelectorAll(".answer");
    answersDiv.forEach((answer) => {
        answer.addEventListener("click", () => {
            //if answer not already submited
            if (!answer.classList.contains("checked")) {
                // remove selected from other answer
                answersDiv.forEach((answer) => {
                    answer.classList.remove("selected");
                });
                // add selected on current clicked
                answer.classList.add("selected");
                //after any answer is selected enable submit btn
                submitBtn.disabled = false;
            }
        });
    });

    //after updating question start timer
    time = timePerQuestion.value;
    startTimer(time);
};

const startTimer = (time) => {
    timer = setInterval(() => {
        if (time >= 0) {
            //if timer more than 0 means time remainimg
            //move progress
            progress(time);
            time--;
        } else {
            //if time finishes means less than 0
            checkAnswer();
        }
    }, 1000);
};

submitBtn.addEventListener("click", () => {
    checkAnswer();
});

const checkAnswer = () => {
    // firstclear interval when check answer triggered
    clearInterval(timer);

    if (!questions[currentQuestion - 1]) {
        console.error("No question found for current index.");
        return;
    }

    const selectedAnswer = document.querySelector(".answer.selected");
    // any answer is selected 
    if (selectedAnswer) {
        const answer = selectedAnswer.querySelector(".text");
        if (answer.innerHTML === questions[currentQuestion - 1].correct_answer) {
            //if answer matches with current question correct  answer
            // increase score
            score++;
            //add correct class on selected 
            selectedAnswer.classList.add("correct");
        } else {
            //if wrong selected
            //add wrong class on selected but then also add correct on correct answer
            //correct added lets add wrong on selected 
            selectedAnswer.classList.add("wrong");
            const correctAnswer = document.querySelectorAll(".answer").forEach((answer) => {
                if (
                    answer.querySelector(".text").innerHTML === questions[currentQuestion - 1].correct_answer
                ) {
                    //only add correct class to correct answer
                    answer.classList.add("correct");
                }
            });
        }
    }
    // answer check will be also triggered when time reaches 0
    //what if nothing selected and time finishes
    // lets just add correct on correct answer
    else {
        const correctAnswer = document.querySelectorAll(".answer").forEach((answer) => {
            if (
                answer.querySelector(".text").innerHTML === questions[currentQuestion - 1].correct_answer
            ) {
                //only add correct class to correct answer
                answer.classList.add("correct");
            }
        });
    }
    // lets block user to select further answer
    const answerDiv = document.querySelectorAll(".answer");
    answerDiv.forEach((answer) => {
        answer.classList.add("checked");
        // add checked class on all answer as we check for it when on click answer if its present do nothing
        //also when checked lets dont add hover effect on checkbox
    })

    // after submit show btn to go to next question
    submitBtn.style.display = 'none';
    nextBtn.style.display = 'block';
};

// on next btn click show next question

nextBtn.addEventListener("click", () => {
    nextQuestion();
    // also shoe submit btn on next question and hide next btn
    submitBtn.style.display = 'block';
    nextBtn.style.display = 'none';
});

const nextQuestion = () => {
    // if there is reamining qestion
    if (currentQuestion < questions.length) {
        currentQuestion++;
        //show question
        showQuestion(questions[currentQuestion - 1]);
    } else {
        // if no question remaining
        showScore();
    }
};

const endScreen = document.querySelector(".end-screen");
const finalScore = document.querySelector(".final-score");
const totalScore = document.querySelector(".total-score");

const showScore = () => {
    endScreen.classList.remove("hide");
    quiz.classList.add("hide");
    finalScore.innerHTML = score;
    totalScore.innerHTML = `/${questions.length}`;
};

const restartBtn = document.querySelector(".restart");
restartBtn.addEventListener("click", () => {
    //reload page on click
    window.location.reload();
});