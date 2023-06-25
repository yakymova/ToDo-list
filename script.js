let dataService = {
    tasks: [],

    get allTasks() {
        return this.tasks;
    },

    get notCompletedTasks() {
        return this.tasks.filter(task => task.isDone == false);
    },

    add(task) {
        this.tasks.push(task);
        this.save();
    },

    save() {
        localStorage.setItem("tasks", JSON.stringify(this.tasks));
    },

    open() {
        this.tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    },

    delete(task) {
        let index = this.tasks.indexOf(task);
        this.tasks.splice(index, 1);
        this.save();
    },

    deleteAllCompleted() {
        this.tasks = this.tasks.filter(task => task.isDone == false);
        this.save();
    }
}

class Task {
    constructor(text) {
        this.text = text;
        this.isDone = false;
    }
}

class TasksListView {
    constructor(element, progressBlock, textField, fillField) {
        this.element = element;
        this.progressCompletedBlock = progressBlock;
        this.textProgressCompleted = textField;
        this.fillProgressCompleted = fillField;
    }

    #drawList(tasksElements) {
        this.element.innerHTML = "";

        tasksElements.forEach(taskElement => {
            taskElement.createIn(this.element, this.showProgressOfCompletedTasks.bind(this));
        });

        this.progressCompletedBlock.classList.remove("hidden");
    }

    drawAll() {
        let taskElements = [];
        let tasks = dataService.allTasks;
        // if (tasks.length == 0) return;

        if (tasks.length === 0) {
            this.element.innerHTML = '<p>No new tasks</p>';
            return;
        }

        tasks.forEach(task => {
            taskElements.push(new TaskView(task))
        });
        this.#drawList(taskElements);
    }

    drawNotCompleted() {
        let taskElements = [];
        let tasks = dataService.notCompletedTasks;
        // if (tasks.length == 0) return;

        if (tasks.length === 0) {
            this.element.innerHTML = '<p>No unfinished tasks</p>';
            return;
        }

        tasks.forEach(task => {
            taskElements.push(new TaskView(task))
        });
        this.#drawList(taskElements);
    }

    calculateProgressOfCompletedTasks() {
        let allTasks = dataService.allTasks.length;
        let width, completedTasks;

        if (allTasks === 0) {
            width = '0%';
            completedTasks = 0;
        }
        else {
            completedTasks = allTasks - dataService.notCompletedTasks.length;
            width = (completedTasks / allTasks * 100) + '%';
        }

        return { allTasks, completedTasks, width };
    }

    showProgressOfCompletedTasks() {
        let { allTasks, completedTasks, width } = this.calculateProgressOfCompletedTasks();

        if (allTasks === 0) {
            this.progressCompletedBlock.classList.add("hidden");
            return;
        }

        let text = `${completedTasks} of ${allTasks} tasks done`;

        this.textProgressCompleted.textContent = text;
        this.fillProgressCompleted.style.width = width;
    }
}

class TaskView {
    constructor(task) {
        this.task = task;
        this.blurEventOccurred = false;
    }

    createIn(element, showProgress) {

        let div = document.createElement("div");
        div.classList.add("task");

        let input = document.createElement("input");
        input.type = "checkbox";
        input.classList.add("custom-checkbox");
        input.addEventListener("click", this.changeState.bind(this, div, showProgress));

        if (this.task.isDone) {
            div.classList.add("completed");
            input.checked = true;
        }

        div.append(input);

        let p = document.createElement("p");
        p.classList.add("task__text");
        p.innerText = this.task.text;

        let btnEdit = document.createElement('button');
        btnEdit.classList.add("task__edit-btn");
        btnEdit.addEventListener('click', this.editTask.bind(this, div));

        p.onblur = () => {
            this.task.text = p.innerText;
            dataService.save();

            p.contentEditable = false;
            this.blurEventOccurred = true;
            btnEdit.classList.remove("btn-save-change");
        }

        let btnDelete = document.createElement('button');
        btnDelete.classList.add("task__delete-btn");
        btnDelete.addEventListener('click', this.deleteTask.bind(this, div, showProgress));

        div.append(p);
        div.append(btnEdit);
        div.append(btnDelete);
        element.append(div);

        showProgress();
    }

    changeState(element, showProgress) {
        this.task.isDone = !this.task.isDone;
        dataService.save();
        element.classList.toggle("completed");
        showProgress();
    }

    editTask(element) {
        let btn = element.querySelector(".task__edit-btn");

        if (!this.blurEventOccurred) btn.classList.toggle("btn-save-change");
        else this.blurEventOccurred = false;

        if (!btn.classList.contains("btn-save-change")) return;

        let textField = element.querySelector(".task__text");
        textField.contentEditable = true;

        const selection = window.getSelection();
        const range = document.createRange();
        selection.removeAllRanges();
        range.selectNodeContents(textField);
        range.collapse(false);
        selection.addRange(range);
        textField.focus();
    }

    deleteTask(element, showProgress) {
        element.remove();
        dataService.delete(this.task);
        showProgress();
    }
}


let taskNameInput = document.querySelector("#task-text-input");
let addTaskButton = document.querySelector("#add-task-btn");
let startMessage = document.querySelector("#start-message");
let showAllButton = document.querySelector("#show-all-btn");
let showNotCompletedButton = document.querySelector("#show-not-completed-btn");
let taskList = document.querySelector(".task-list");
let taskListFooter = document.querySelector(".task-list-footer");
let progressCompletedTasksText = document.querySelector("#progress-text");
let progressCompletedTasksFillColor = document.querySelector("#progress-fill-color");
let deleteAllCompletedButton = document.querySelector("#delete-all-completed-tasks");

dataService.open();
let tasksListView = new TasksListView(taskList, taskListFooter, progressCompletedTasksText, progressCompletedTasksFillColor);

window.addEventListener("load", function () {
    tasksListView.drawAll();
    tasksListView.showProgressOfCompletedTasks();

});

showAllButton.addEventListener("click", () => tasksListView.drawAll());
showNotCompletedButton.addEventListener("click", () => tasksListView.drawNotCompleted());
deleteAllCompletedButton.addEventListener('click', () => {
    dataService.deleteAllCompleted();
    tasksListView.drawAll();
    tasksListView.showProgressOfCompletedTasks();
});

addTaskButton.addEventListener("click", addTaskHandler);
taskNameInput.addEventListener("keydown", function (e) {
    if (e.key == "Enter") addTaskHandler();
})

function addTaskHandler() {
    if (taskNameInput.value) {
        // if (!startMessage.hidden) {
        //     startMessage.hidden = true;
        //     // taskListFooter.style.display = 'flex';
        // }

        let newTask = new Task(taskNameInput.value);
        dataService.add(newTask);
        tasksListView.drawAll();

        taskNameInput.value = "";
    } else {
        alert("Enter task name");
    }
}