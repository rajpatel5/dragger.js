// Used for examples.html page (code tab navigation menu)
function onTabClick(event) {
  let activeTabs = document.querySelectorAll(".active");
  let name = event.target.href.split("#")[1].split("-")[0];

  activeTabs.forEach(function (tab) {
    if (tab.id.includes(name)) {
      tab.classList.remove("active");
    }
  });

  // Activate new tab and panel
  event.target.parentElement.className += " active";
  document.getElementById(event.target.href.split("#")[1]).className += " active";
  event.preventDefault();
}

/* Tabs for each example */
const elementDraggable = document.getElementsByClassName("draggable-nav")[0];
elementDraggable.addEventListener("click", onTabClick, false);

const elementDroppable = document.getElementsByClassName("droppable-nav")[0];
elementDroppable.addEventListener("click", onTabClick, false);

const elementSortable = document.getElementsByClassName("sortable-nav")[0];
elementSortable.addEventListener("click", onTabClick, false);

const elementSlider = document.getElementsByClassName("slider-nav")[0];
elementSlider.addEventListener("click", onTabClick, false);

const elementRotatable = document.getElementsByClassName("rotatable-nav")[0];
elementRotatable.addEventListener("click", onTabClick, false);

/*
 * Examples
 */
const draggable = new Draggable(".draggable", true);
const droppable = new Droppable(".droppable", ".droppable-container");
const sortable = new Sortable(".sortable", ".sortable-container", [1, 4]);
const draggableSlider = new DraggableSlider(".slider", ".slider-container");

function examples() {
  // Draggable Example
  draggable.addListeners();

  // Droppable Example
  droppable.addListeners();

  // Sortable Example
  sortable.addListeners();

  // DraggableSlider Example
  draggableSlider.addListeners();

  // Rotatable Example
  $(document).ready(function () {
    $(".rotatable").rotatable({
      imgSequencePath: "./images/",
      numOfImgs: 37,
      imgExt: "png",
    });
  });
}

examples();
