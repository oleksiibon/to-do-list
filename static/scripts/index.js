function renderTasks(listName) {
  if (Number.isNaN(+listName)) {
    listName = currentList;
  }
  localStorage.setItem("currentList", listName);
  document.getElementById("tasks-box").innerHTML = "";
  fetch(`http://localhost:3000/tasks?listId=${ listName }`, { headers: { "Content-Type": "application/json" } })
    .then(response => {
      return response.json();
    })
    .then(data => {
      data.forEach((e, index) => {
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
      })
    })

}

function renderLists() {
  localStorage.setItem("currentList", currentList);
  document.getElementById("lists-box").innerHTML = "";
  fetch(`http://localhost:3000/lists`, { headers: { "Content-Type": "application/json" } })
    .then(response => {
      return response.json();
    })
    .then(data => {
      data.forEach((e, index) => {
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
      })
    })
}

function addTask() {
  let task = document.getElementById("task").value;
  let obj = { name: task, isDone: false, listId: currentList };
  let body = JSON.stringify(obj);
  fetch("http://localhost:3000/tasks", { method: "POST", body: body, headers: { "Content-Type": "application/json" } })
    .then(() => {
      document.getElementById("task").value = "";
      renderTasks(currentList);
    })

}

function doDone(e) {
  const id = e.target.parentElement.getAttribute('index');
  const isDone = e.target.parentElement.getAttribute('isDone');
  let done = isDone === "false";
  const body = JSON.stringify({
    isDone: done
  });
  fetch(`http://localhost:3000/tasks/${ id }`, {
    method: "PATCH",
    body: body,
    headers: { "Content-Type": "application/json" }
  })
    .then(() => {
      renderTasks(currentList);
    });
}

function deleteTask(e) {
  const id = e.target.parentElement.getAttribute('index');
  fetch(`http://localhost:3000/tasks/${ id }`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" }
  })
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
    if (event.key === "Enter") {
      approveChange(event);
    } else if (event.key === "Escape") {
      event.preventDefault();
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
  const body = JSON.stringify({
    name: task
  });
  fetch(`http://localhost:3000/tasks/${ id }`, {
    method: "PATCH",
    body: body,
    headers: { "Content-Type": "application/json" }
  })
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
  fetch("http://localhost:3000/lists", { method: "POST", body: str, headers: { "Content-Type": "application/json" } })
    .then(data => data.json())
    .then((data) => {
      document.getElementById("list").value = "";
      if (currentList === -1) {
        currentList = data.id;
      }
      renderLists();
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
  fetch(`http://localhost:3000/lists/${ listId }`, { method: "DELETE" })
    .then(() => {
      console.log(currentList, listId);
      if (currentList === listId) {
        currentList = -1;
        document.getElementById("tasks-box").innerHTML = "";
      }
      renderLists();
    })

}


let currentList = -1;
let tasks = [];


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



