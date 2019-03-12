
const listService = new CrudService("http://localhost:3000/lists");
const taskService = new TaskService("http://localhost:3000/tasks");

function renderTasks(listName) {
  if (Number.isNaN(+listName)) {
    listName = currentList;
  }
  localStorage.setItem("currentList", listName);
  document.getElementById("tasks-box").innerHTML = "";
  taskService.getTaskForList(listName)
    .then(data => {
      data.forEach((e, index) => {
        drawTask(e, index)
      })
    })

}

function renderLists() {
  localStorage.setItem("currentList", currentList);
  document.getElementById("lists-box").innerHTML = "";
  listService.getAll()
    .then(data => {
      data.forEach((e, index) => {
        drawList(e, index)
      })
    })
}

function drawTask(e, index) {
  let newTask = document.createElement("div");

  let newTaskText = document.createElement("span");
  newTaskText.innerHTML = (index + 1) + ": " + e.name;
  newTaskText.onclick = doDone;
  if (e.isDone) {
    newTaskText.className = 'done';
  }

  let changeButton = document.createElement("button");
  changeButton.display = "inline-block";
  changeButton.innerText = "Change";
  changeButton.className = "change-btn";
  changeButton.onclick = changeTask;

  let deleteButton = document.createElement("button");
  deleteButton.display = "inline-block";
  deleteButton.className = "delete-btn";
  deleteButton.innerText = "Delete";
  deleteButton.onclick = deleteTask;

  newTask.setAttribute("index", e.id);
  newTask.setAttribute("isDone", e.isDone);

  newTask.appendChild(newTaskText);
  newTask.appendChild(changeButton);
  newTask.appendChild(deleteButton);

  document.getElementById("tasks-box").appendChild(newTask);
}

function drawList(e, index) {
  let newList = document.createElement("div");
  if (e.id === +currentList) {
    newList.id = "current-list";
  }
  newList.setAttribute("listId", e.id);

  let list = document.createElement("span");
  list.innerText = (index + 1) + ": " + e.name;
  list.onclick = changeList;

  let deleteButton = document.createElement("button");
  deleteButton.innerText = "Delete";
  deleteButton.className = "delete-btn";
  deleteButton.onclick = deleteList;

  newList.appendChild(list);
  newList.appendChild(deleteButton);

  document.getElementById("lists-box").appendChild(newList);
}

function addTask() {
  let task = document.getElementById("task").value;
  let obj = { name: task, isDone: false, listId: currentList };
  let body = JSON.stringify(obj);
 taskService.add(body)
    .then(() => {
      document.getElementById("task").value = "";
      renderTasks(currentList);
    })

}

function doDone(e) {
  const id = e.target.parentElement.getAttribute('index');
  const isDone = e.target.parentElement.getAttribute('isDone');
  let done = isDone === "false";
  const body = JSON.stringify({ isDone: done });
  taskService.change(id, body)
    .then(() => {
      renderTasks(currentList);
    });
}

function deleteTask(e) {
  const id = e.target.parentElement.getAttribute('index');
  taskService.delete(id)
    .then(() => {
      renderTasks(currentList);
    });
}

function changeTask(e) {
  let parent = e.target.parentElement;
  let task = parent.getElementsByTagName("span")[0].innerHTML.split(" ").slice(1).join(" ");
  parent.innerHTML = "";

  let inputTask = document.createElement("input");
  inputTask.value = task;
  inputTask.className = 'task-input';
  inputTask.id = 'change-task';
  inputTask.addEventListener("keyup", (event) => {
    event.preventDefault();
    if (event.key === "Enter") {
      approveChange(event);
    } else if (event.key === "Escape") {
      renderTasks(event);
    }
  });

  let changeButton = document.createElement("button");
  changeButton.display = "inline-block";
  changeButton.className = "add-btn";
  changeButton.innerText = "OK";
  changeButton.onclick = approveChange;

  let backButton = document.createElement("button");
  backButton.display = "inline-block";
  backButton.className = "back-btn";
  backButton.innerText = "Back";
  backButton.onclick = renderTasks;

  parent.appendChild(inputTask);
  parent.appendChild(changeButton);
  parent.appendChild(backButton);

  inputTask.focus();

}

function approveChange(e) {
  const id = e.target.parentElement.getAttribute('index');
  let task = document.getElementById("change-task").value;
  const body = JSON.stringify({ name: task });
  taskService.change(id, body)
    .then(() => {
      renderTasks(currentList);
    });
}

function addList() {
  let name = document.getElementById("list").value;
  let body = {
    name: name
  };
  let str = JSON.stringify(body);
  listService.add(str)
    .then(data =>{
      document.getElementById("list").value = "";
      currentList = data.id;
      renderLists();
      renderTasks(currentList);
    })
}

function changeList(e) {
  const list = e.target.parentElement.getAttribute('listId');
  currentList = +list;
  renderLists();
  renderTasks(list);
}

function deleteList(e) {
  const listId = +e.target.parentElement.getAttribute('listId');
  listService.delete(listId)
    .then(() => {
      if (currentList === listId) {
        currentList = -1;
        document.getElementById("tasks-box").innerHTML = "";
      }
      renderLists();
      renderTasks(currentList)
    });
}

let currentList = -1;

document.getElementById("task").addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    addTask();
  }
});

document.getElementById("list").addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    addList();
  }
});

currentList = localStorage.getItem("currentList") || -1;
renderLists();
renderTasks(currentList);



