import Question from './question';
export default class QuestionStore {
    constructor(store = []) {
        this.store = [];
        store.forEach((val, index) => {
            this.store.push(new Question(val));
        });
    }
}