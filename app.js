import QuestionStore from './questionstore';
import { format } from 'path';
export default class QuestionGenerator {
    constructor(options = {}) {
        this.options = options;
    }
    getQuestionData(file) {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.onloadend = function (e) {
                resolve(JSON.parse(e.target.result.toString()));
            }
            reader.onerror = function (error) {
                reject(error);
            }
            reader.onprogress = function (data) {
                console.log(`[${file.name}] Loading [${parseInt(((data.loaded / data.total) * 100), 10)}%]`);
            }
            reader.readAsText(file);
        });
    }
}

(function () {
    window.onload = function () {
        let form = document.querySelector('.needs-validation');
        form.addEventListener("submit", () => {
            event.preventDefault();
            event.stopPropagation();
            form.classList.add('was-validated');

            /* Fetch the Options and Selected File details */
            let qs, totalWeightage = Math.floor(document.getElementById('total').value),
                easy = Math.floor(totalWeightage * (document.getElementById('easy').value / 100)),
                medium = Math.floor(totalWeightage * (document.getElementById('medium').value / 100)),
                hard = Math.floor(totalWeightage * (document.getElementById('hard').value / 100)),
                file = fileUpload.files[0];
            console.log(easy, medium, hard);
            const qg = new QuestionGenerator();
            qg.getQuestionData(file).then((result) => {
                console.log(result);
                qs = new QuestionStore(result.questions);

                /* Filter Questions with respect to the difficulty */
                let easyQuestions = qs.store.filter((q) => q.difficulty === 'easy'),
                    mediumQuestions = qs.store.filter((q) => q.difficulty === 'medium'),
                    hardQuestions = qs.store.filter((q) => q.difficulty === 'hard');

                /* Get all possible sets for question store with respect to difficulty */
                easyQuestions = new Array(1 << easyQuestions.length).fill().map((e1, i) => easyQuestions.filter((e2, j) => i & 1 << j));
                easyQuestions = easyQuestions.filter((q) => q.reduce((sum, val) => val.marks + sum, 0) === easy)[0];
                mediumQuestions = new Array(1 << mediumQuestions.length).fill().map((e1, i) => mediumQuestions.filter((e2, j) => i & 1 << j));
                mediumQuestions = mediumQuestions.filter((q) => q.reduce((sum, val) => val.marks + sum, 0) === medium)[0];
                hardQuestions = new Array(1 << hardQuestions.length).fill().map((e1, i) => hardQuestions.filter((e2, j) => i & 1 << j));
                hardQuestions = hardQuestions.filter((q) => q.reduce((sum, val) => val.marks + sum, 0) === hard)[0];

                /* Acceptance and Failure Cases */
                if (easyQuestions && mediumQuestions && hardQuestions && ((easy + medium + hard) === totalWeightage)) {
                    let ele = document.querySelector(".alert");
                    ele.classList.add('d-none');
                    ele.classList.remove('d-block');
                    document.querySelector(".question-paper").innerHTML = `<h4>Easy Questions:</h4>${JSON.stringify(easyQuestions.map(q => q.question_id))}<br /><h4>Medium Questions:</h4>${JSON.stringify(mediumQuestions.map(q => q.question_id))}<br /><h4>Hard Questions</h4>${JSON.stringify(hardQuestions.map(q => q.question_id))}`;
                } else if ((easy + medium + hard) !== totalWeightage) {
                    let ele = document.querySelector(".alert");
                    ele.classList.remove('d-none');
                    ele.classList.add('d-block');
                    document.querySelector(".question-paper").innerHTML = "";
                    document.querySelector(".error-description").innerHTML = `Cause of the error:<br /><span class=\"error-cause\">Total Sum(${easy+medium+hard}) is not equal to required weightage(${totalWeightage})</span>`;
                } else if (!easyQuestions) {
                    let ele = document.querySelector(".alert");
                    ele.classList.remove('d-none');
                    ele.classList.add('d-block');
                    document.querySelector(".question-paper").innerHTML = "";
                    document.querySelector(".error-description").innerHTML = `Cause of the error:<br /><span class=\"error-cause\">Not able to Find the Easy Questions equals to ${easy}</span>`;
                } else if (!mediumQuestions) {
                    let ele = document.querySelector(".alert");
                    ele.classList.remove('d-none');
                    ele.classList.add('d-block');
                    document.querySelector(".question-paper").innerHTML = "";
                    document.querySelector(".error-description").innerHTML = `Cause of the error:<br /><span class=\"error-cause\">Not able to Find the Medium Questions equals to ${easy}</span>`;
                } else if (!hardQuestions) {
                    let ele = document.querySelector(".alert");
                    ele.classList.remove('d-none');
                    ele.classList.add('d-block');
                    document.querySelector(".question-paper").innerHTML = "";
                    document.querySelector(".error-description").innerHTML = `Cause of the error:<br /><span class=\"error-cause\">Not able to Find the Hard Questions equals to ${easy}</span>`;
                }
            });
        }, false);
        form.addEventListener("reset", function(){
            form.classList.remove('was-validated');
            $("#questionStore").siblings(".custom-file-label").addClass("selected").html("Please Upload Question Store*");
        }, false);
        let fileUpload = document.getElementById("questionStore");
        fileUpload.onchange = function () {
            var fileName = $(this).val().split("\\").pop();
            $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
        }
    }
})();