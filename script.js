let addBtn = document.querySelector(".add");
let body = document.querySelector("body");
let ticketContainer = document.querySelector(".ticket-container");
let deleteBtn = document.querySelector(".delete");

let deleteMode = false;
let colors = ["pink", "blue", "green", "black"];

let allFiltersChildren = document.querySelectorAll(".filter div");
let filters = document.querySelectorAll(".filter");

let popupModal = document.querySelector(".popup-modal");
let overlay = document.querySelector(".overlay");
let btnCloseModal = document.querySelector(".close-modal");
let btnOpenModal = document.querySelector(".show-modal");

function openModal() {
  popupModal.classList.remove("hidden");
  overlay.classList.remove("hidden");
}

function closeModal() {
  popupModal.classList.add("hidden");
  overlay.classList.add("hidden");
}

for (let i = 0; i < allFiltersChildren.length; i++) {
  allFiltersChildren[i].addEventListener("click", selectFilter);
}

function selectFilter(e) {
  if (e.target.classList.contains("selected-filter")) {
    e.target.classList.remove("selected-filter");
    loadTasks();
  } else {
    if (document.querySelector(".selected-filter")) {
      document
        .querySelector(".selected-filter")
        .classList.remove("selected-filter");
    }
    e.target.classList.add("selected-filter");
    ticketContainer.innerHTML = "";
    let filterClicked = e.target.classList[0];
    console.log(filterClicked);
    console.log(e.target);
    loadTasks(filterClicked);
  }
}

if (localStorage.getItem("AllTickets") == undefined) {
  let allTickets = {};
  allTickets = JSON.stringify(allTickets);
  localStorage.setItem("AllTickets", allTickets);
}

loadTasks();

deleteBtn.addEventListener("click", function (e) {
  if (e.currentTarget.classList.contains("delete-selected")) {
    e.currentTarget.classList.remove("delete-selected");
    deleteMode = false;
  } else {
    e.currentTarget.classList.add("delete-selected");
    deleteMode = true;
  }
});

addBtn.addEventListener("click", function () {
  deleteBtn.classList.remove("delete-selected");
  deleteMode = false;
  let preModal = document.querySelector(".modal");
  if (preModal != null) return;

  let div = document.createElement("div"); //<div></div>
  div.classList.add("modal"); //<div class="modal"></div>

  div.innerHTML = `
  <div class="task-section">
    <div class="task-inner-container" contenteditable="true" maxLength="10"></div>
  </div>
  <div class="modal-priority-section">
    <div class="priority-inner-container">
      <div class="modal-priority pink"></div>
      <div class="modal-priority blue"></div>
      <div class="modal-priority green"></div>
      <div class="modal-priority black selected"></div>
    </div>
    <div class='close-button'>X</div>
  </div>
</div>`;

  let closeTicket = div.querySelector(".close-button");
  closeTicket.addEventListener("click", function () {
    div.remove();
  });

  let ticketColor = "black";
  let allModalPriority = div.querySelectorAll(".modal-priority");
  for (let i = 0; i < allModalPriority.length; i++) {
    allModalPriority[i].addEventListener("click", function (e) {
      for (let j = 0; j < allModalPriority.length; j++) {
        allModalPriority[j].classList.remove("selected");
      }
      e.currentTarget.classList.add("selected");
      ticketColor = e.currentTarget.classList[1];
      console.log(ticketColor);
    });
  }

  let taskInnerContainer = div.querySelector(".task-inner-container");
  taskInnerContainer.addEventListener("keydown", function (e) {
    if (e.key == "Enter") {
      let id = uid();
      let task = e.currentTarget.innerText;

      // step1: local storage ka data leker aao
      let allTickets = JSON.parse(localStorage.getItem("AllTickets"));

      // step2: usko update kero
      let ticketObj = {
        color: ticketColor,
        taskValue: task,
      };
      allTickets[id] = ticketObj;

      // step3: wapas daal do
      localStorage.setItem("AllTickets", JSON.stringify(allTickets));

      let ticketDiv = document.createElement("div");
      ticketDiv.classList.add("ticket");
      ticketDiv.setAttribute("data-id", id);
      ticketDiv.innerHTML = ` <div data-id="${id}" class="ticket-color ${ticketColor}"></div>
        <div class="ticket-id">
          #${id}
        </div>
        <div data-id="${id}" class="actual-task" contenteditable="true">
          ${task}
        </div>`;

      let ticketColorDiv = ticketDiv.querySelector(".ticket-color");
      let actualTaskDiv = ticketDiv.querySelector(".actual-task");

      actualTaskDiv.addEventListener("input", function (e) {
        let updatedTask = e.currentTarget.innerText;
        let currTicketId = e.currentTarget.getAttribute("data-id");
        let allTickets = JSON.parse(localStorage.getItem("AllTickets"));
        allTickets[currTicketId].taskValue = updatedTask;
        localStorage.setItem("AllTickets", JSON.stringify(allTickets));
        // console.log(updatedTask);
      });

      ticketColorDiv.addEventListener("click", function (e) {
        let currTicketId = e.currentTarget.getAttribute("data-id");
        let currColor = e.currentTarget.classList[1];
        let idx = -1;
        for (let i = 0; i < colors.length; i++) {
          if (colors[i] == currColor) idx = i;
        }
        idx++;
        idx = idx % 4;

        let newColor = colors[idx];

        let allTickets = JSON.parse(localStorage.getItem("AllTickets"));
        allTickets[currTicketId].color = newColor;
        localStorage.setItem("AllTickets", JSON.stringify(allTickets));

        ticketColorDiv.classList.remove(currColor);
        ticketColorDiv.classList.add(newColor);
      });

      ticketDiv.addEventListener("click", function (e) {
        if (deleteMode) {
          let currTicketId = e.currentTarget.getAttribute("data-id");
          openModal();
          overlay.addEventListener("click", closeModal);
          document.addEventListener("keydown", function (event) {
            if (
              event.key == "Escape" &&
              !popupModal.classList.contains("hidden")
            ) {
              closeModal();
            }
          });
          btnCloseModal.addEventListener("click", function () {
            closeModal();
          });
          let cancelBtn = document.querySelector(".cancel");
          let successBtn = document.querySelector(".confirm");
          cancelBtn.addEventListener("click", function () {
            closeModal();
          });

          successBtn.addEventListener("click", function (e) {
            closeModal();
            ticketDiv.remove();
            let allTickets = JSON.parse(localStorage.getItem("AllTickets"));
            delete allTickets[currTicketId];
            localStorage.setItem("AllTickets", JSON.stringify(allTickets));
          });
        }
      });

      ticketContainer.append(ticketDiv);
      div.remove();
    } else if (e.key == "Escape") {
      div.remove();
    }
  });
  body.append(div);
});

function loadTasks(color) {
  let ticketsOnUI = document.querySelectorAll(".ticket");

  for (let i = 0; i < ticketsOnUI.length; i++) {
    ticketsOnUI[i].remove();
  }

  // 1 fetch all tickets data
  let allTickets = JSON.parse(localStorage.getItem("AllTickets"));

  // 2 Create ticket UI for each ticket object
  // 3 Attach Required Listeners
  // 4 Add tickets in grid section of UI
  for (x in allTickets) {
    let currTicketId = x;
    let singleTicketObj = allTickets[x];

    if (color && color != singleTicketObj.color) continue;

    let ticketDiv = document.createElement("div");
    ticketDiv.classList.add("ticket");
    ticketDiv.setAttribute("data-id", currTicketId);
    ticketDiv.innerHTML = ` <div data-id="${currTicketId}" class="ticket-color ${singleTicketObj.color}"></div>
        <div class="ticket-id">
          #${currTicketId}
        </div>
        <div data-id="${currTicketId}" class="actual-task" contenteditable="true">
          ${singleTicketObj.taskValue}
        </div>`;

    let ticketColorDiv = ticketDiv.querySelector(".ticket-color");
    let actualTaskDiv = ticketDiv.querySelector(".actual-task");

    actualTaskDiv.addEventListener("input", function (e) {
      let updatedTask = e.currentTarget.innerText;
      let currTicketId = e.currentTarget.getAttribute("data-id");
      let allTickets = JSON.parse(localStorage.getItem("AllTickets"));
      allTickets[currTicketId].taskValue = updatedTask;
      localStorage.setItem("AllTickets", JSON.stringify(allTickets));
      // console.log(updatedTask);
    });

    ticketColorDiv.addEventListener("click", function (e) {
      let currTicketId = e.currentTarget.getAttribute("data-id");
      let currColor = e.currentTarget.classList[1];
      let idx = -1;
      for (let i = 0; i < colors.length; i++) {
        if (colors[i] == currColor) idx = i;
      }
      idx++;
      idx = idx % 4;

      let newColor = colors[idx];

      let allTickets = JSON.parse(localStorage.getItem("AllTickets"));
      allTickets[currTicketId].color = newColor;
      localStorage.setItem("AllTickets", JSON.stringify(allTickets));

      ticketColorDiv.classList.remove(currColor);
      ticketColorDiv.classList.add(newColor);
    });

    ticketDiv.addEventListener("click", function (e) {
      if (deleteMode) {
        let currTicketId = e.currentTarget.getAttribute("data-id");
        openModal();
        overlay.addEventListener("click", closeModal);
        document.addEventListener("keydown", function (event) {
          if (
            event.key == "Escape" &&
            !popupModal.classList.contains("hidden")
          ) {
            closeModal();
          }
        });
        btnCloseModal.addEventListener("click", function () {
          closeModal();
        });
        let cancelBtn = document.querySelector(".cancel");
        let successBtn = document.querySelector(".confirm");
        cancelBtn.addEventListener("click", function () {
          closeModal();
        });

        successBtn.addEventListener("click", function (e) {
          closeModal();
          ticketDiv.remove();
          let allTickets = JSON.parse(localStorage.getItem("AllTickets"));
          delete allTickets[currTicketId];
          localStorage.setItem("AllTickets", JSON.stringify(allTickets));
        });
      }
    });
    ticketContainer.append(ticketDiv);
  }
}
