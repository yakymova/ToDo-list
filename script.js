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
    }
}

class Task {
    constructor(text) {
        this.text = text;
        this.isDone = false;
    }
}

class TasksListView {
    constructor(element) {
        this.element = element;
    }

    #drawList(tasksElements) {
        this.element.innerHTML = "";

        tasksElements.forEach(taskElement => {
            taskElement.createIn(this.element);
        });
    }

    drawAll() {
        let taskElements = [];
        let tasks = dataService.allTasks;
        if (tasks.length == 0) return;

        tasks.forEach(task => {
            taskElements.push(new TaskView(task))
        });
        this.#drawList(taskElements);
    }

    drawNotCompleted() {
        let taskElements = [];
        let tasks = dataService.notCompletedTasks;
        if (tasks.length == 0) return;

        tasks.forEach(task => {
            taskElements.push(new TaskView(task))
        });
        this.#drawList(taskElements);
    }
}

class TaskView {
    constructor(task) {
        this.task = task;
    }

    createIn(element) {
        let div = document.createElement("div");
        div.classList.add("task");

        let input = document.createElement("input");
        input.type = "checkbox";
        input.classList.add("custom-checkbox");
        input.addEventListener("click", this.changeState.bind(this, div));

        let p = document.createElement("p");
        p.classList.add("task__text");
        p.innerText = this.task.text;

        div.append(input);
        div.append(p);

        if (this.task.isDone) {
            div.classList.add("completed");
            input.checked = true;
        }

        let btn = document.createElement('button');
        btn.classList.add("task__delete-btn");
        btn.addEventListener('click', this.deleteTast.bind(this, div));
        div.append(btn);

        element.append(div);
    }

    changeState(element) {
        this.task.isDone = !this.task.isDone;
        dataService.save();
        element.classList.toggle("completed");
    }

    deleteTast(element) {
        element.remove();
        dataService.delete(this.task);
    }
}


let taskNameInput = document.querySelector("#task-text-input");
let addTaskButton = document.querySelector("#add-task-btn");
let startMessage = document.querySelector("#start-message");
let showAllButton = document.querySelector("#show-all-btn");
let showNotCompletedButton = document.querySelector("#show-not-completed-btn");
let taskList = document.querySelector(".task-list");

dataService.open();
let tasksListView = new TasksListView(taskList);

window.addEventListener("load", function () {
    tasksListView.drawAll();
});

showAllButton.addEventListener("click", () => tasksListView.drawAll());
showNotCompletedButton.addEventListener("click", () => tasksListView.drawNotCompleted());

addTaskButton.addEventListener("click", addTaskHandler);
taskNameInput.addEventListener("keydown", function (e) {
    if (e.key == "Enter") addTaskHandler();
})

function addTaskHandler() {
    if (taskNameInput.value) {
        if (!startMessage.hidden) startMessage.hidden = true;

        let newTask = new Task(taskNameInput.value);
        dataService.add(newTask);
        tasksListView.drawAll();

        taskNameInput.value = "";
    } else {
        alert("Enter task name");
    }
}